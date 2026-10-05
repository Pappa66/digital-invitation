-- Read-receipt (undangan dibuka) + statistik host. Aditif.
create table if not exists public.invitation_views (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  created_at timestamptz not null default now()
);
create index if not exists invitation_views_project_idx on public.invitation_views (project_id, created_at desc);
alter table public.invitation_views enable row level security;

drop policy if exists "invitation_views_insert_public" on public.invitation_views;
create policy "invitation_views_insert_public"
  on public.invitation_views for insert
  with check (public.is_project_published(project_id));

drop policy if exists "invitation_views_select_owner" on public.invitation_views;
create policy "invitation_views_select_owner"
  on public.invitation_views for select
  using (
    public.is_internal()
    or exists (select 1 from public.projects p where p.id = invitation_views.project_id and p.user_id = auth.uid())
  );

grant insert on public.invitation_views to anon, authenticated;
grant select on public.invitation_views to authenticated;

create or replace function public.record_invitation_view(p_project_id uuid)
returns boolean
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if not public.is_project_published(p_project_id) then
    return false;
  end if;
  insert into public.invitation_views (project_id) values (p_project_id);
  return true;
end;
$$;
grant execute on function public.record_invitation_view(uuid) to anon, authenticated;

drop function if exists public.get_project_stats(uuid);
create or replace function public.get_project_stats(p_project_id uuid)
returns table (rsvp_total bigint, rsvp_hadir bigint, checkin_total bigint, views_total bigint)
language plpgsql security definer set search_path = public, extensions
as $$
begin
  if not (
    public.is_internal()
    or exists (select 1 from public.projects p where p.id = p_project_id and p.user_id = auth.uid())
  ) then
    return;
  end if;
  return query
    select
      (select count(*) from public.rsvps r where r.project_id = p_project_id),
      (select count(*) from public.rsvps r where r.project_id = p_project_id and r.attendance = 'hadir'),
      (select count(*) from public.checkins c where c.project_id = p_project_id),
      (select count(*) from public.invitation_views v where v.project_id = p_project_id);
end;
$$;
grant execute on function public.get_project_stats(uuid) to authenticated;
