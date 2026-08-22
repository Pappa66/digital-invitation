-- ============================================================
-- Solusi cepat: gabungan 0001 (schema) + 0002 (invite access)
-- Pilih semua, tempel di Supabase > SQL Editor, lalu RUN sekali.
-- ============================================================
-- ============================================================
-- Digital Invitation Builder - Supabase Schema
-- Jalankan di Supabase SQL Editor (atau via migration).
-- ============================================================

-- 1) TABEL: projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Tanpa Judul',
  slug text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  thumbnail text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists projects_user_slug_idx on public.projects (user_id, slug);
create index if not exists projects_slug_idx on public.projects (slug);

-- 2) TABEL: project_designs
create table if not exists public.project_designs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  canvas_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_designs_project_idx on public.project_designs (project_id);

-- 3) TABEL: rsvps (publik, tamu yang konfirmasi)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  attendance text not null check (attendance in ('hadir', 'tidak', 'ragu')),
  guest_count int not null default 1,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_project_idx on public.rsvps (project_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.projects enable row level security;
alter table public.project_designs enable row level security;
alter table public.rsvps enable row level security;

-- Rute autentikasi / dashboard: hanya pemilik yang bisa akses.
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects for select
  using (auth.uid() = user_id);

drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  using (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  using (auth.uid() = user_id);

-- project_designs: hanya pemilik project yang mengelola JSON.
drop policy if exists "designs_select_own" on public.project_designs;
create policy "designs_select_own"
  on public.project_designs for select
  using (
    exists (select 1 from public.projects p where p.id = project_designs.project_id and p.user_id = auth.uid())
  );

drop policy if exists "designs_insert_own" on public.project_designs;
create policy "designs_insert_own"
  on public.project_designs for insert
  with check (
    exists (select 1 from public.projects p where p.id = project_designs.project_id and p.user_id = auth.uid())
  );

drop policy if exists "designs_update_own" on public.project_designs;
create policy "designs_update_own"
  on public.project_designs for update
  using (
    exists (select 1 from public.projects p where p.id = project_designs.project_id and p.user_id = auth.uid())
  );

drop policy if exists "designs_delete_own" on public.project_designs;
create policy "designs_delete_own"
  on public.project_designs for delete
  using (
    exists (select 1 from public.projects p where p.id = project_designs.project_id and p.user_id = auth.uid())
  );

-- rsvps: publik boleh insert (untuk form RSVP), dan siapa pun boleh baca (via guest output).
-- Delete/update tidak diizinkan publik (default deny).
drop policy if exists "rsvps_insert_public" on public.rsvps;
create policy "rsvps_insert_public"
  on public.rsvps for insert
  with check (
    exists (select 1 from public.projects p where p.id = rsvps.project_id and p.status = 'published')
  );

drop policy if exists "rsvps_select_public" on public.rsvps;
create policy "rsvps_select_public"
  on public.rsvps for select
  using (true);

-- ============================================================
-- RUTE PUBLIK: SELECT terbatas untuk published projects
-- Supabase tidak bisa `join` via RLS untuk menyaring project_designs
-- berdasarkan status, jadi gunakan helper function (security definer).
-- ============================================================
create or replace function public.get_published_design(p_slug text)
returns table (project_id uuid, title text, canvas_data jsonb)
language sql
security definer
set search_path = public
as $$
  select p.id as project_id, p.title as title, d.canvas_data as canvas_data
  from public.project_designs d
  join public.projects p on p.id = d.project_id
  where p.slug = p_slug and p.status = 'published'
  limit 1;
$$;

grant execute on function public.get_published_design(text) to anon, authenticated;

-- ============================================================
-- STORAGE: bucket "invitation-assets"
-- ============================================================
insert into storage.buckets (id, name, public)
values ('invitation-assets', 'invitation-assets', true)
on conflict (id) do nothing;

-- Upload: hanya user terautentikasi yang bisa upload ke folder miliknya.
drop policy if exists "invitation_assets_insert" on storage.objects;
create policy "invitation_assets_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'invitation-assets');

-- Read publik (bucket public = true sudah cukup, tapi pastikan):
drop policy if exists "invitation_assets_read" on storage.objects;
create policy "invitation_assets_read"
  on storage.objects for select
  to public
  using (bucket_id = 'invitation-assets');

-- ============================================================
-- TRIGGER: update updated_at otomatis
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch on public.projects;
create trigger projects_touch
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists project_designs_touch on public.project_designs;
create trigger project_designs_touch
  before update on public.project_designs
  for each row execute function public.touch_updated_at();
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

-- ============================================================
-- Digital Invitation Builder — Migration 0003: Orders (Kontak Masuk)
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  template_name text,
  name text not null,
  whatsapp text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);
alter table public.orders enable row level security;

drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  to anon, authenticated
  with check (name is not null and length(trim(name)) >= 2);

drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_delete_staff" on public.orders;
create policy "orders_delete_staff"
  on public.orders for delete
  to authenticated
  using (true);

-- ============================================================
-- Digital Invitation Builder — Migration 0004: Settings
-- ============================================================
create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_upsert_staff" on public.settings;
create policy "settings_upsert_staff"
  on public.settings for insert
  to authenticated
  with check (true);

drop policy if exists "settings_update_staff" on public.settings;
create policy "settings_update_staff"
  on public.settings for update
  to authenticated
  using (true);

drop policy if exists "settings_delete_staff" on public.settings;
create policy "settings_delete_staff"
  on public.settings for delete
  to authenticated
  using (true);

insert into public.settings (key, value)
values ('order_whatsapp', '')
on conflict (key) do nothing;

-- Catatan: pembatasan frekuensi (mis. maks. 1 RSVP/30 detik per IP)
-- sebaiknya ditangani aplikasi (server action/edge) — lihat rsvp.tsx.
-- ============================================================
-- 4) CHECK-IN / ABSENSI TAMU
-- ============================================================
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  guest_count int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists checkins_project_idx on public.checkins (project_id);

