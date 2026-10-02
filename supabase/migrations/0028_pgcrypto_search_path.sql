-- Pastikan pgcrypto tersedia & fungsi token bisa menemukan gen_random_bytes.
create extension if not exists pgcrypto with schema extensions;

do $$
begin
  begin
    alter function public.ensure_invite_token(uuid, text, int, boolean) set search_path = public, extensions;
  exception when others then null;
  end;
  begin
    alter function public.generate_share_edit_token(uuid, int, text) set search_path = public, extensions;
  exception when others then null;
  end;
end $$;
