/** Flag demo mode, aman dibaca di client maupun server (inlined saat build).
 * Safety: di build production (Vercel) selalu false meski env var keliru true —
 * demo hanya boleh di localhost/dev. .env.local tidak pernah di-commit (.gitignore). */
export function demoIsDemoMode(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}