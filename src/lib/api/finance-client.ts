import { supabase } from '@/lib/supabase/client';

export interface FinanceRecord {
  id: string;
  project_id: string;
  client_name: string;
  design_name: string;
  base_price: number;
  discount: number;
  promo_code: string;
  promo_amount: number;
  final_price: number;
  payment_status: 'unpaid' | 'paid';
  payment_amount: number;
  payment_date: string | null;
  notes: string;
  created_at: string;
}

export async function listFinanceRecords(): Promise<FinanceRecord[]> {
  const { data, error } = await supabase
    .from('finance_records' as never)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FinanceRecord[];
}

export async function addFinanceRecord(record: Omit<FinanceRecord, 'id' | 'created_at'>): Promise<FinanceRecord> {
  const { data, error } = await supabase
    .from('finance_records' as never)
    .insert(record as never)
    .select()
    .single();
  if (error) throw error;
  return data as FinanceRecord;
}

export async function updateFinanceRecord(id: string, updates: Partial<FinanceRecord>): Promise<void> {
  const { error } = await supabase
    .from('finance_records' as never)
    .update(updates as never)
    .eq('id', id);
  if (error) throw error;
}

export async function deleteFinanceRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from('finance_records' as never)
    .delete()
    .eq('id', id);
  if (error) throw error;
}
