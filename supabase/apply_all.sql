-- ============================================================
-- Solusi cepat: gabungan semua migrasi 0001..0018 (urut).
-- Pilih semua, tempel di Supabase > SQL Editor, lalu RUN sekali.
-- ============================================================
-- Digital Invitation Builder - Supabase Schema
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
  for each row execute function public.touch_updated_at();-- ============================================================
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
-- sebaiknya ditangani aplikasi (server action/edge) — lihat rsvp.tsx.-- ============================================================
-- Digital Invitation Builder — Migration 0003: Orders (Kontak Masuk)
-- Pesanan yang masuk via form pemesanan di landing/preview template.
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

-- Publik boleh mengirim pesanan (form pemesanan di halaman publik).
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  to anon, authenticated
  with check (name is not null and length(trim(name)) >= 2);

-- Hanya user terautentikasi (tim internal) yang bisa melihat/menghapus.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_delete_staff" on public.orders;
create policy "orders_delete_staff"
  on public.orders for delete
  to authenticated
  using (true);-- ============================================================
-- Digital Invitation Builder — Migration 0004: Settings
-- Pengaturan dinamis yang bisa diedit dari dashboard (mis. nomor
-- WhatsApp bisnis untuk pemesanan). Dibaca publik (form pemesanan),
-- ditulis hanya oleh tim internal (authenticated).
-- ============================================================

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Publik boleh membaca (form pemesanan butuh nomor WhatsApp bisnis).
drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

-- Hanya user terautentikasi (tim internal) yang boleh mengubah.
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

-- Nilai awal: nomor WhatsApp bisnis (kosong = fallback ke clipboard di form).
insert into public.settings (key, value)
values ('order_whatsapp', '')
on conflict (key) do nothing;-- ============================================================
-- 0005 CHECK-IN / ABSENSI TAMU
-- Tamu memindai QR di lokasi acara, mengonfirmasi kehadiran mereka
-- pada hari-H (tercatat waktu check-in).
-- ============================================================

-- 1) TABEL: checkins
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  guest_count int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists checkins_project_idx on public.checkins (project_id);

-- 2) ROW LEVEL SECURITY
alter table public.checkins enable row level security;

-- Publik boleh insert (tamu dari QR check-in) dan siapa pun boleh baca.
drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  with check (true);

drop policy if exists "checkins_select_public" on public.checkins;
create policy "checkins_select_public"
  on public.checkins for select
  using (true);

-- Pemilik proyek boleh hapus (mis. membetulkan data salah).
drop policy if exists "checkins_delete_own" on public.checkins;
create policy "checkins_delete_own"
  on public.checkins for delete
  using (
    exists (select 1 from public.projects p where p.id = checkins.project_id and p.user_id = auth.uid())
  );-- ============================================================
-- 0006 RATE LIMITING & SECURITY HARDENING
-- Server-side rate limiting untuk RSVP, check-in, dan orders.
-- ============================================================

-- 1) TABEL: rate_limits (server-side throttle)
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  identifier text not null,
  window_start timestamptz not null default now(),
  count int not null default 1
);

create index if not exists rate_limits_action_idx on public.rate_limits (action, identifier, window_start);

alter table public.rate_limits enable row level security;

-- Hanya service role yang bisa akses rate_limits (via RPC)
drop policy if exists "rate_limits_service_only" on public.rate_limits;
create policy "rate_limits_service_only"
  on public.rate_limits for all
  using (false)
  with check (false);

