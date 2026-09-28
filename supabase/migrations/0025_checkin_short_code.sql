-- 0025) Kode check-in pendek (6 karakter) untuk input manual panitia.
alter table public.rsvps add column if not exists checkin_code text;
create index if not exists rsvps_checkin_code_idx on public.rsvps (project_id, lower(checkin_code));

drop function if exists public.submit_rsvp(uuid,text,text,int,text,uuid);

create or replace function public.submit_rsvp(
  p_project_id uuid, p_name text, p_attendance text, p_guest_count int,
  p_message text, p_checkin_token uuid, p_checkin_code text
) returns table(ok boolean, error text)
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from projects p where p.id=p_project_id and p.status='published') then
    return query select false,'Undangan belum dipublikasikan'::text; return; end if;
  if length(trim(coalesce(p_name,'')))<2 then return query select false,'Nama tidak valid'::text; return; end if;
  if p_attendance not in ('hadir','tidak') then return query select false,'Kehadiran tidak valid'::text; return; end if;
  if p_guest_count<1 or p_guest_count>10 then return query select false,'Jumlah tamu tidak valid'::text; return; end if;
  if exists(select 1 from rsvps r where r.project_id=p_project_id and lower(trim(r.name))=lower(trim(p_name)) and r.created_at>now()-interval '5 minutes') then
    return query select true,null::text; return; end if;
  insert into public.rsvps(project_id,name,attendance,guest_count,message,checkin_token,checkin_code)
  values (p_project_id, trim(p_name), p_attendance, p_guest_count, nullif(trim(coalesce(p_message,'')),''), p_checkin_token, nullif(upper(trim(coalesce(p_checkin_code,''))),''));
  return query select true,null::text;
end; $$;
grant execute on function public.submit_rsvp(uuid,text,text,int,text,uuid,text) to anon, authenticated;

create or replace function public.record_checkin_by_code(p_project_id uuid, p_code text)
returns table(ok boolean, error text, name text, guest_count int, created_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare v_rsvp public.rsvps%rowtype; v_checkin public.checkins%rowtype;
begin
  if not public.is_project_published(p_project_id) then
    if not exists(select 1 from public.projects p where p.id=p_project_id) then
      ok:=false; error:='proyek tidak ditemukan'; else ok:=false; error:='proyek belum dipublikasikan'; end if;
    return next; return;
  end if;
  if not public.check_rate_limit('checkin_code', p_project_id::text, 60, 60) then
    ok:=false; error:='Terlalu cepat. Silakan tunggu sebentar.'; return next; return;
  end if;
  select * into v_rsvp from public.rsvps where project_id=p_project_id and lower(checkin_code)=lower(trim(p_code));
  if not found then ok:=false; error:='kode tidak valid'; return next; return; end if;
  select * into v_checkin from public.checkins c where c.project_id=p_project_id and lower(c.name)=lower(v_rsvp.name) limit 1;
  if found then ok:=true; error:=null; name:=v_checkin.name; guest_count:=v_checkin.guest_count; created_at:=v_checkin.created_at; return next; return; end if;
  insert into public.checkins(project_id,name,guest_count) values (p_project_id, v_rsvp.name, v_rsvp.guest_count) returning * into v_checkin;
  ok:=true; error:=null; name:=v_checkin.name; guest_count:=v_checkin.guest_count; created_at:=v_checkin.created_at; return next;
end; $$;
grant execute on function public.record_checkin_by_code(uuid,text) to anon, authenticated;
