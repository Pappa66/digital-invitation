-- Hindari kegagalan insert karena tabrakan kode 6 karakter.
drop index if exists public.rsvps_checkin_code_uidx;
create index if not exists rsvps_checkin_code_idx on public.rsvps (checkin_code);
