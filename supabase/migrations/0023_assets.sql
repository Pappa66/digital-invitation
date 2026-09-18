-- 0023) Pustaka media: gambar yang pernah diunggah user, bisa dipakai ulang.

create table if not exists public.assets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  url        text not null,
  path       text,
  name       text,
  created_at timestamptz not null default now()
);

create index if not exists assets_user_idx on public.assets (user_id);

alter table public.assets enable row level security;

drop policy if exists "assets_manage_own" on public.assets;
create policy "assets_manage_own"
  on public.assets for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
