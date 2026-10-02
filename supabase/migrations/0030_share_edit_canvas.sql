-- RPC: ambil desain untuk link edit (token-based, tanpa login).
create or replace function public.get_share_edit_canvas(p_token text)
returns table (canvas_data jsonb, slug text, title text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_row public.share_edit_tokens%rowtype;
begin
  select * into v_row
  from public.share_edit_tokens t
  where t.token = p_token;

  if not found then
    return;
  end if;
  if not v_row.is_active then
    return;
  end if;
  if v_row.expires_at is not null and v_row.expires_at < now() then
    return;
  end if;

  return query
    select d.canvas_data, p.slug, p.title
    from public.project_designs d
    join public.projects p on p.id = d.project_id
    where d.project_id = v_row.project_id
      and p.status = 'published';
end;
$$;

grant execute on function public.get_share_edit_canvas(text) to anon, authenticated;
