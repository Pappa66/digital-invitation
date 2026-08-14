-- ============================================================
-- Digital Invitation Builder — Migration 0003: Orders (Kontak Masuk)
-- Pesanan yang masuk via form pemesanan di landing/preview template.
-- ============================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  template_name text,
  name text not null,
  whatsapp text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists orders_created_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

-- Publik boleh mengirim pesanan (form pemesanan di halaman publik).
drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public"
  on public.orders for insert
  to anon, authenticated
  with check (name is not null and length(trim(name)) >= 2);

-- Hanya user terautentikasi (tim internal) yang bisa melihat/menghapus.
drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff"
  on public.orders for select
  to authenticated
  using (true);

drop policy if exists "orders_delete_staff" on public.orders;
create policy "orders_delete_staff"
  on public.orders for delete
  to authenticated
  using (true);