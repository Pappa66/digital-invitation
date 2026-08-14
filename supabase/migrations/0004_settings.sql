-- ============================================================
-- Digital Invitation Builder — Migration 0004: Settings
-- Pengaturan dinamis yang bisa diedit dari dashboard (mis. nomor
-- WhatsApp bisnis untuk pemesanan). Dibaca publik (form pemesanan),
-- ditulis hanya oleh tim internal (authenticated).
-- ============================================================

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

-- Publik boleh membaca (form pemesanan butuh nomor WhatsApp bisnis).
drop policy if exists "settings_select_public" on public.settings;
create policy "settings_select_public"
  on public.settings for select
  to anon, authenticated
  using (true);

-- Hanya user terautentikasi (tim internal) yang boleh mengubah.
drop policy if exists "settings_upsert_staff" on public.settings;
create policy "settings_upsert_staff"
  on public.settings for insert
  to authenticated
  with check (true);

drop policy if exists "settings_update_staff" on public.settings;
create policy "settings_update_staff"
  on public.settings for update
  to authenticated
  using (true);

drop policy if exists "settings_delete_staff" on public.settings;
create policy "settings_delete_staff"
  on public.settings for delete
  to authenticated
  using (true);

-- Nilai awal: nomor WhatsApp bisnis (kosong = fallback ke clipboard di form).
insert into public.settings (key, value)
values ('order_whatsapp', '')
on conflict (key) do nothing;