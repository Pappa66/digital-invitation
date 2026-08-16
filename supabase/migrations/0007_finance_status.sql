-- ============================================================
-- Migration 0007: Normalisasi payment_status finance_records
-- Sistem lama pakai 'belum'/'dp'/'lunas', sistem baru hanya
-- 'unpaid' | 'paid'. Sinkronkan default + data lama.
-- ============================================================

-- Ubah default kolom ke sistem baru.
ALTER TABLE public.finance_records
  ALTER COLUMN payment_status SET DEFAULT 'unpaid';

-- Migrasi data lama: 'lunas' → 'paid', 'belum'/'dp' → 'unpaid'.
UPDATE public.finance_records
  SET payment_status = CASE
    WHEN payment_status = 'lunas' THEN 'paid'
    ELSE 'unpaid'
  END
  WHERE payment_status IN ('belum', 'dp', 'lunas');

-- Tambah constraint bila belum ada agar nilai tak dikenal ditolak.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'finance_records_payment_status_check')
  THEN
    ALTER TABLE public.finance_records
      ADD CONSTRAINT finance_records_payment_status_check
      CHECK (payment_status IN ('unpaid', 'paid'));
  END IF;
END $$;