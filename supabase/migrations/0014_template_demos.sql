-- ============================================================
-- 0014 TEMPLATE DEMOS (GAMBAR + LINK PER TEMPLATE, DIATUR ADMIN)
-- Admin mengelola metadata "Demo Template" yang tampil di landing:
--  - template_id : ID slug template (sinkron templates/index.json) → PK.
--  - demo_image  : URL gambar hasil undangan (cart preview) per template.
--  - demo_link   : URL link demo / live preview per template.
-- Keamanan:
--  - SELECT dibuka ke anon & authenticated `using (true)` karena hanya
--    metadata demo (belum ada data intim di tabel ini).
--  - INSERT/UPDATE/DELETE hanya untuk operator via public.is_internal()
--    (fungsi security definer dari 0010) — anon sama sekali tidak boleh tulis.
--  - Roadmap menyederhanakan: bila tabel ini sejak awal berisi data sensitif,
--    SELECT publik harus ditutup & dialihkan lewat RPC (pola 0011).
-- Aman untuk rerun: IF NOT EXISTS / drop policy.
-- ============================================================

-- 1) TABEL: metadata demo template (satu baris per template).
create table if not exists public.template_demos (
  template_id text primary key,
  demo_image text,
  demo_link text,
  updated_at timestamptz not null default now()
);

comment on table public.template_demos is
  'Metadata demo template yang diatur admin (gambar + link per template) untuk landing publik.';
comment on column public.template_demos.template_id is
  'ID template (slug, sinkron dengan templates/index.json). Primary key.';
comment on column public.template_demos.demo_image is
  'URL gambar demo/cover undangan yang ditampilkan pada kartu landing. NULL = belum diisi.';
comment on column public.template_demos.demo_link is
  'URL tautan demo/live preview template. NULL = belum diisi.';
comment on column public.template_demos.updated_at is
  'Waktu terakhir metadata diubah oleh operator.';

-- 2) RLS: enable + policy SELECT publik (hanya kolom demo metadata).
alter table public.template_demos enable row level security;

drop policy if exists "template_demos_select_public" on public.template_demos;
create policy "template_demos_select_public"
  on public.template_demos for select
  to anon, authenticated
  using (true);

-- 3) RLS: INSERT/UPDATE/DELETE hanya operator internal (pola 0010).
drop policy if exists "template_demos_insert_internal" on public.template_demos;
create policy "template_demos_insert_internal"
  on public.template_demos for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "template_demos_update_internal" on public.template_demos;
create policy "template_demos_update_internal"
  on public.template_demos for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

drop policy if exists "template_demos_delete_internal" on public.template_demos;
create policy "template_demos_delete_internal"
  on public.template_demos for delete
  to authenticated
  using (public.is_internal());

-- 4) GRANT: SELECT untuk anon & authenticated; tulis hanya authenticated
--    (RLS is_internal memfilter siapa yang benar-benar operator).
grant select on public.template_demos to anon, authenticated;
grant insert, update, delete on public.template_demos to authenticated;