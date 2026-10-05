-- Izinkan pemilik (created_by) mengedit template miliknya walau sudah visible.
drop policy if exists "custom_templates_write_owner" on public.custom_templates;
create policy "custom_templates_write_owner"
  on public.custom_templates for all
  using (public.is_internal() or created_by = auth.uid())
  with check (public.is_internal() or created_by = auth.uid());
