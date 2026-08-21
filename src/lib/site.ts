/** Origin situs untuk link publik (undangan, preview, absen).
 * - Di Vercel: pakai NEXT_PUBLIC_SITE_URL bila sudah di-set ke domain custom.
 * - Lokal: pakai window.location.origin agar tetap http://localhost:3000.
 * - Fallback: prashadigitalindonesia.com (custom domain), bukan vercel.app.
 */
export function getSiteOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  // Bila env adalah custom domain produksi, pakai itu (agar link tidak jadi vercel.app)
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    // window.origin di production sudah custom domain bila user buka via custom domain
    return window.location.origin.replace(/\/$/, '');
  }
  return 'https://prashadigitalindonesia.com';
}
