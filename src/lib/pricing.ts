/**
 * Helper harga & promo yang dipakai bersama oleh landing (hero bubble),
 * dialog pemesanan, dan pengaturan. Satu sumber agar perhitungan diskon /
 * kedaluwarsa tidak berbeda antar alur.
 */

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  total: number;
}

/**
 * Sisa waktu menuju `expiresAt`. Mengembalikan `null` bila tenggat kosong,
 * tanggal tidak valid, atau sudah lewat. (Sebelumnya `new Date('')` menghasilkan
 * `NaN` sehingga countdown sempat menampilkan "NaNh NaNj NaNm".)
 */
export function getTimeRemaining(expiresAt?: string | null): TimeRemaining | null {
  if (!expiresAt) return null;
  const target = new Date(expiresAt).getTime();
  if (Number.isNaN(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, total: diff };
}

/**
 * Promo kedaluwarsa hanya bila ada tenggat dan sudah lewat.
 * Tanpa tenggat (`''`/kosong) berarti promo tidak punya batas waktu.
 */
export function isPromoExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return getTimeRemaining(expiresAt) === null;
}

/** Harga final setelah diskon persen, dibulatkan ke rupiah penuh. */
export function computeFinalPrice(basePrice: number, discountPercent: number): number {
  if (!basePrice || basePrice <= 0) return 0;
  if (!discountPercent || discountPercent <= 0) return basePrice;
  return Math.round(basePrice * (1 - discountPercent / 100));
}
