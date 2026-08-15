-- ============================================================
-- 0006 RATE LIMITING & SECURITY HARDENING
-- Server-side rate limiting untuk RSVP, check-in, dan orders.
-- ============================================================

-- 1) TABEL: rate_limits (server-side throttle)
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  identifier text not null,
  window_start timestamptz not null default now(),
  count int not null default 1
);

create index if not exists rate_limits_action_idx on public.rate_limits (action, identifier, window_start);

alter table public.rate_limits enable row level security;

-- Hanya service role yang bisa akses rate_limits (via RPC)
drop policy if exists "rate_limits_service_only" on public.rate_limits;
create policy "rate_limits_service_only"
  on public.rate_limits for all
  using (false)
  with check (false);

-- 2) FUNGSI: check_rate_limit
-- Cek apakah action masih dalam batas. Auto-cleanup window lama.
create or replace function public.check_rate_limit(
  p_action text,
  p_identifier text,
  p_window_sec int default 60,
  p_max_count int default 5
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_count int;
begin
  -- Bersihkan record lama (lebih dari window)
  delete from public.rate_limits
  where action = p_action
    and identifier = p_identifier
    and window_start < now() - (p_window_sec || ' seconds')::interval;

  -- Hitung request dalam window saat ini
  select count(*) into v_count
  from public.rate_limits
  where action = p_action
    and identifier = p_identifier
    and window_start >= now() - (p_window_sec || ' seconds')::interval;

  if v_count >= p_max_count then
    return false; -- rate limit exceeded
  end if;

  -- Catat request ini
  insert into public.rate_limits (action, identifier)
  values (p_action, p_identifier);

  return true; -- allowed
end;
$$;

grant execute on function public.check_rate_limit(text, text, int, int) to anon, authenticated;

-- 3) FUNGSI: get_client_ip (helper untuk ambil IP dari header)
create or replace function public.get_client_ip()
returns text
language sql
stable
as $$
  select coalesce(
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    current_setting('request.headers', true)::json->>'x-real-ip',
    'unknown'
  );
$$;

-- 4) UPDATE: validate_rsvp tambah rate limit check
create or replace function public.validate_rsvp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  if new.guest_count < 1 or new.guest_count > 10 then
    raise exception 'Jumlah tamu tidak valid';
  end if;
  if new.message is not null and length(new.message) > 500 then
    raise exception 'Pesan terlalu panjang';
  end if;
  new.name := left(btrim(new.name), 80);

  -- Rate limit: max 10 RSVP per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('rsvp', v_ip, 60, 10) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

-- 5) UPDATE: checkins insert policy — harus project published
drop policy if exists "checkins_insert_public" on public.checkins;
create policy "checkins_insert_public"
  on public.checkins for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = checkins.project_id
        and p.status = 'published'
    )
  );

-- 6) UPDATE: checkins tambah rate limit trigger
create or replace function public.validate_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  if new.guest_count < 1 or new.guest_count > 10 then
    raise exception 'Jumlah tamu tidak valid';
  end if;
  new.name := left(btrim(new.name), 80);

  -- Rate limit: max 3 check-in per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('checkin', v_ip, 60, 3) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

drop trigger if exists checkins_validate on public.checkins;
create trigger checkins_validate
  before insert on public.checkins
  for each row execute function public.validate_checkin();

-- 7) UPDATE: orders rate limit trigger
create or replace function public.validate_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip text;
begin
  if new.name is null or length(trim(new.name)) < 2 then
    raise exception 'Nama terlalu pendek';
  end if;
  new.name := left(btrim(new.name), 80);

  -- Rate limit: max 3 order per 60 detik per IP
  v_ip := public.get_client_ip();
  if not public.check_rate_limit('order', v_ip, 60, 3) then
    raise exception 'Terlalu cepat. Silakan tunggu sebentar.';
  end if;

  return new;
end;
$$;

drop trigger if exists orders_validate on public.orders;
create trigger orders_validate
  before insert on public.orders
  for each row execute function public.validate_order();
