import { supabase } from '@/lib/supabase/client';

export interface OrderInput {
  templateName?: string;
  name: string;
  whatsapp: string;
  note?: string;
}

/** Simpan pesanan (format pemesanan) ke tabel `orders` — publik, tanpa login. */
export async function clientSubmitOrder(input: OrderInput): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('orders').insert({
      template_name: input.templateName ?? null,
      name: input.name,
      whatsapp: input.whatsapp ?? null,
      note: input.note ?? null
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Gagal menyimpan pesanan' };
  }
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}