-- 2) FUNGSI: check_rate_limit
-- Cek apakah action masih dalam batas. Auto-cleanup window lama.
create or replace function public.check_rate_limit(
  p_action text,
  p_identifier text,
  p_window_sec int default 60,
  p_max_count int default 5
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  -- Bersihkan record lama (lebih dari window)
  delete from public.rate_limits
  where action = p_action
    and identifier = p_identifier
    and window_start < now() - (p_window_sec || ' seconds')::interval;

  -- Hitung request dalam window saat ini
  select count(*) into v_count
  from public.rate_limits
  where action = p_action
    and identifier = p_identifier
    and window_start >= now() - (p_window_sec || ' seconds')::interval;

  if v_count >= p_max_count then
    return false; -- rate limit exceeded
  end if;

  -- Catat request ini
  insert into public.rate_limits (action, identifier)
  values (p_action, p_identifier);

  return true; -- allowed
end;
$$;

grant execute on function public.check_rate_limit(text, text, int, int) to anon, authenticated;

-- 3) FUNGSI: get_client_ip (helper untuk ambil IP dari header)
create or replace function public.get_client_ip()
returns text
language sql
stable
as $$
  select coalesce(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    'unknown'
  );
$$;

-- 4) UPDATE: validate_rsvp tambah rate limit check
create or replace function public.validate_rsvp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
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

  -- Rate limit: max 10 RSVP per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('rsvp', v_ip, 60, 10) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

-- 5) UPDATE: checkins insert policy — harus project published
drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = checkins.project_id
        and p.status = 'published'
    )
  );

-- 6) UPDATE: checkins tambah rate limit trigger
create or replace function public.validate_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  if new.guest_count < 1 or new.guest_count > 10 then
    raise exception 'Jumlah tamu tidak valid';
  end if;
  new.name := left(btrim(new.name), 80);

  -- Rate limit: max 3 check-in per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('checkin', v_ip, 60, 3) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

drop trigger if exists checkins_validate on public.checkins;
create trigger checkins_validate
  before insert on public.checkins
  for each row execute function public.validate_checkin();

-- 7) UPDATE: orders rate limit trigger
create or replace function public.validate_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  new.name := left(btrim(new.name), 80);

  -- Rate limit: max 3 order per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('order', v_ip, 60, 3) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_validate on public.orders;
create trigger orders_validate
  before insert on public.orders
  for each row execute function public.validate_order();
-- Migration: Add new columns to orders table + create finance_records table
-- Run this in Supabase SQL Editor

-- Orders: add status, email, template_id, project_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS template_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_id text;

-- Projects: add thumbnail
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail text;

-- Finance records table
CREATE TABLE IF NOT EXISTS finance_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text,
  client_name text NOT NULL,
  design_name text,
  base_price numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  promo_code text,
  promo_amount numeric DEFAULT 0,
  final_price numeric DEFAULT 0,
  payment_status text DEFAULT 'unpaid',
  payment_amount numeric DEFAULT 0,
  payment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to finance_records
CREATE POLICY "Authenticated users can manage finance records"
  ON finance_records FOR ALL
  USING (auth.role() = 'authenticated');
-- ============================================================
-- Migration 0007: Normalisasi payment_status finance_records
-- Sistem lama pakai 'belum'/'dp'/'lunas', sistem baru hanya
-- 'unpaid' | 'paid'. Sinkronkan default + data lama.
-- ============================================================

-- Ubah default kolom ke sistem baru.
ALTER TABLE public.finance_records
  ALTER COLUMN payment_status SET DEFAULT 'unpaid';

-- Migrasi data lama: 'lunas' → 'paid', 'belum'/'dp' → 'unpaid'.
UPDATE public.finance_records
  SET payment_status = CASE
    WHEN payment_status = 'lunas' THEN 'paid'
    ELSE 'unpaid'
  END
  WHERE payment_status IN ('belum', 'dp', 'lunas');

-- Tambah constraint bila belum ada agar nilai tak dikenal ditolak.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'finance_records_payment_status_check')
  THEN
    ALTER TABLE public.finance_records
      ADD CONSTRAINT finance_records_payment_status_check
      CHECK (payment_status IN ('unpaid', 'paid'));
  END IF;
END $$;-- ============================================================
-- RSVP menu pilihan tamu (WeddingPress-style: starter/main/dessert)
-- ============================================================
alter table public.rsvps
  add column if not exists menu_options jsonb;

