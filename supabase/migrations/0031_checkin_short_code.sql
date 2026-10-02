-- Kode check-in pendek (6 karakter) untuk absen manual + RPC record_checkin_by_code.
alter table public.rsvps add column if not exists checkin_code text;
create index if not exists rsvps_checkin_code_idx on public.rsvps (checkin_code);

create or replace function public.record_checkin_by_code(
  p_project_id uuid,
  p_code text
)
returns table (ok boolean, error text, name text, guest_count int, created_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_rsvp public.rsvps%rowtype;
  v_checkin public.checkins%rowtype;
begin
  if not public.is_project_published(p_project_id) then
    if not exists (select 1 from public.projects p where p.id = p_project_id) then
      ok := false; error := 'proyek tidak ditemukan';
    else
      ok := false; error := 'proyek belum dipublikasikan';
    end if;
    return next; return;
  end if;

  if not public.check_rate_limit('checkin_code', p_project_id::text, 60, 60) then
    ok := false; error := 'Terlalu cepat. Silakan tunggu sebentar.';
    return next; return;
  end if;

  select * into v_rsvp
  from public.rsvps
  where project_id = p_project_id
    and upper(checkin_code) = upper(btrim(p_code));

  if not found then
    ok := false; error := 'kode tidak valid';
    return next; return;
  end if;

  select c.id, c.project_id, c.name, c.guest_count, c.created_at
  into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at
  from public.checkins c
  where c.project_id = p_project_id
    and c.name = v_rsvp.name
    and c.guest_count = v_rsvp.guest_count
  order by c.created_at desc
  limit 1;

  if found then
    ok := true; error := null;
    name := v_checkin.name; guest_count := v_checkin.guest_count; created_at := v_checkin.created_at;
    return next; return;
  end if;

  begin
    insert into public.checkins as c (project_id, name, guest_count)
    values (p_project_id, v_rsvp.name, v_rsvp.guest_count)
    returning c.id, c.project_id, c.name, c.guest_count, c.created_at
    into v_checkin.id, v_checkin.project_id, v_checkin.name, v_checkin.guest_count, v_checkin.created_at;
  exception
    when others then
      ok := false; error := sqlerrm;
      return next; return;
  end;

  ok := true; error := null;
  name := v_checkin.name; guest_count := v_checkin.guest_count; created_at := v_checkin.created_at;
  return next;
end;
$$;

grant execute on function public.record_checkin_by_code(uuid, text) to anon, authenticated;
