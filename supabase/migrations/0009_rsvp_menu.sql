-- ============================================================
-- RSVP menu pilihan tamu (WeddingPress-style: starter/main/dessert)
-- ============================================================
alter table public.rsvps
  add column if not exists menu_options jsonb;

alter table public.rsvps
  add column if not exists meal_choice text;