alter table public.rsvps
  add column if not exists meal_choice text;-- ============================================================
-- 0010 AUTHZ & RLS HARDENING
-- Perbaikan temuan evaluasi:
--  - RLS orders/settings/finance_records sebelumnya terbuka ke SEMUA
--    `authenticated`. Kini hanya operator (is_internal()) yang boleh.
--  - Policy UPDATE orders yang hilang (update status via server action).
--  - check_rate_limit / get_client_ip di-revoke dari anon & public
--    (cegah table-bloat via endpoint publik).
--  - RSVPs & checkins SELECT publik ditutup; pembacaan hanya via RPC aman.
-- Aman untuk rerun: IF NOT EXISTS / CREATE OR REPLACE / drop policy.
-- ============================================================

-- 1) TABEL: operators (daftar email/user yang berhak akses internal)
create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.operators enable row level security;

-- is_internal(): satu-satunya sumber kebenaran akses internal.
-- security definer agar bisa membaca operators tanpa terkena RLS sendiri
-- (hindari rekursi policy). Dapat dipanggil dari policy RLS & fungsi lain.
create or replace function public.is_internal()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operators o
    where o.user_id = auth.uid()
       or lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_internal() to anon, authenticated;

-- Hanya internal yang boleh mengelola daftar operator.
drop policy if exists "operators_select_internal" on public.operators;
create policy "operators_select_internal"
  on public.operators for select
  to authenticated
  using (public.is_internal());

drop policy if exists "operators_insert_internal" on public.operators;
create policy "operators_insert_internal"
  on public.operators for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "operators_update_internal" on public.operators;
create policy "operators_update_internal"
  on public.operators for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

drop policy if exists "operators_delete_internal" on public.operators;
create policy "operators_delete_internal"
  on public.operators for delete
  to authenticated
  using (public.is_internal());

-- Seed operator default (satu-satunya akun pengelola).
insert into public.operators (email)
values ('digitalprasha@gmail.com')
on conflict (email) do nothing;

-- 2) RLS ORDERS: INSERT publik tetap (form pemesanan), sisanya internal.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_internal"
  on public.orders for select
  to authenticated
  using (public.is_internal());

drop policy if exists "orders_update_internal" on public.orders;
create policy "orders_update_internal"
  on public.orders for update
  to authenticated
  using (public.is_internal());

drop policy if exists "orders_delete_staff" on public.orders;
drop policy if exists "orders_delete_internal" on public.orders;
create policy "orders_delete_internal"
  on public.orders for delete
  to authenticated
  using (public.is_internal());

-- 3) RLS SETTINGS: baca publik tetap (form pemesanan & landing),
--    tulis/hapus hanya internal.
drop policy if exists "settings_upsert_staff" on public.settings;
create policy "settings_upsert_internal"
  on public.settings for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "settings_update_staff" on public.settings;
create policy "settings_update_internal"
  on public.settings for update
  to authenticated
  using (public.is_internal());

drop policy if exists "settings_delete_staff" on public.settings;
create policy "settings_delete_internal"
  on public.settings for delete
  to authenticated
  using (public.is_internal());

-- 4) RLS FINANCE_RECORDS: hanya internal.
drop policy if exists "Authenticated users can manage finance records" on public.finance_records;
drop policy if exists "finance_records_select_internal" on public.finance_records;
create policy "finance_records_select_internal"
  on public.finance_records for select
  to authenticated
  using (public.is_internal());

drop policy if exists "finance_records_insert_internal" on public.finance_records;
create policy "finance_records_insert_internal"
  on public.finance_records for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "finance_records_update_internal" on public.finance_records;
create policy "finance_records_update_internal"
  on public.finance_records for update
  to authenticated
  using (public.is_internal());

drop policy if exists "finance_records_delete_internal" on public.finance_records;
create policy "finance_records_delete_internal"
  on public.finance_records for delete
  to authenticated
  using (public.is_internal());

