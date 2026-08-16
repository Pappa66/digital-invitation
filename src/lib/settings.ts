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

/** Key untuk konten landing page (hero, stats, fitur, FAQ, CTA, footer). */
export const SETTING_LANDING_CONTENT = 'landing_content';

export interface LandingImage {
  url: string;
  alt: string;
}

export interface LandingStat {
  value: number;
  suffix: string;
  label: string;
}

export interface LandingItem {
  icon: string;
  title: string;
  desc: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingContent {
  hero: {
    kicker: string;
    title_a: string;
    title_b: string;
    subtitle: string;
    cta_primary: string;
    cta_secondary: string;
    images: LandingImage[];
  };
  stats: LandingStat[];
  steps: LandingItem[];
  features: LandingItem[];
  faq: LandingFaq[];
  cta: {
    kicker: string;
    title: string;
    body: string;
    button_text: string;
  };
  footer: {
    description: string;
    whatsapp: string;
    instagram: string;
    website: string;
    tagline: string;
  };
}

export const LANDING_CONTENT_DEFAULTS: LandingContent = {
  hero: {
    kicker: 'Undangan Digital Pernikahan',
    title_a: 'Merayakan cinta,',
    title_b: 'dalam karya yang abadi.',
    subtitle:
      'Pilih desain favorit, isi form pemesanan, dan tim kami menyusun teks, foto, musik, serta link undangannya — Anda tinggal terima hasilnya.',
    cta_primary: 'Jelajahi Demo',
    cta_secondary: 'Pesan Undangan',
    images: []
  },
  stats: [
    { value: 500, suffix: '+', label: 'Undangan Dikirim' },
    { value: 10000, suffix: '+', label: 'Tamu Hadir' },
    { value: 39, suffix: '+', label: 'Demo Tersedia' }
  ],
  steps: [
    { icon: 'Palette', title: 'Pilih Desain', desc: 'Jelajahi demo kami, pilih yang paling dekat dengan cerita Anda.' },
    { icon: 'MessageCircle', title: 'Isi Form & Bayar', desc: 'Isi data mempelai, acara, dan foto. Konfirmasi pembayaran via WhatsApp.' },
    { icon: 'CheckCircle', title: 'Kami Kerjakan', desc: 'Tim kami menyusun teks, foto, musik, dan link undangan — siap dalam 2-5 hari kerja.' },
    { icon: 'Share2', title: 'Bagikan', desc: 'Terbitkan link, kirim per tamu lewat WhatsApp, pantau RSVP dari dasbor.' }
  ],
  features: [
    { icon: 'MessageCircle', title: 'RSVP & Buku Tamu', desc: 'Konfirmasi kehadiran dalam sekali ketuk, ucapan & doa tampil langsung.' },
    { icon: 'Gift', title: 'Amplop Digital', desc: 'Nomor rekening tersembunyi, muncul saat tombol "Beri Kado" ditekan.' },
    { icon: 'QrCode', title: 'QR Check-in', desc: 'Tamu memindai QR di venue untuk absen masuk — daftar kehadiran siap diunduh.' },
    { icon: 'Music', title: 'Musik Latar', desc: 'Autoplay atau on-demand, dengan offset untuk mulai dari bagian tertentu.' },
    { icon: 'Image', title: 'Galeri Animasi', desc: '20 efek foto termasuk ken-burns, flip, carousel, dan zoom.' },
    { icon: 'MapPin', title: 'Detail Acara & Peta', desc: 'Tombol Maps satu klik, "Simpan ke Kalender", dan opsi live streaming.' },
    { icon: 'Smartphone', title: 'Responsif Mobile', desc: 'Optimal di semua ukuran layar — tamu buka dari HP tanpa masalah.' },
    { icon: 'Palette', title: 'Bingkai & Gaya Kartu', desc: '9 pilihan frame dekoratif, 6 gaya kartu, animasi masuk.' }
  ],
  faq: [
    { q: 'Bagaimana cara memesan?', a: 'Pilih demo, isi form pemesanan, lalu konfirmasi via WhatsApp. Tim kami akan menghubungi Anda untuk detail selanjutnya.' },
    { q: 'Berapa lama prosesnya?', a: '2-5 hari kerja setelah materi lengkap dan pembayaran dikonfirmasi. Revisi maksimal 2x sudah termasuk.' },
    { q: 'Apakah tamu perlu bayar untuk melihat undangan?', a: 'Tidak. Tamu cukup membuka link — musik, galeri, RSVP, QR check-in, dan buku tamu semuanya gratis.' },
    { q: 'Bisakah saya mengelola daftar tamu?', a: 'Bisa. Kirimkan daftar nama, dan kami personalisasikan link + ucapan WhatsApp per tamu. Anda pantau semuanya dari dasbor.' },
    { q: 'Apa yang saya terima?', a: 'Link undangan digital yang sudah diisi lengkap dengan panel kelola tamu, RSVP, dan daftar kehadiran hari-H.' }
  ],
  cta: {
    kicker: 'Undangan Anda menanti.',
    title: 'Siap merayakan hari besar dengan elegan?',
    body: 'Pilih demo, isi form, bayar — kami kerjakan sisanya.',
    button_text: 'Pesan Undangan'
  },
  footer: {
    description: 'Undangan digital mewah dan personal untuk hari istimewa Anda.',
    whatsapp: '6281234567890',
    instagram: 'prashadigitalindonesia',
    website: 'https://prashadigitalindonesia.com',
    tagline: 'Made with Love by PT. Prasha Digital Indonesia'
  }
};

/** Ambil konten landing dari Supabase (dipakai landing page publik). */
export async function getLandingContent(): Promise<LandingContent> {
  try {
    const supabase = getClientSupabase();
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', SETTING_LANDING_CONTENT)
      .maybeSingle();
    if (error || !data?.value) return LANDING_CONTENT_DEFAULTS;
    const parsed = JSON.parse(data.value);
    return deepMerge(LANDING_CONTENT_DEFAULTS, parsed);
  } catch {
    return LANDING_CONTENT_DEFAULTS;
  }
}

/** Simpan konten landing ke Supabase. */
export async function saveLandingContent(content: LandingContent): Promise<{ ok: boolean; error?: string }> {
  return saveSetting(SETTING_LANDING_CONTENT, JSON.stringify(content));
}

/** Gabungkan objek secara dangkal-tapi-rekursif agar field baru ikut default saat data lama belum lengkap. */
function deepMerge<T>(base: T, patch: Partial<T>): T {
  if (typeof base !== 'object' || base === null) return patch as T;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(patch ?? {})) {
    const pb = patch as Record<string, unknown>;
    const baseVal = result[key];
    const patchVal = pb[key];
    result[key] =
      Array.isArray(baseVal) || Array.isArray(patchVal)
        ? (patchVal as unknown) ?? baseVal
        : typeof baseVal === 'object' && baseVal !== null && typeof patchVal === 'object' && patchVal !== null
          ? deepMerge(baseVal, patchVal as unknown as object)
          : patchVal ?? baseVal;
  }
  return result as T;
}
