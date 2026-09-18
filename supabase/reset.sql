-- ============================================================
-- RESET — hapus SELURUH objek aplikasi (DESTRUKTIF!).
-- Jalankan di Supabase SQL Editor SEBELUM `apply_all.sql` bila DB
-- sudah pernah di-migrasi (mis. muncul "policy ... already exists").
--
-- PERINGATAN: semua data aplikasi di schema public + bucket
-- `invitation-assets` akan hilang.
-- ============================================================

-- 1) Hapus seluruh objek di schema public (tabel, fungsi, policy, index).
drop schema if exists public cascade;

-- 2) Buat ulang schema public + hak akses standar Supabase.
create schema public;

grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on schema public to postgres, anon, authenticated, service_role;

alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to postgres, anon, authenticated, service_role;

-- 3) Bersihkan policy storage aplikasi (bucket & file TIDAK dihapus — Supabase
--    melarang DELETE langsung ke storage.*). Hapus file lama via Dashboard → Storage
--    bila perlu; create bucket di apply_all bersifat idempotent (on conflict do nothing).
drop policy if exists "invitation_assets_read" on storage.objects;
drop policy if exists "invitation_assets_insert" on storage.objects;
drop policy if exists "invitation_assets_update" on storage.objects;
drop policy if exists "invitation_assets_delete" on storage.objects;

-- Selesai. Lanjutkan dengan menjalankan `apply_all.sql` (atau `install.sql`).