-- 5) RSVPS & CHECKINS: SELECT publik DITUTUP (data intim).
--    Pemilik/internal lewat policy; publik lewat RPC aman (lihat 0011).
drop policy if exists "rsvps_select_public" on public.rsvps;
create policy "rsvps_select_owner"
  on public.rsvps for select
  to authenticated
  using (
    public.is_internal()
    or exists (
      select 1 from public.projects p
      where p.id = rsvps.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "checkins_select_public" on public.checkins;
create policy "checkins_select_owner"
  on public.checkins for select
  to authenticated
  using (
    public.is_internal()
    or exists (
      select 1 from public.projects p
      where p.id = checkins.project_id and p.user_id = auth.uid()
    )
  );

-- 6) RATE LIMIT: cabut akses publik ke check_rate_limit & get_client_ip
--    (dipanggil internal oleh trigger security definer, tetap berfungsi).
revoke execute on function public.check_rate_limit(text, text, int, int) from anon, public;
revoke execute on function public.check_rate_limit(text, text, int, int) from authenticated;
revoke execute on function public.get_client_ip() from anon, public;
revoke execute on function public.get_client_ip() from authenticated;
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
-- ============================================================
-- 0012 STORAGE (OWNER FOLDER + LIMIT), CLIENTS, FK ORDERS/FINANCE
-- Perbaikan temuan evaluasi:
--  - Storage bucket upload tanpa folder owner / mime / limit.
--  - Client sebelumnya hanya localStorage -> tabel clients + RLS owner.
--  - orders.project_id & finance_records.project_id text tanpa FK.
-- Aman untuk rerun: IF NOT EXISTS / DO $$ guard.
-- ============================================================

-- 1) STORAGE: bucket menerima gambar/audio/video, batas 100MB,
--    dan upload/update wajib ke folder milik pengguna.
update storage.buckets
set file_size_limit = 104857600, -- 100 MiB (was 10 MiB)
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
    ]
where id = 'invitation-assets';

-- Upload: path harus diawali folder = auth.uid().
drop policy if exists "invitation_assets_insert" on storage.objects;
create policy "invitation_assets_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'invitation-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Update: pemilik folder boleh menimpa file miliknya (mis. thumbnail upsert).
drop policy if exists "invitation_assets_update" on storage.objects;
create policy "invitation_assets_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'invitation-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'invitation-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read publik tetap (bucket public=true, URL gambar dipakai halaman tamu).
drop policy if exists "invitation_assets_read" on storage.objects;
create policy "invitation_assets_read"
  on storage.objects for select
  to public
  using (bucket_id = 'invitation-assets');

-- 2) TABEL: clients (persisten, per-owner)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  project_id uuid references public.projects(id) on delete set null,
  design_name text,
  status text not null default 'proses'
    check (status in ('aktual', 'proses', 'selesai')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_user_idx on public.clients (user_id);
create index if not exists clients_project_idx on public.clients (project_id);

alter table public.clients enable row level security;

drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "clients_insert_own" on public.clients;
create policy "clients_insert_own"
  on public.clients for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "clients_update_own" on public.clients;
create policy "clients_update_own"
  on public.clients for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "clients_delete_own" on public.clients;
create policy "clients_delete_own"
  on public.clients for delete
  to authenticated
  using (user_id = auth.uid());

-- Trigger updated_at otomatis untuk clients.
drop trigger if exists clients_touch on public.clients;
create trigger clients_touch
  before update on public.clients
  for each row execute function public.touch_updated_at();

-- 3) ORDERS: project_id text -> uuid + FK (data non-uuid dinullkan dulu).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders'
      AND column_name = 'project_id' AND data_type = 'text'
  ) THEN
    UPDATE public.orders SET project_id = NULL
      WHERE project_id IS NOT NULL AND project_id <> ''
        AND project_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    ALTER TABLE public.orders ALTER COLUMN project_id TYPE uuid USING (NULLIF(project_id, '')::uuid);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_project_id_fkey'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

