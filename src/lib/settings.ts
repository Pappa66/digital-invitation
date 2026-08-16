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

/** Key untuk pricing settings. */
export const SETTING_PRICING = 'landing_pricing';

export interface LandingPricing {
  base_price: number;
  discount_percent: number;
  promo_code: string;
  promo_expires_at: string;
  show_pricing: boolean;
}

/** Ambil pricing dari Supabase (dipakai landing page). */
export async function getPricing(): Promise<LandingPricing> {
  const fallback: LandingPricing = { base_price: 0, discount_percent: 0, promo_code: '', promo_expires_at: '', show_pricing: false };
  try {
    const supabase = getClientSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTING_PRICING)
      .maybeSingle();
    if (error || !data?.value) return fallback;
    return { ...fallback, ...JSON.parse(data.value) };
  } catch {
    return fallback;
  }
}

/** Simpan pricing ke Supabase. */
export async function savePricing(pricing: LandingPricing): Promise<{ ok: boolean; error?: string }> {
  return saveSetting(SETTING_PRICING, JSON.stringify(pricing));
}

/** Key untuk business name. */
export const SETTING_BUSINESS_NAME = 'business_name';

/** Ambil business name dari Supabase. */
export async function getBusinessName(): Promise<string> {
  try {
    const supabase = getClientSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTING_BUSINESS_NAME)
      .maybeSingle();
    if (error || !data?.value) return '';
    return data.value;
  } catch {
    return '';
  }
}
