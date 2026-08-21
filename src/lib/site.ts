/** Origin situs untuk link publik (undangan, preview, absen).
 * - Di Vercel: pakai NEXT_PUBLIC_SITE_URL bila sudah di-set ke domain custom.
 * - Lokal: pakai window.location.origin agar tetap http://localhost:3000.
 * - Fallback: prashadigitalindonesia.com (custom domain), bukan vercel.app.
 */
export function getSiteOrigin(): string {
  const custom = 'https://undangan-digital.prashadigitalindonesia.com';
  // Di browser: pakai custom domain untuk semua link publik di production,
  // agar preview/bagikan tidak jadi vercel.app meski builder dibuka via vercel.
  if (typeof window !== 'undefined' && window.location.origin) {
    const origin = window.location.origin.replace(/\/$/, '');
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) return origin;
    // Production: selalu custom, bukan vercel.app
    if (origin.includes('vercel.app')) return custom;
    return origin;
  }
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl && envUrl.includes('prashadigitalindonesia.com')) {
    return envUrl.replace(/\/$/, '');
  }
  return custom;
}
