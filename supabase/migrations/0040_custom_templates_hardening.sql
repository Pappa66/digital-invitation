-- Hardening custom_templates (aditif): batas nama, FK created_by, dan
-- hanya internal yang boleh menayangkan template (visible=true) ke landing.
do $$ begin
  alter table public.custom_templates
    add constraint custom_templates_name_len check (char_length(name) between 1 and 80) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.custom_templates
    add constraint custom_templates_created_by_fk
    foreign key (created_by) references auth.users(id) on delete set null;
exception when duplicate_object then null; when others then null; end $$;

drop policy if exists "custom_templates_write_owner" on public.custom_templates;
create policy "custom_templates_write_owner"
  on public.custom_templates for all
  using (public.is_internal() or created_by = auth.uid())
  with check (
    (public.is_internal() or created_by = auth.uid())
    and (public.is_internal() or visible = false)
  );
