-- ============================================================
-- 0012 STORAGE (OWNER FOLDER + LIMIT), CLIENTS, FK ORDERS/FINANCE
-- Perbaikan temuan evaluasi:
--  - Storage bucket upload tanpa folder owner / mime / limit.
--  - Client sebelumnya hanya localStorage -> tabel clients + RLS owner.
--  - orders.project_id & finance_records.project_id text tanpa FK.
-- Aman untuk rerun: IF NOT EXISTS / DO $$ guard.
-- ============================================================

-- 1) STORAGE: bucket hanya menerima gambar/audio, batas 10MB,
--    dan upload/update wajib ke folder milik pengguna.
update storage.buckets
set file_size_limit = 10485760, -- 10 MiB
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
      'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/x-m4a'
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
