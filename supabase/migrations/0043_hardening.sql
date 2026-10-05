-- Hardening: indeks unik (best-effort) + cabut execute fungsi login-only dari anon.
do $$ begin
  create unique index if not exists projects_slug_published_uidx on public.projects (lower(slug)) where status = 'published';
exception when others then null; end $$;
do $$ begin
  create unique index if not exists project_designs_project_uidx on public.project_designs (project_id);
exception when others then null; end $$;
do $$ begin
  create unique index if not exists rsvps_checkin_code_uidx on public.rsvps (upper(checkin_code)) where checkin_code is not null;
exception when others then null; end $$;

do $$ begin
  revoke execute on function public.generate_share_edit_token(uuid, int, text) from public, anon;
exception when others then null; end $$;
do $$ begin
  revoke execute on function public.revoke_share_edit_token(uuid) from public, anon;
exception when others then null; end $$;
do $$ begin
  revoke execute on function public.list_share_edit_tokens() from public, anon;
exception when others then null; end $$;
