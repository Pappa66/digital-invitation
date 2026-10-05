-- RLS insert RSVP sebelumnya memakai subquery langsung ke projects yang di-filter
-- RLS untuk anon (terlihat kosong) sehingga insert ditolak. Pakai is_project_published().
drop policy if exists "rsvps_insert_public" on public.rsvps;
create policy "rsvps_insert_public"
  on public.rsvps for insert
  with check (public.is_project_published(project_id));
