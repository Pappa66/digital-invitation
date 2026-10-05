-- Perkuat fungsi share-edit: set search_path agar aman (SECURITY DEFINER).
do $$
begin
  begin
    alter function public.validate_share_edit_token(text) set search_path = public, extensions;
  exception when others then null; end;
  begin
    alter function public.revoke_share_edit_token(uuid) set search_path = public, extensions;
  exception when others then null; end;
  begin
    alter function public.list_share_edit_tokens() set search_path = public, extensions;
  exception when others then null; end;
  begin
    alter function public.generate_share_edit_token(uuid, int, text) set search_path = public, extensions;
  exception when others then null; end;
end $$;
