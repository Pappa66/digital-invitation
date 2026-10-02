-- Naikkan batas masa berlaku link edit (dari 168 jam → 365 hari).
create or replace function public.generate_share_edit_token(
  p_project_id uuid,
  p_expires_in_hours int default 24,
  p_note text default null
)
returns table (
  id uuid,
  token text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_token text;
  v_expires_at timestamptz;
  v_id uuid;
  v_created_at timestamptz;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where public.projects.id = p_project_id and public.projects.user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  if p_expires_in_hours < 1 or p_expires_in_hours > 8760 then
    raise exception 'Expiry must be between 1 and 8760 hours (365 days)';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + (p_expires_in_hours || ' hours')::interval;

  insert into public.share_edit_tokens (project_id, token, created_by, expires_at, note)
  values (p_project_id, v_token, v_user_id, v_expires_at, p_note)
  returning share_edit_tokens.id, share_edit_tokens.token, share_edit_tokens.expires_at, share_edit_tokens.created_at
    into v_id, v_token, v_expires_at, v_created_at;

  return query select v_id, v_token, v_expires_at, v_created_at;
end;
$$;