alter table public.checkins enable row level security;

drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  with check (true);

drop policy if exists "checkins_select_public" on public.checkins;
create policy "checkins_select_public"
  on public.checkins for select
  using (true);

drop policy if exists "checkins_delete_own" on public.checkins;
create policy "checkins_delete_own"
  on public.checkins for delete
  using (
    exists (select 1 from public.projects p where p.id = checkins.project_id and p.user_id = auth.uid())
  );
-- ============================================================
-- 0016_share_edit_tokens.sql
-- Token berbagi akses edit builder tanpa login.
-- Owner generate link dengan expiry → penerima bisa edit project
-- tanpa login, tercatat sebagai owner utama.
-- ============================================================

-- 1) Tabel baru: share_edit_tokens
create table if not exists public.share_edit_tokens (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  token       text not null unique,
  created_by  uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null,
  is_active   boolean not null default true,
  note        text,
  created_at  timestamptz not null default now()
);

-- Index untuk lookup cepat berdasarkan token
create unique index if not exists share_edit_tokens_token_uidx
  on public.share_edit_tokens (token);

-- Index untuk query by project_id
create index if not exists share_edit_tokens_project_idx
  on public.share_edit_tokens (project_id);

-- 2) RLS: hanya owner project yang bisa manage token
alter table public.share_edit_tokens enable row level security;

-- Owner bisa CRUD token project-nya sendiri
create policy "share_tokens_manage_owner"
  on public.share_edit_tokens for all
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = share_edit_tokens.project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = share_edit_tokens.project_id
        and p.user_id = auth.uid()
    )
  );

-- Service role (server actions) bisa akses semua
create policy "share_tokens_service_role"
  on public.share_edit_tokens for all
  to service_role
  using (true)
  with check (true);

-- 3) RPC: generate share token (hanya owner)
create or replace function public.generate_share_edit_token(
  p_project_id uuid,
  p_expires_in_hours int default 24,
  p_note text default null
)
returns table (
  id uuid,
  token text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_token text;
  v_expires_at timestamptz;
  v_id uuid;
  v_created_at timestamptz;
begin
  -- Cek authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Cek ownership
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  -- Validate expiry
  if p_expires_in_hours < 1 or p_expires_in_hours > 168 then
    raise exception 'Expiry must be between 1 and 168 hours (7 days)';
  end if;

  -- Generate random token (32 bytes hex = 64 chars)
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + (p_expires_in_hours || ' hours')::interval;

  -- Insert token
  insert into public.share_edit_tokens (project_id, token, created_by, expires_at, note)
  values (p_project_id, v_token, v_user_id, v_expires_at, p_note)
  returning share_edit_tokens.id, share_edit_tokens.token, share_edit_tokens.expires_at, share_edit_tokens.created_at
    into v_id, v_token, v_expires_at, v_created_at;

  return query select v_id, v_token, v_expires_at, v_created_at;
end;
$$;

-- 4) RPC: validate share token (public, tanpa login)
create or replace function public.validate_share_edit_token(
  p_token text
)
returns table (
  valid boolean,
  project_id uuid,
  project_title text,
  project_slug text,
  error text
)
language plpgsql
security definer
as $$
declare
  v_row record;
begin
  -- Cari token
  select * into v_row
  from public.share_edit_tokens
  where token = p_token;

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Token tidak ditemukan'::text;
    return;
  end if;

  -- Cek active
  if not v_row.is_active then
    return query select false, null::uuid, null::text, null::text, 'Token sudah dinonaktifkan'::text;
    return;
  end if;

  -- Cek expiry
  if v_row.expires_at < now() then
    return query select false, null::uuid, null::text, null::text, 'Token sudah kedaluwarsa'::text;
    return;
  end if;

  -- Cek project masih exists dan published
  return query
  select
    true,
    p.id,
    p.title,
    p.slug,
    null::text
  from public.projects p
  where p.id = v_row.project_id
    and p.status = 'published';

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Project tidak ditemukan atau belum dipublikasikan'::text;
  end if;
end;
$$;

-- 5) RPC: revoke token (hanya owner)
create or replace function public.revoke_share_edit_token(
  p_token_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Cek ownership lewat project
  if not exists (
    select 1 from public.share_edit_tokens set
    join public.projects p on p.id = set.project_id
    where set.id = p_token_id
      and p.user_id = v_user_id
  ) then
    raise exception 'Token not found or access denied';
  end if;

  update public.share_edit_tokens
  set is_active = false
  where id = p_token_id;

  return true;
end;
$$;

-- 6) RPC: list tokens untuk project (hanya owner)
create or replace function public.list_share_edit_tokens(
  p_project_id uuid
)
returns table (
  id uuid,
  token text,
  expires_at timestamptz,
  is_active boolean,
  note text,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  return query
  select set.id, set.token, set.expires_at, set.is_active, set.note, set.created_at
  from public.share_edit_tokens set
  where set.project_id = p_project_id
  order by set.created_at desc;
end;
$$;
