-- ============================================================
-- 0016_share_edit_tokens.sql
-- Token berbagi akses edit builder tanpa login.
-- Owner generate link dengan expiry → penerima bisa edit project
-- tanpa login, tercatat sebagai owner utama.
-- ============================================================

-- 1) Tabel baru: share_edit_tokens
create table if not exists public.share_edit_tokens (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  token       text not null unique,
  created_by  uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz not null,
  is_active   boolean not null default true,
  note        text,
  created_at  timestamptz not null default now()
);

-- Index untuk lookup cepat berdasarkan token
create unique index if not exists share_edit_tokens_token_uidx
  on public.share_edit_tokens (token);

-- Index untuk query by project_id
create index if not exists share_edit_tokens_project_idx
  on public.share_edit_tokens (project_id);

-- 2) RLS: hanya owner project yang bisa manage token
alter table public.share_edit_tokens enable row level security;

-- Owner bisa CRUD token project-nya sendiri
create policy "share_tokens_manage_owner"
  on public.share_edit_tokens for all
  to authenticated
  using (
    exists (
      select 1 from public.projects p
      where p.id = share_edit_tokens.project_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = share_edit_tokens.project_id
        and p.user_id = auth.uid()
    )
  );

-- Service role (server actions) bisa akses semua
create policy "share_tokens_service_role"
  on public.share_edit_tokens for all
  to service_role
  using (true)
  with check (true);

-- 3) RPC: generate share token (hanya owner)
create or replace function public.generate_share_edit_token(
  p_project_id uuid,
  p_expires_in_hours int default 24,
  p_note text default null
)
returns table (
  id uuid,
  token text,
  expires_at timestamptz,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_token text;
  v_expires_at timestamptz;
  v_id uuid;
  v_created_at timestamptz;
begin
  -- Cek authenticated
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Cek ownership
  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  -- Validate expiry
  if p_expires_in_hours < 1 or p_expires_in_hours > 168 then
    raise exception 'Expiry must be between 1 and 168 hours (7 days)';
  end if;

  -- Generate random token (32 bytes hex = 64 chars)
  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires_at := now() + (p_expires_in_hours || ' hours')::interval;

  -- Insert token
  insert into public.share_edit_tokens (project_id, token, created_by, expires_at, note)
  values (p_project_id, v_token, v_user_id, v_expires_at, p_note)
  returning share_edit_tokens.id, share_edit_tokens.token, share_edit_tokens.expires_at, share_edit_tokens.created_at
    into v_id, v_token, v_expires_at, v_created_at;

  return query select v_id, v_token, v_expires_at, v_created_at;
end;
$$;

-- 4) RPC: validate share token (public, tanpa login)
create or replace function public.validate_share_edit_token(
  p_token text
)
returns table (
  valid boolean,
  project_id uuid,
  project_title text,
  project_slug text,
  error text
)
language plpgsql
security definer
as $$
declare
  v_row record;
begin
  -- Cari token
  select * into v_row
  from public.share_edit_tokens
  where token = p_token;

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Token tidak ditemukan'::text;
    return;
  end if;

  -- Cek active
  if not v_row.is_active then
    return query select false, null::uuid, null::text, null::text, 'Token sudah dinonaktifkan'::text;
    return;
  end if;

  -- Cek expiry
  if v_row.expires_at < now() then
    return query select false, null::uuid, null::text, null::text, 'Token sudah kedaluwarsa'::text;
    return;
  end if;

  -- Cek project masih exists dan published
  return query
  select
    true,
    p.id,
    p.title,
    p.slug,
    null::text
  from public.projects p
  where p.id = v_row.project_id
    and p.status = 'published';

  if not found then
    return query select false, null::uuid, null::text, null::text, 'Project tidak ditemukan atau belum dipublikasikan'::text;
  end if;
end;
$$;

-- 5) RPC: revoke token (hanya owner)
create or replace function public.revoke_share_edit_token(
  p_token_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Cek ownership lewat project
  if not exists (
    select 1 from public.share_edit_tokens set
    join public.projects p on p.id = set.project_id
    where set.id = p_token_id
      and p.user_id = v_user_id
  ) then
    raise exception 'Token not found or access denied';
  end if;

  update public.share_edit_tokens
  set is_active = false
  where id = p_token_id;

  return true;
end;
$$;

-- 6) RPC: list tokens untuk project (hanya owner)
create or replace function public.list_share_edit_tokens(
  p_project_id uuid
)
returns table (
  id uuid,
  token text,
  expires_at timestamptz,
  is_active boolean,
  note text,
  created_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.projects
    where id = p_project_id and user_id = v_user_id
  ) then
    raise exception 'Project not found or access denied';
  end if;

  return query
  select set.id, set.token, set.expires_at, set.is_active, set.note, set.created_at
  from public.share_edit_tokens set
  where set.project_id = p_project_id
  order by set.created_at desc;
end;
$$;
