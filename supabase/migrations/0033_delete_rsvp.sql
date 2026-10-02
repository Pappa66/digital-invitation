-- Admin (pemilik/token/intern) bisa menghapus RSVP/ucapan.
create or replace function public.delete_rsvp(
  p_project_id uuid,
  p_rsvp_id uuid,
  p_token text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_ok boolean := false;
begin
  if auth.uid() is not null and exists (
    select 1 from public.projects p where p.id = p_project_id and p.user_id = auth.uid()
  ) then
    v_ok := true;
  elsif public.is_internal() then
    v_ok := true;
  elsif p_token is not null and exists (
    select 1 from public.access_tokens t
    where t.project_id = p_project_id
      and t.token = p_token
      and t.revoked_at is null
      and (t.expires_at is null or t.expires_at > now())
  ) then
    v_ok := true;
  end if;

  if not v_ok then
    raise exception 'Akses ditolak';
  end if;

  delete from public.rsvps where id = p_rsvp_id and project_id = p_project_id;
  return true;
end;
$$;

grant execute on function public.delete_rsvp(uuid, uuid, text) to anon, authenticated;
