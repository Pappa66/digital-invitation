-- Tabel template kustom (dibuat admin/pemilik). Aditif: tidak menyentuh projects.
create table if not exists public.custom_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text default 'Template Saya',
  canvas_data jsonb not null,
  visible boolean not null default true,
  sort_order int not null default 0,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.custom_templates enable row level security;

drop policy if exists "custom_templates_select_public" on public.custom_templates;
create policy "custom_templates_select_public"
  on public.custom_templates for select
  using (visible or public.is_internal() or created_by = auth.uid());

drop policy if exists "custom_templates_write_owner" on public.custom_templates;
create policy "custom_templates_write_owner"
  on public.custom_templates for all
  using (public.is_internal() or created_by = auth.uid())
  with check (public.is_internal() or created_by = auth.uid());

grant select on public.custom_templates to anon, authenticated;
grant insert, update, delete on public.custom_templates to authenticated;

create index if not exists custom_templates_visible_idx on public.custom_templates (visible, sort_order);
