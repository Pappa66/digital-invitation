// Nomor WhatsApp bisnis untuk menerima pesanan, format internasional tanpa '+',
// spasi, atau tanda hubung. Contoh: '6281234567890'.
// Kosongkan jika belum ada; tombol pemesanan akan menyalin pesan ke clipboard
// untuk dikirim manual.
export const ORDER_WHATSAPP = '';

export interface OrderInput {
  template?: string;
  name: string;
  whatsapp: string;
  note?: string;
}

export function buildOrderMessage({ template, name, whatsapp, note }: OrderInput): string {
  const lines = [
    'Halo, saya ingin memesan undangan digital.',
    template ? `Template yang dipilih: ${template}` : null,
    `Nama: ${name}`,
    `No. WhatsApp: ${whatsapp}`,
    note ? `Catatan: ${note}` : null
  ];
  return lines.filter((l): l is string => Boolean(l)).join('\n');
}

export function whatsappOrderUrl(message: string, whatsappNumber: string = ORDER_WHATSAPP): string {
  const number = normalizePhone(whatsappNumber);
  if (!number) return '';
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function normalizePhone(input: string): string {
  return input.replace(/[^\d]/g, '');
}