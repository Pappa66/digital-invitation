
-- ensure_invite_token dengan opsi masa berlaku (p_days) & rotate.
drop function if exists public.ensure_invite_token(uuid, text);

create or replace function public.ensure_invite_token(
  p_project_id uuid,
  p_label text default 'Pihak undangan',
  p_days int default 90,
  p_rotate boolean default false
)
returns table (id uuid, token text, project_id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project_id uuid;
  v_token_id uuid;
  v_token text;
  v_expires timestamptz := now() + make_interval(days => greatest(1, least(coalesce(p_days, 90), 3650)));
begin
  select p.id into v_project_id
  from public.projects p
  where p.id = p_project_id
    and (p.user_id = v_uid or public.is_internal());

  if v_project_id is null then
    return;
  end if;

  update public.access_tokens at
     set revoked_at = now()
   where at.project_id = p_project_id
     and at.revoked_at is null
     and at.expires_at is not null
     and at.expires_at <= now();

  if p_rotate then
    update public.access_tokens at
       set revoked_at = now()
     where at.project_id = p_project_id
       and at.revoked_at is null;
    v_token_id := null;
    v_token := null;
  else
    select t.id, t.token into v_token_id, v_token
    from public.access_tokens t
    where t.project_id = p_project_id
      and t.revoked_at is null
      and (t.expires_at is null or t.expires_at > now())
    order by t.created_at asc
    limit 1;
  end if;

  if v_token_id is null then
    insert into public.access_tokens (project_id, token, label, created_by, expires_at)
    values (p_project_id, encode(gen_random_bytes(24), 'hex'), p_label, v_uid, v_expires)
    returning access_tokens.id, access_tokens.token, access_tokens.project_id, access_tokens.expires_at
      into id, token, project_id, expires_at;
  else
    id := v_token_id;
    token := v_token;
    project_id := p_project_id;
    select t.expires_at into expires_at from public.access_tokens t where t.id = v_token_id;
  end if;

  return next;
end;
$$;

revoke all on function public.ensure_invite_token(uuid, text, int, boolean) from anon, public;
grant execute on function public.ensure_invite_token(uuid, text, int, boolean) to authenticated;
