-- Perbaiki get_invite_by_token (project_id ambigu)
create or replace function public.get_invite_by_token(p_project_id uuid, p_token text)
returns table (project_id uuid, title text, slug text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_project public.projects%rowtype;
  v_token public.access_tokens%rowtype;
begin
  select * into v_token
  from public.access_tokens at
  where at.project_id = p_project_id
    and at.token = p_token
    and at.revoked_at is null;

  if not found then
    return;
  end if;

  if v_token.expires_at is not null and v_token.expires_at < now() then
    return;
  end if;

  select * into v_project from public.projects p where p.id = p_project_id;
  if not found then
    return;
  end if;

  update public.access_tokens at set last_used_at = now() where at.id = v_token.id;

  return query
    select p.id, p.title, p.slug
    from public.projects p
    where p.id = p_project_id;
end;
$$;

grant execute on function public.get_invite_by_token(uuid, text) to anon, authenticated;