create index if not exists orders_project_idx on public.orders (project_id);

-- 4) ORDERS: status ternormalisasi.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'approved', 'rejected'));
  END IF;
END $$;

-- 5) FINANCE_RECORDS: project_id text -> uuid + FK.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'finance_records'
      AND column_name = 'project_id' AND data_type = 'text'
  ) THEN
    UPDATE public.finance_records SET project_id = NULL
      WHERE project_id IS NOT NULL AND project_id <> ''
        AND project_id !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$';
    ALTER TABLE public.finance_records ALTER COLUMN project_id TYPE uuid USING (NULLIF(project_id, '')::uuid);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'finance_records_project_id_fkey'
  ) THEN
    ALTER TABLE public.finance_records
      ADD CONSTRAINT finance_records_project_id_fkey
      FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

create index if not exists finance_records_project_idx on public.finance_records (project_id);
-- ============================================================
-- 0013 CHECK-IN VIA QR TOKEN (ABSEN TANPA LOGIN)
-- Tamu yang RSVP sukses mendapat token personal (checkin_token,
-- uuid unik tak tertebak) untuk QR absen. Panitia membuka
-- /absen/[projectId] (publik), memindai QR berisi token, lalu RPC
-- record_checkin_from_token memvalidasi & mencatat check-in dari
-- nama/guest_count RSVP — tanpa login dan tanpa form manual.
-- Aman untuk rerun: IF NOT EXISTS / CREATE OR REPLACE / drop policy.
-- ============================================================

-- 1) KOLOM BARU: checkin_token per RSVP.
alter table public.rsvps
  add column if not exists checkin_token uuid not null unique default gen_random_uuid();

-- Guard idempoten: bila kolom sudah ada tanpa index unik (mis. migrasi
-- lama parsial), pastikan tetap dijamin unik.
do $$
begin
  if not exists (
    select 1 from pg_indexes i
    where i.schemaname = 'public' and i.tablename = 'rsvps'
      and i.indexdef ilike '%checkin_token%'
  ) then
    create unique index rsvps_checkin_token_uidx on public.rsvps (checkin_token);
  end if;
end $$;

-- 2) PREDIKAT PUBLISHED (security definer): dipakai oleh policy checkins
--    dan oleh RPC record_checkin_from_token. Dibuat lebih dulu dari policy
--    yang mereferensinya.
create or replace function public.is_project_published(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and p.status = 'published'
  );
$$;

grant execute on function public.is_project_published(uuid) to anon, authenticated;

-- 3) PERBAIKI POLICY INSERT checkins: HANYA proyek berstatus 'published'.
-- 0005 semula memakai `with check (true)`; 0006 sudah mempersempit, dan
-- di-assert ulang di sini agar 0013 berdiri sendiri (anti-regresi).
-- CATATAN: subquery mentah ke `projects` di dalam policy TIDAK berfungsi
-- untuk role anon — RLS `projects_select_own` ikut diterapkan di dalam
-- ekspresi policy, sehingga anon selalu melihat 0 baris (insert publik ke
-- proyek published ikut diblokir). Solusi pakai predikat security definer
-- (pola sama seperti get_published_design/is_internal): RLS pada projects
-- di-bypass, tapi hanya status 'published' yang lolos.
drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  to anon, authenticated
  with check (public.is_project_published(project_id));

