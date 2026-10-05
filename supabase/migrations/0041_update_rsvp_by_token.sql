-- Tamu bisa mengubah konfirmasi RSVP-nya lewat token pribadi (aditif, tanpa hapus).
create or replace function public.update_rsvp_by_token(
  p_token uuid,
  p_attendance text,
  p_guest_count int,
  p_message text,
  p_meal_choice text default null,
  p_menu_options jsonb default null
)
returns table (ok boolean, error text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if p_attendance not in ('hadir', 'tidak', 'ragu') then
    ok := false; error := 'Kehadiran tidak valid'; return next; return;
  end if;
  if p_guest_count < 1 or p_guest_count > 10 then
    ok := false; error := 'Jumlah tamu tidak valid'; return next; return;
  end if;
  if p_message is not null and length(p_message) > 500 then
    ok := false; error := 'Pesan terlalu panjang'; return next; return;
  end if;

  select r.id into v_id from public.rsvps r where r.checkin_token = p_token;
  if v_id is null then
    ok := false; error := 'RSVP tidak ditemukan'; return next; return;
  end if;

  update public.rsvps r
     set attendance = p_attendance,
         guest_count = p_guest_count,
         message = nullif(btrim(coalesce(p_message, '')), ''),
         meal_choice = p_meal_choice,
         menu_options = p_menu_options
   where r.id = v_id;

  ok := true; error := null; return next;
end;
$$;

grant execute on function public.update_rsvp_by_token(uuid, text, int, text, text, jsonb) to anon, authenticated;
