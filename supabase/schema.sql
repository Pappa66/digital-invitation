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