-- 0024) RSVP server-side: validasi + dedupe (idempoten) + hanya proyek published.
create or replace function public.submit_rsvp(
  p_project_id uuid, p_name text, p_attendance text, p_guest_count int, p_message text, p_checkin_token uuid
) returns table(ok boolean, error text)
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from projects p where p.id = p_project_id and p.status = 'published') then
    return query select false, 'Undangan belum dipublikasikan'::text; return;
  end if;
  if length(trim(coalesce(p_name,''))) < 2 then
    return query select false, 'Nama tidak valid'::text; return;
  end if;
  if p_attendance not in ('hadir','tidak') then
    return query select false, 'Kehadiran tidak valid'::text; return;
  end if;
  if p_guest_count < 1 or p_guest_count > 10 then
    return query select false, 'Jumlah tamu tidak valid'::text; return;
  end if;
  -- Dedupe: nama sama dalam 5 menit dianggap sudah terkirim (idempoten).
  if exists(
    select 1 from rsvps r
    where r.project_id = p_project_id
      and lower(trim(r.name)) = lower(trim(p_name))
      and r.created_at > now() - interval '5 minutes'
  ) then
    return query select true, null::text; return;
  end if;
  insert into public.rsvps(project_id, name, attendance, guest_count, message, checkin_token)
  values (p_project_id, trim(p_name), p_attendance, p_guest_count, nullif(trim(coalesce(p_message,'')),''), p_checkin_token);
  return query select true, null::text;
end; $$;
grant execute on function public.submit_rsvp(uuid,text,text,int,text,uuid) to anon, authenticated;
