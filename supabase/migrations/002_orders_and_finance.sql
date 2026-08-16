-- Migration: Add new columns to orders table + create finance_records table
-- Run this in Supabase SQL Editor

-- Orders: add status, email, template_id, project_id
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS template_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_id text;

-- Projects: add thumbnail
ALTER TABLE projects ADD COLUMN IF NOT EXISTS thumbnail text;

-- Finance records table
CREATE TABLE IF NOT EXISTS finance_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id text,
  client_name text NOT NULL,
  design_name text,
  base_price numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  promo_code text,
  promo_amount numeric DEFAULT 0,
  final_price numeric DEFAULT 0,
  payment_status text DEFAULT 'unpaid',
  payment_amount numeric DEFAULT 0,
  payment_date timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE finance_records ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access to finance_records
CREATE POLICY "Authenticated users can manage finance records"
  ON finance_records FOR ALL
  USING (auth.role() = 'authenticated');
