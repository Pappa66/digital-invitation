-- ============================================================
-- 0010 AUTHZ & RLS HARDENING
-- Perbaikan temuan evaluasi:
--  - RLS orders/settings/finance_records sebelumnya terbuka ke SEMUA
--    `authenticated`. Kini hanya operator (is_internal()) yang boleh.
--  - Policy UPDATE orders yang hilang (update status via server action).
--  - check_rate_limit / get_client_ip di-revoke dari anon & public
--    (cegah table-bloat via endpoint publik).
--  - RSVPs & checkins SELECT publik ditutup; pembacaan hanya via RPC aman.
-- Aman untuk rerun: IF NOT EXISTS / CREATE OR REPLACE / drop policy.
-- ============================================================

-- 1) TABEL: operators (daftar email/user yang berhak akses internal)
create table if not exists public.operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.operators enable row level security;

-- is_internal(): satu-satunya sumber kebenaran akses internal.
-- security definer agar bisa membaca operators tanpa terkena RLS sendiri
-- (hindari rekursi policy). Dapat dipanggil dari policy RLS & fungsi lain.
create or replace function public.is_internal()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operators o
    where o.user_id = auth.uid()
       or lower(o.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

grant execute on function public.is_internal() to anon, authenticated;

-- Hanya internal yang boleh mengelola daftar operator.
drop policy if exists "operators_select_internal" on public.operators;
create policy "operators_select_internal"
  on public.operators for select
  to authenticated
  using (public.is_internal());

drop policy if exists "operators_insert_internal" on public.operators;
create policy "operators_insert_internal"
  on public.operators for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "operators_update_internal" on public.operators;
create policy "operators_update_internal"
  on public.operators for update
  to authenticated
  using (public.is_internal())
  with check (public.is_internal());

drop policy if exists "operators_delete_internal" on public.operators;
create policy "operators_delete_internal"
  on public.operators for delete
  to authenticated
  using (public.is_internal());

-- Seed operator default (satu-satunya akun pengelola).
insert into public.operators (email)
values ('digitalprasha@gmail.com')
on conflict (email) do nothing;

-- 2) RLS ORDERS: INSERT publik tetap (form pemesanan), sisanya internal.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_internal"
  on public.orders for select
  to authenticated
  using (public.is_internal());

drop policy if exists "orders_update_internal" on public.orders;
create policy "orders_update_internal"
  on public.orders for update
  to authenticated
  using (public.is_internal());

drop policy if exists "orders_delete_staff" on public.orders;
drop policy if exists "orders_delete_internal" on public.orders;
create policy "orders_delete_internal"
  on public.orders for delete
  to authenticated
  using (public.is_internal());

-- 3) RLS SETTINGS: baca publik tetap (form pemesanan & landing),
--    tulis/hapus hanya internal.
drop policy if exists "settings_upsert_staff" on public.settings;
create policy "settings_upsert_internal"
  on public.settings for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "settings_update_staff" on public.settings;
create policy "settings_update_internal"
  on public.settings for update
  to authenticated
  using (public.is_internal());

drop policy if exists "settings_delete_staff" on public.settings;
create policy "settings_delete_internal"
  on public.settings for delete
  to authenticated
  using (public.is_internal());

-- 4) RLS FINANCE_RECORDS: hanya internal.
drop policy if exists "Authenticated users can manage finance records" on public.finance_records;
drop policy if exists "finance_records_select_internal" on public.finance_records;
create policy "finance_records_select_internal"
  on public.finance_records for select
  to authenticated
  using (public.is_internal());

drop policy if exists "finance_records_insert_internal" on public.finance_records;
create policy "finance_records_insert_internal"
  on public.finance_records for insert
  to authenticated
  with check (public.is_internal());

drop policy if exists "finance_records_update_internal" on public.finance_records;
create policy "finance_records_update_internal"
  on public.finance_records for update
  to authenticated
  using (public.is_internal());

drop policy if exists "finance_records_delete_internal" on public.finance_records;
create policy "finance_records_delete_internal"
  on public.finance_records for delete
  to authenticated
  using (public.is_internal());

-- 5) RSVPS & CHECKINS: SELECT publik DITUTUP (data intim).
--    Pemilik/internal lewat policy; publik lewat RPC aman (lihat 0011).
drop policy if exists "rsvps_select_public" on public.rsvps;
create policy "rsvps_select_owner"
  on public.rsvps for select
  to authenticated
  using (
    public.is_internal()
    or exists (
      select 1 from public.projects p
      where p.id = rsvps.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "checkins_select_public" on public.checkins;
create policy "checkins_select_owner"
  on public.checkins for select
  to authenticated
  using (
    public.is_internal()
    or exists (
      select 1 from public.projects p
      where p.id = checkins.project_id and p.user_id = auth.uid()
    )
  );

-- 6) RATE LIMIT: cabut akses publik ke check_rate_limit & get_client_ip
--    (dipanggil internal oleh trigger security definer, tetap berfungsi).
revoke execute on function public.check_rate_limit(text, text, int, int) from anon, public;
revoke execute on function public.check_rate_limit(text, text, int, int) from authenticated;
revoke execute on function public.get_client_ip() from anon, public;
revoke execute on function public.get_client_ip() from authenticated;