-- 4) RPC METADATA ABSEN: kembalikan (id, title, slug) HANYA bila proyek
--    published & valid. Dipakai halaman /absen/[projectId] agar tidak
--    bocor info proyek draft/privasi lain.
create or replace function public.get_abs_project_meta(p_project_id uuid)
returns table (id uuid, title text, slug text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.title, p.slug
  from public.projects p
  where p.id = p_project_id
    and p.status = 'published'
  limit 1;
$$;

grant execute on function public.get_abs_project_meta(uuid) to anon, authenticated;

-- 5) RPC CHECK-IN VIA TOKEN (prosedur ber-lapisan, idempoten).
--    Lapisan:
--      1. Proyek harus published → selain itu return error, jangan insert.
--      2. Rate limit per proyek (anti-spam token) via check_rate_limit
--         action 'checkin_token'. Lapisan per-IP tetap ditangani trigger
--         validate_checkin (0006) yang aktif saat insert.
--      3. Token harus milik RSVP proyek ini → bukan → 'token tidak valid'.
--      4. Idempoten: bila RSVP sudah check-in, kembalikan data existing
--         (ok=true) tanpa insert — scan ulang QR tidak menggandakan.
--      5. Insert checkins(project_id, name, guest_count) dari identitas
--         RSVP, lalu return (ok, name, guest_count, created_at).
--    Catatan keamanan: fungsi ini security definer (owner) sehingga SELECT
--    rsvps dan INSERT checkins lolos RLS, dan bisa memanggil
--    check_rate_limit/get_client_ip yang grant-nya dicabut di 0010 — tetap
--    terkunci karena hanya mengekspos nama/guest_count/created_at.
create or replace function public.record_checkin_from_token(
  p_project_id uuid,
  p_token uuid
)
returns table (ok boolean, error text, name text, guest_count int, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rsvp public.rsvps%rowtype;
  v_checkin public.checkins%rowtype;
begin
  -- Lapisan 1: proyek harus published.
  if not public.is_project_published(p_project_id) then
    if not exists (select 1 from public.projects p where p.id = p_project_id) then
      ok := false;
      error := 'proyek tidak ditemukan';
    else
      ok := false;
      error := 'proyek belum dipublikasikan';
    end if;
    return next;
    return;
  end if;

  -- Lapisan 2: batasi percobaan per proyek (60 permintaan/menit). Trigger
  -- validate_checkin (0006) tetap aktif: validasi nama & jumlah tamu plus
  -- rate limit per IP saat insert berlangsung.
  if not public.check_rate_limit('checkin_token', p_project_id::text, 60, 60) then
    ok := false;
    error := 'Terlalu cepat. Silakan tunggu sebentar.';
    return next;
    return;
  end if;

  -- Lapisan 3: token harus milik RSVP proyek ini.
  select * into v_rsvp
  from public.rsvps
  where project_id = p_project_id
    and checkin_token = p_token;

  if not found then
    ok := false;
    error := 'token tidak valid';
    return next;
    return;
  end if;

  -- Lapisan 4 (idempoten): RSVP sudah check-in? Kembalikan data existing.
  select c.id, c.project_id, c.name, c.guest_count, c.created_at
  into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at
  from public.checkins c
  where c.project_id = p_project_id
    and c.name = v_rsvp.name
    and c.guest_count = v_rsvp.guest_count
  order by c.created_at desc
  limit 1;

  if found then
    ok := true;
    error := null;
    name := v_checkin.name;
    guest_count := v_checkin.guest_count;
    created_at := v_checkin.created_at;
    return next;
    return;
  end if;

  -- Lapisan 5: catat check-in baru dari identitas RSVP. Exception dari
  -- trigger (mis. rate limit per-IP habis) ditangkap agar klien anon
  -- menerima baris error yang bersih, bukan exception HTTP mentah.
  begin
    insert into public.checkins as c (project_id, name, guest_count)
    values (p_project_id, v_rsvp.name, v_rsvp.guest_count)
    returning c.id, c.project_id, c.name, c.guest_count, c.created_at
    into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at;
  exception
    when others then
      ok := false;
      error := sqlerrm;
      return next;
      return;
  end;

  ok := true;
  error := null;
  name := v_checkin.name;
  guest_count := v_checkin.guest_count;
  created_at := v_checkin.created_at;
  return next;
end;
$$;

grant execute on function public.record_checkin_from_token(uuid, uuid) to anon, authenticated;
-- ============================================================
-- 0014 TEMPLATE DEMOS (GAMBAR + LINK PER TEMPLATE, DIATUR ADMIN)
-- Admin mengelola metadata "Demo Template" yang tampil di landing:
--  - template_id : ID slug template (sinkron templates/index.json) → PK.
--  - demo_image  : URL gambar hasil undangan (cart preview) per template.
--  - demo_link   : URL link demo / live preview per template.
-- Keamanan:
--  - SELECT dibuka ke anon & authenticated `using (true)` karena hanya
--    metadata demo (belum ada data intim di tabel ini).
--  - INSERT/UPDATE/DELETE hanya untuk operator via public.is_internal()
--    (fungsi security definer dari 0010) — anon sama sekali tidak boleh tulis.
--  - Roadmap menyederhanakan: bila tabel ini sejak awal berisi data sensitif,
--    SELECT publik harus ditutup & dialihkan lewat RPC (pola 0011).
-- Aman untuk rerun: IF NOT EXISTS / drop policy.
-- ============================================================

-- 1) TABEL: metadata demo template (satu baris per template).
create table if not exists public.template_demos (
  template_id text primary key,
  demo_image text,
  demo_link text,
  updated_at timestamptz not null default now()
);

