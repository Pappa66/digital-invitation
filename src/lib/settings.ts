import { createBrowserClient } from '@supabase/ssr';
import { ORDER_WHATSAPP } from '@/lib/order';

/** Client Supabase instance untuk settings (hanya dipanggil dari client components). */
function getClientSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Key untuk nomor WhatsApp bisnis penerima pesanan. */
export const SETTING_ORDER_WHATSAPP = 'order_whatsapp';

export interface SettingRow {
  key: string;
  value: string | null;
}

/**
 * Ambil nomor WhatsApp bisnis dari tabel settings (publik, tanpa login).
 * Jatuh kembali ke nilai statis ORDER_WHATSAPP bila belum diset di dashboard
 * atau database tidak bisa dijangkau.
 */
export async function getOrderWhatsapp(): Promise<string> {
  try {
    const supabase = getClientSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTING_ORDER_WHATSAPP)
      .maybeSingle();
    if (error) return ORDER_WHATSAPP;
    const value = (data?.value ?? '').trim();
    return value || ORDER_WHATSAPP;
  } catch {
    return ORDER_WHATSAPP;
  }
}

/** Normalisasi nomor: hanya angka, hilangkan awalan 0 jadi kode negara 62. */
export function toWaNumber(input: string): string {
  let digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) digits = `62${digits.slice(1)}`;
  return digits;
}

/** Baca seluruh pengaturan (dipakai halaman pengaturan dashboard). */
export async function listSettings(): Promise<SettingRow[]> {
  const supabase = getClientSupabase();
  const { data, error } = await supabase.from('settings').select('key, value').order('key');
  if (error) throw new Error(error.message);
  return (data ?? []) as SettingRow[];
}

/** Simpan satu pengaturan (hanya user terautentikasi). */
export async function saveSetting(key: string, value: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getClientSupabase();
  const { error } = await supabase
    .from('settings')
    .upsert({ key, value: value.trim(), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
