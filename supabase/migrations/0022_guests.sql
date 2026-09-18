-- 0022) Daftar tamu persisten (nama + nomor) per proyek.
-- Menggantikan daftar tamu yang hanya disimpan di browser (localStorage).

create table if not exists public.guests (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name       text not null,
  phone      text,
  created_at timestamptz not null default now()
);

create index if not exists guests_project_idx on public.guests (project_id);

alter table public.guests enable row level security;

-- Pemilik proyek (login) boleh kelola daftar tamunya.
drop policy if exists "guests_manage_own" on public.guests;
create policy "guests_manage_own"
  on public.guests for all
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = guests.project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = guests.project_id and p.user_id = auth.uid()
    )
  );
