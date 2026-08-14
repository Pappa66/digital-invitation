-- ============================================================
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
  );