comment on table public.template_demos is
  'Metadata demo template yang diatur admin (gambar + link per template) untuk landing publik.';
comment on column public.template_demos.template_id is
  'ID template (slug, sinkron dengan templates/index.json). Primary key.';
comment on column public.template_demos.demo_image is
  'URL gambar demo/cover undangan yang ditampilkan pada kartu landing. NULL = belum diisi.';
comment on column public.template_demos.demo_link is
  'URL tautan demo/live preview template. NULL = belum diisi.';
comment on column public.template_demos.updated_at is
  'Waktu terakhir metadata diubah oleh operator.';

-- 2) RLS: enable + policy SELECT publik (hanya kolom demo metadata).
alter table public.template_demos enable row level security;

drop policy if exists "template_demos_select_public" on public.template_demos;
create policy "template_demos_select_public"
  on public.template_demos for select
  to anon, authenticated
  using (true);

-- 3) RLS: INSERT/UPDATE/DELETE hanya operator internal (pola 0010).
drop policy if exists "template_demos_insert_internal" on public.template_demos;
create policy "template_demos_insert_internal"
  on public.template_demos for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "template_demos_update_internal" on public.template_demos;
create policy "template_demos_update_internal"
  on public.template_demos for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

drop policy if exists "template_demos_delete_internal" on public.template_demos;
create policy "template_demos_delete_internal"
  on public.template_demos for delete
  to authenticated
  using (public.is_internal());

-- 4) GRANT: SELECT untuk anon & authenticated; tulis hanya authenticated
--    (RLS is_internal memfilter siapa yang benar-benar operator).
grant select on public.template_demos to anon, authenticated;
grant insert, update, delete on public.template_demos to authenticated;-- ============================================================
-- 0015 TEMPLATE DEMOS EXT (NOMOR + NAMA TAMPIL PER TEMPLATE)
-- Admin kini mengatur penuh kartu demo di landing:
--  - demo_number : nomor urut tampilan (01, 02, ...). NULL → fallback urut katalog.
--  - demo_name   : nama tampil di kartu. NULL → fallback nama template (index.json).
-- Struktur & RLS tetap sama (SELECT publik, tulis internal). Aman rerun.
-- ============================================================

alter table public.template_demos
  add column if not exists demo_number integer,
  add column if not exists demo_name text;

comment on column public.template_demos.demo_number is
  'Nomor urut tampilan kartu demo di landing (01, 02, ...). NULL = ikut urutan katalog.';
