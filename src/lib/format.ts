/**
 * Format angka ke Rupiah Indonesia.
 * Contoh: 99000 → "Rp 99.000", 1500000 → "Rp 1.500.000"
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace('Rp', 'Rp ')
    .trim();
}
