-- ============================================================
-- 0013 CHECK-IN VIA QR TOKEN (ABSEN TANPA LOGIN)
-- Tamu yang RSVP sukses mendapat token personal (checkin_token,
-- uuid unik tak tertebak) untuk QR absen. Panitia membuka
-- /absen/[projectId] (publik), memindai QR berisi token, lalu RPC
-- record_checkin_from_token memvalidasi & mencatat check-in dari
-- nama/guest_count RSVP — tanpa login dan tanpa form manual.
-- Aman untuk rerun: IF NOT EXISTS / CREATE OR REPLACE / drop policy.
-- ============================================================

-- 1) KOLOM BARU: checkin_token per RSVP.
alter table public.rsvps
  add column if not exists checkin_token uuid not null unique default gen_random_uuid();

-- Guard idempoten: bila kolom sudah ada tanpa index unik (mis. migrasi
-- lama parsial), pastikan tetap dijamin unik.
do $$
begin
  if not exists (
    select 1 from pg_indexes i
    where i.schemaname = 'public' and i.tablename = 'rsvps'
      and i.indexdef ilike '%checkin_token%'
  ) then
    create unique index rsvps_checkin_token_uidx on public.rsvps (checkin_token);
  end if;
end $$;

-- 2) PREDIKAT PUBLISHED (security definer): dipakai oleh policy checkins
--    dan oleh RPC record_checkin_from_token. Dibuat lebih dulu dari policy
--    yang mereferensinya.
create or replace function public.is_project_published(p_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.projects p
    where p.id = p_project_id
      and p.status = 'published'
  );
$$;

grant execute on function public.is_project_published(uuid) to anon, authenticated;

-- 3) PERBAIKI POLICY INSERT checkins: HANYA proyek berstatus 'published'.
-- 0005 semula memakai `with check (true)`; 0006 sudah mempersempit, dan
-- di-assert ulang di sini agar 0013 berdiri sendiri (anti-regresi).
-- CATATAN: subquery mentah ke `projects` di dalam policy TIDAK berfungsi
-- untuk role anon — RLS `projects_select_own` ikut diterapkan di dalam
-- ekspresi policy, sehingga anon selalu melihat 0 baris (insert publik ke
-- proyek published ikut diblokir). Solusi pakai predikat security definer
-- (pola sama seperti get_published_design/is_internal): RLS pada projects
-- di-bypass, tapi hanya status 'published' yang lolos.
drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  to anon, authenticated
  with check (public.is_project_published(project_id));

-- 4) RPC METADATA ABSEN: kembalikan (id, title, slug) HANYA bila proyek
--    published & valid. Dipakai halaman /absen/[projectId] agar tidak
--    bocor info proyek draft/privasi lain.
create or replace function public.get_abs_project_meta(p_project_id uuid)
returns table (id uuid, title text, slug text)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.title, p.slug
  from public.projects p
  where p.id = p_project_id
    and p.status = 'published'
  limit 1;
$$;

grant execute on function public.get_abs_project_meta(uuid) to anon, authenticated;

-- 5) RPC CHECK-IN VIA TOKEN (prosedur ber-lapisan, idempoten).
--    Lapisan:
--      1. Proyek harus published → selain itu return error, jangan insert.
--      2. Rate limit per proyek (anti-spam token) via check_rate_limit
--         action 'checkin_token'. Lapisan per-IP tetap ditangani trigger
--         validate_checkin (0006) yang aktif saat insert.
--      3. Token harus milik RSVP proyek ini → bukan → 'token tidak valid'.
--      4. Idempoten: bila RSVP sudah check-in, kembalikan data existing
--         (ok=true) tanpa insert — scan ulang QR tidak menggandakan.
--      5. Insert checkins(project_id, name, guest_count) dari identitas
--         RSVP, lalu return (ok, name, guest_count, created_at).
--    Catatan keamanan: fungsi ini security definer (owner) sehingga SELECT
--    rsvps dan INSERT checkins lolos RLS, dan bisa memanggil
--    check_rate_limit/get_client_ip yang grant-nya dicabut di 0010 — tetap
--    terkunci karena hanya mengekspos nama/guest_count/created_at.
create or replace function public.record_checkin_from_token(
  p_project_id uuid,
  p_token uuid
)
returns table (ok boolean, error text, name text, guest_count int, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rsvp public.rsvps%rowtype;
  v_checkin public.checkins%rowtype;
begin
  -- Lapisan 1: proyek harus published.
  if not public.is_project_published(p_project_id) then
    if not exists (select 1 from public.projects p where p.id = p_project_id) then
      ok := false;
      error := 'proyek tidak ditemukan';
    else
      ok := false;
      error := 'proyek belum dipublikasikan';
    end if;
    return next;
    return;
  end if;

  -- Lapisan 2: batasi percobaan per proyek (60 permintaan/menit). Trigger
  -- validate_checkin (0006) tetap aktif: validasi nama & jumlah tamu plus
  -- rate limit per IP saat insert berlangsung.
  if not public.check_rate_limit('checkin_token', p_project_id::text, 60, 60) then
    ok := false;
    error := 'Terlalu cepat. Silakan tunggu sebentar.';
    return next;
    return;
  end if;

  -- Lapisan 3: token harus milik RSVP proyek ini.
  select * into v_rsvp
  from public.rsvps
  where project_id = p_project_id
    and checkin_token = p_token;

  if not found then
    ok := false;
    error := 'token tidak valid';
    return next;
    return;
  end if;

  -- Lapisan 4 (idempoten): RSVP sudah check-in? Kembalikan data existing.
  select c.id, c.project_id, c.name, c.guest_count, c.created_at
  into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at
  from public.checkins c
  where c.project_id = p_project_id
    and c.name = v_rsvp.name
    and c.guest_count = v_rsvp.guest_count
  order by c.created_at desc
  limit 1;

  if found then
    ok := true;
    error := null;
    name := v_checkin.name;
    guest_count := v_checkin.guest_count;
    created_at := v_checkin.created_at;
    return next;
    return;
  end if;

  -- Lapisan 5: catat check-in baru dari identitas RSVP. Exception dari
  -- trigger (mis. rate limit per-IP habis) ditangkap agar klien anon
  -- menerima baris error yang bersih, bukan exception HTTP mentah.
  begin
    insert into public.checkins as c (project_id, name, guest_count)
    values (p_project_id, v_rsvp.name, v_rsvp.guest_count)
    returning c.id, c.project_id, c.name, c.guest_count, c.created_at
    into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at;
  exception
    when others then
      ok := false;
      error := sqlerrm;
      return next;
      return;
  end;

  ok := true;
  error := null;
  name := v_checkin.name;
  guest_count := v_checkin.guest_count;
  created_at := v_checkin.created_at;
  return next;
end;
$$;

grant execute on function public.record_checkin_from_token(uuid, uuid) to anon, authenticated;
