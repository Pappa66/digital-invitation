-- ============================================================
-- Digital Invitation Builder — Migration 0002: Invite Access Tokens
-- Akses halaman /invite/{id} tanpa login untuk pihak yang terikat
-- satu desain (pola WeddingPress), via token unik (?t=...).
-- Jalankan di Supabase SQL Editor SETELAH 0001 (schema.sql).
-- ============================================================

-- 1) TABEL: access_tokens
create table if not exists public.access_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token text not null,
  label text not null default 'Pihak undangan',
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists access_tokens_token_idx on public.access_tokens (token);
create index if not exists access_tokens_project_idx on public.access_tokens (project_id);

-- 2) ROW LEVEL SECURITY
alter table public.access_tokens enable row level security;

-- Hanya pemilik proyek yang boleh mengelola token.
drop policy if exists "access_tokens_manage_own" on public.access_tokens;
create policy "access_tokens_manage_own"
  on public.access_tokens for all
  using (
    exists (select 1 from public.projects p where p.id = access_tokens.project_id and p.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.projects p where p.id = access_tokens.project_id and p.user_id = auth.uid())
  );

-- 3) FUNGSI PUBLIK: validasi token (tanpa sesi login)
-- Mengembalikan info proyek + agama bila token valid & belum kedaluwarsa.
-- Memperbarui last_used_at setiap kali dipakai.
create or replace function public.get_invite_by_token(p_project_id uuid, p_token text)
returns table (project_id uuid, title text, slug text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project public.projects%rowtype;
  v_token public.access_tokens%rowtype;
begin
  select * into v_token
  from public.access_tokens
  where project_id = p_project_id and token = p_token;

  if not found then
    return;
  end if;

  if v_token.expires_at is not null and v_token.expires_at < now() then
    return;
  end if;

  select * into v_project from public.projects where id = p_project_id;
  if not found then
    return;
  end if;

  update public.access_tokens set last_used_at = now() where id = v_token.id;

  return query
    select p.id, p.title, p.slug
    from public.projects p
    where p.id = p_project_id;
end;
$$;

grant execute on function public.get_invite_by_token(uuid, text) to anon, authenticated;

-- 4) FUNGSI SERVER-ONLY: buat token akses untuk pemilik
-- (dipanggil dari server action dengan sesi pemilik, aman).
create or replace function public.ensure_invite_token(p_project_id uuid, p_label text default 'Pihak undangan')
returns table (id uuid, token text, project_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project_id uuid;
begin
  -- Hanya pemilik proyek yang boleh membuat token.
  select p.id into v_project_id
  from public.projects p
  where p.id = p_project_id and p.user_id = v_uid;

  if v_project_id is null then
    return;
  end if;

  -- Token baru selalu dibuat baru agar unik & tak tertebak.
  insert into public.access_tokens (project_id, token, label, created_by)
  values (p_project_id, encode(gen_random_bytes(24), 'hex'), p_label, v_uid)
  returning id, token, project_id into id, token, project_id;

  return next;
end;
$$;

revoke all on function public.ensure_invite_token(uuid, text) from anon, public;
grant execute on function public.ensure_invite_token(uuid, text) to authenticated;

-- 5) PERKUAT rsvps: cegah spam dasar via fungsi validasi di DB
create or replace function public.validate_rsvp()
returns trigger language plpgsql as $$
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  if new.guest_count < 1 or new.guest_count > 10 then
    raise exception 'Jumlah tamu tidak valid';
  end if;
  if new.message is not null and length(new.message) > 500 then
    raise exception 'Pesan terlalu panjang';
  end if;
  new.name := left(btrim(new.name), 80);
  return new;
end;
$$;

drop trigger if exists rsvps_validate on public.rsvps;
create trigger rsvps_validate
  before insert on public.rsvps
  for each row execute function public.validate_rsvp();

-- Catatan: pembatasan frekuensi (mis. maks. 1 RSVP/30 detik per IP)
-- sebaiknya ditangani aplikasi (server action/edge) — lihat rsvp.tsx.