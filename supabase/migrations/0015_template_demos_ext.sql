-- ============================================================
-- 0015 TEMPLATE DEMOS EXT (NOMOR + NAMA TAMPIL PER TEMPLATE)
-- Admin kini mengatur penuh kartu demo di landing:
--  - demo_number : nomor urut tampilan (01, 02, ...). NULL → fallback urut katalog.
--  - demo_name   : nama tampil di kartu. NULL → fallback nama template (index.json).
-- Struktur & RLS tetap sama (SELECT publik, tulis internal). Aman rerun.
-- ============================================================

alter table public.template_demos
  add column if not exists demo_number integer,
  add column if not exists demo_name text;

comment on column public.template_demos.demo_number is
  'Nomor urut tampilan kartu demo di landing (01, 02, ...). NULL = ikut urutan katalog.';
comment on column public.template_demos.demo_name is
  'Nama tampil pada kartu demo. NULL = nama resmi template (templates/index.json).';
