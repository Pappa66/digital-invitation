-- 0021) Simpan/ambil desain via share edit token (tanpa login).
-- Alur /edit/[token] memakai RPC security definer yang memvalidasi token,
-- sehingga builder Puck bisa dimuat & disimpan oleh pemegang link edit.

alter table public.share_edit_tokens enable row level security;

-- Ambil desain berdasarkan token
create or replace function public.get_design_by_share_token(p_token text)
returns table (
  canvas_data jsonb,
  project_id uuid,
  project_title text,
  project_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project uuid;
begin
  select set.project_id into v_project
  from public.share_edit_tokens set
  where set.token = p_token
    and set.is_active
    and set.expires_at > now();

  if v_project is null then
    return;
  end if;

  return query
    select d.canvas_data, p.id, p.title, p.slug
    from public.project_designs d
    join public.projects p on p.id = d.project_id
    where d.project_id = v_project;
end;
$$;

-- Simpan desain berdasarkan token
create or replace function public.save_design_by_share_token(p_token text, p_canvas jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_project uuid;
begin
  select set.project_id into v_project
  from public.share_edit_tokens set
  where set.token = p_token
    and set.is_active
    and set.expires_at > now();

  if v_project is null then
    raise exception 'Token edit tidak valid atau kedaluwarsa';
  end if;

  update public.project_designs
  set canvas_data = p_canvas,
      updated_at = now()
  where project_id = v_project;

  return true;
end;
$$;

grant execute on function public.get_design_by_share_token(text) to anon, authenticated;
grant execute on function public.save_design_by_share_token(text, jsonb) to anon, authenticated;
