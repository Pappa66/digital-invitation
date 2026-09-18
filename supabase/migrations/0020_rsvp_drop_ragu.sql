-- 0020) RSVP: buang opsi "ragu" (Belum pasti)
-- UI hanya menawarkan Hadir / Tidak Hadir. Jawaban "ragu" membuat data
-- konfirmasi kabur dan tidak bisa ditindaklanjuti panitia.

-- 1) Baris lama yang masih 'ragu' diperlakukan sebagai belum konfirmasi
--    hadir → 'tidak' (aman, tidak menambah kursi).
update public.rsvps set attendance = 'tidak' where attendance = 'ragu';

-- 2) Ganti check constraint agar hanya menyimpan hadir/tidak.
--    Nama default constraint kolom adalah rsvps_attendance_check.
alter table public.rsvps drop constraint if exists rsvps_attendance_check;
alter table public.rsvps
  add constraint rsvps_attendance_check
  check (attendance in ('hadir', 'tidak'));