comment on column public.template_demos.demo_name is
  'Nama tampil pada kartu demo. NULL = nama resmi template (templates/index.json).';
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
-- ============================================================
-- 0017_fix_share_edit_tokens.sql
-- Idempoten: jalankan berulang kali aman.
-- Kasus: 0016 gagal di tengah jalan karena policy
-- "share_tokens_manage_owner" sudah ada (remote sudah
-- punya tabel+policy pertama), sehingga policy kedua &
-- keempat RPC functions belum terbuat. Migrasi ini
-- melengkapinya tanpa bentrok (drop policy if exists).
-- ============================================================

-- Pastikan tabel ada (no-op jika sudah ada)
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

create unique index if not exists share_edit_tokens_token_uidx
  on public.share_edit_tokens (token);
create index if not exists share_edit_tokens_project_idx
  on public.share_edit_tokens (project_id);

alter table public.share_edit_tokens enable row level security;

-- Buat ulang policy (drop dulu agar idempoten)
drop policy if exists "share_tokens_manage_owner" on public.share_edit_tokens;
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

drop policy if exists "share_tokens_service_role" on public.share_edit_tokens;
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
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where public.projects.id = p_project_id and public.projects.user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  if p_expires_in_hours < 1 or p_expires_in_hours > 168 then
    raise exception 'Expiry must be between 1 and 168 hours (7 days)';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + (p_expires_in_hours || ' hours')::interval;

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
  select * into v_row
  from public.share_edit_tokens
  where token = p_token;

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Token tidak ditemukan'::text;
    return;
  end if;

  if not v_row.is_active then
    return query select false, null::uuid, null::text, null::text, 'Token sudah dinonaktifkan'::text;
    return;
  end if;

  if v_row.expires_at < now() then
    return query select false, null::uuid, null::text, null::text, 'Token sudah kedaluwarsa'::text;
    return;
  end if;

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

  if not exists (
    select 1 from public.share_edit_tokens st
    join public.projects p on p.id = st.project_id
    where st.id = p_token_id
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
  select st.id, st.token, st.expires_at, st.is_active, st.note, st.created_at
  from public.share_edit_tokens st
  where st.project_id = p_project_id
  order by st.created_at desc;
end;
$$;
-- ============================================================
-- 0018_fix_share_token_rpc_ambiguity.sql
-- Perbaiki bug "column reference id is ambiguous" di
-- generate_share_edit_token (OUT param 'id' bentrok dengan
-- public.projects.id di subquery EXISTS). Juga ganti alias
-- reserved-word 'set' -> 'st' di revoke/list.
-- Idempoten: create or replace, aman dijalankan berulang.
-- ============================================================

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
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where public.projects.id = p_project_id and public.projects.user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  if p_expires_in_hours < 1 or p_expires_in_hours > 168 then
    raise exception 'Expiry must be between 1 and 168 hours (7 days)';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + (p_expires_in_hours || ' hours')::interval;

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
  select * into v_row
  from public.share_edit_tokens
  where token = p_token;

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Token tidak ditemukan'::text;
    return;
  end if;

  if not v_row.is_active then
    return query select false, null::uuid, null::text, null::text, 'Token sudah dinonaktifkan'::text;
    return;
  end if;

  if v_row.expires_at < now() then
    return query select false, null::uuid, null::text, null::text, 'Token sudah kedaluwarsa'::text;
    return;
  end if;

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

  if not exists (
    select 1 from public.share_edit_tokens st
    join public.projects p on p.id = st.project_id
    where st.id = p_token_id
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
    where public.projects.id = p_project_id and public.projects.user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  return query
  select st.id, st.token, st.expires_at, st.is_active, st.note, st.created_at
  from public.share_edit_tokens st
  where st.project_id = p_project_id
  order by st.created_at desc;
end;
$$;

-- ============================================================
-- 0019: Allow video uploads in invitation-assets bucket
-- ============================================================
update storage.buckets
set file_size_limit = 104857600, -- 100 MiB (was 10 MiB)
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
      'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'
    ]
where id = 'invitation-assets';
