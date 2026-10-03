-- Pagination buku tamu (limit/offset).
drop function if exists public.get_guest_book_messages(uuid);

create or replace function public.get_guest_book_messages(
  p_project_id uuid,
  p_limit int default 12,
  p_offset int default 0
)
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
  limit greatest(1, least(coalesce(p_limit, 12), 50))
  offset greatest(0, coalesce(p_offset, 0));
$$;

grant execute on function public.get_guest_book_messages(uuid, int, int) to anon, authenticated;
