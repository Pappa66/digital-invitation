/** Flag demo mode, aman dibaca di client maupun server (inlined saat build). */
export function demoIsDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}