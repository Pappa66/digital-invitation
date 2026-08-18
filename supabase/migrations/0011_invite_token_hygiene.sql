-- ============================================================
-- 0011 INVITE TOKEN HYGIENE + RPC BACA AMAN
-- Perbaikan temuan evaluasi:
--  - Token /invite sebelumnya dibuat BARU setiap kunjungan, tanpa
--    batas waktu & tanpa mekanisme cabut.
--  - Kini: 1 token aktif per proyek (stable link), ada expires_at,
--    ada revoked_at + fungsi revoke, dan token kedaluwarsa dibersihkan.
--  - RPC buku tamu & kelola tamu yang aman (tanpa SELECT publik).
-- Aman untuk rerun: IF NOT EXISTS / CREATE OR REPLACE.
-- ============================================================

-- 1) KOLOM BARU: revoked_at (penanda token dicabut).
alter table public.access_tokens
  add column if not exists revoked_at timestamptz;

-- 2) Data lama: pertahankan satu token aktif per proyek, sisanya cabut
--    (agar unique index berikutnya bisa dibuat pada DB yang sudah terisi).
with ranked as (
  select id,
         row_number() over (
           partition by project_id
           order by last_used_at desc nulls last, created_at desc
         ) as rn
  from public.access_tokens
  where revoked_at is null
)
update public.access_tokens t
set revoked_at = now()
from ranked r
where t.id = r.id and r.rn > 1;

-- 3) UNIQUE INDEX: maksimal satu token aktif per proyek.
drop index if exists access_tokens_one_active_idx;
create unique index if not exists access_tokens_one_active_idx
  on public.access_tokens (project_id)
  where (revoked_at is null);

-- 4) get_invite_by_token: tolak token yang dicabut / kedaluwarsa.
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
  where project_id = p_project_id
    and token = p_token
    and revoked_at is null;

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

-- 5) ensure_invite_token: pakai kembali token aktif yang ada (link stabil),
--    kalau tidak ada -> cabut semua & buat SATU token baru (expiry 90 hari).
create or replace function public.ensure_invite_token(p_project_id uuid, p_label text default 'Pihak undangan')
returns table (id uuid, token text, project_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project_id uuid;
  v_token_id uuid;
  v_token text;
  v_expires timestamptz := now() + interval '90 days';
begin
  -- Hanya pemilik proyek atau internal yang boleh memicu pembuatan token.
  select p.id into v_project_id
  from public.projects p
  where p.id = p_project_id
    and (p.user_id = v_uid or public.is_internal());

  if v_project_id is null then
    return;
  end if;

  -- Bersihkan token yang sudah kedaluwarsa.
  update public.access_tokens
     set revoked_at = now()
   where project_id = p_project_id
     and revoked_at is null
     and expires_at is not null
     and expires_at <= now();

  -- Ada token aktif? Pakai lagi (jangan buat token baru tiap kunjungan).
  select t.id, t.token into v_token_id, v_token
  from public.access_tokens t
  where t.project_id = p_project_id
    and t.revoked_at is null
    and (t.expires_at is null or t.expires_at > now())
  order by t.created_at asc
  limit 1;

  if v_token_id is null then
    -- Tidak ada token aktif: cabut sisa lalu buat satu token baru.
    update public.access_tokens
       set revoked_at = now()
     where project_id = p_project_id
       and revoked_at is null;

    insert into public.access_tokens (project_id, token, label, created_by, expires_at)
    values (p_project_id, encode(gen_random_bytes(24), 'hex'), p_label, v_uid, v_expires)
    returning id, token, project_id into id, token, project_id;
  else
    id := v_token_id;
    token := v_token;
    project_id := p_project_id;
  end if;

  return next;
end;
$$;

revoke all on function public.ensure_invite_token(uuid, text) from anon, public;
grant execute on function public.ensure_invite_token(uuid, text) to authenticated;

-- 6) revoke_invite_token: cabut semua token aktif proyek (pemilik/internal).
create or replace function public.revoke_invite_token(p_project_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.access_tokens
     set revoked_at = now()
   where project_id = p_project_id
     and revoked_at is null
     and (
       exists (
         select 1 from public.projects p
         where p.id = p_project_id and p.user_id = auth.uid()
       )
       or public.is_internal()
     );
$$;

revoke all on function public.revoke_invite_token(uuid) from anon, public;
grant execute on function public.revoke_invite_token(uuid) to authenticated;

-- 7) RPC BUKU TAMU AMAN: hanya name+message+created_at dari project
--    published (publik) / pemilik-internal (preview). Tanpa data intim.
create or replace function public.get_guest_book_messages(p_project_id uuid)
returns table (id uuid, name text, message text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.name, r.message, r.created_at
  from public.rsvps r
  join public.projects p on p.id = r.project_id
  where r.project_id = p_project_id
    and r.message is not null
    and trim(r.message) <> ''
    and (p.status = 'published' or public.is_internal() or p.user_id = auth.uid())
  order by r.created_at desc
  limit 24;
$$;

grant execute on function public.get_guest_book_messages(uuid) to anon, authenticated;

-- 8) RPC KELOLA TAMU: daftar RSVP / check-in lengkap, TAPI hanya bila
--    token aktif valid / pemilik / internal. Tanpa SELECT publik langsung.
create or replace function public.get_invite_rsvps(p_project_id uuid, p_token text)
returns table (
  id uuid,
  name text,
  attendance text,
  guest_count int,
  message text,
  meal_choice text,
  menu_options jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.name, r.attendance, r.guest_count, r.message,
         r.meal_choice, r.menu_options, r.created_at
  from public.rsvps r
  where r.project_id = p_project_id
    and (
      exists (
        select 1 from public.access_tokens t
        where t.project_id = p_project_id
          and t.token = p_token
          and t.revoked_at is null
          and (t.expires_at is null or t.expires_at > now())
      )
      or public.is_internal()
      or exists (
        select 1 from public.projects p
        where p.id = p_project_id and p.user_id = auth.uid()
      )
    )
  order by r.created_at desc;
$$;

create or replace function public.get_invite_checkins(p_project_id uuid, p_token text)
returns table (
  id uuid,
  name text,
  guest_count int,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.guest_count, c.created_at
  from public.checkins c
  where c.project_id = p_project_id
    and (
      exists (
        select 1 from public.access_tokens t
        where t.project_id = p_project_id
          and t.token = p_token
          and t.revoked_at is null
          and (t.expires_at is null or t.expires_at > now())
      )
      or public.is_internal()
      or exists (
        select 1 from public.projects p
        where p.id = p_project_id and p.user_id = auth.uid()
      )
    )
  order by c.created_at desc;
$$;

grant execute on function public.get_invite_rsvps(uuid, text) to anon, authenticated;
grant execute on function public.get_invite_checkins(uuid, text) to anon, authenticated;
