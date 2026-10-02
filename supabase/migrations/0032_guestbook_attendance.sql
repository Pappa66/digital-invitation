-- Sertakan status kehadiran di buku tamu.
create or replace function public.get_guest_book_messages(p_project_id uuid)
returns table (id uuid, name text, message text, attendance text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select r.id, r.name, r.message, r.attendance, r.created_at
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
