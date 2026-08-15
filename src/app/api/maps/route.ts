import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/** Whitelist host yang diizinkan untuk resolve URL. */
const ALLOWED_HOSTS = [
  'google.com',
  'www.google.com',
  'maps.google.com',
  'maps.app.goo.gl',
  'www.google.co.id'
];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h));
  } catch {
    return false;
  }
}

/**
 * Resolve tautan Google Maps (termasuk short link maps.app.goo.gl) menjadi
 * src iframe yang bisa di-embed. Browser memblokir iframe ke www.google.com
 * (X-Frame-Options), jadi selalu kembalikan host embeddable maps.google.com
 * dengan `output=embed`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('url') ?? '';

  if (!raw) return NextResponse.json({ src: null });

  if (!isAllowedUrl(raw)) {
    return NextResponse.json({ src: null }, { status: 400 });
  }

  let finalUrl = raw;
  try {
    const res = await fetch(raw, { redirect: 'follow', signal: AbortSignal.timeout(5000) });
    finalUrl = res.url || raw;
  } catch {
    /* pakai URL asli bila fetch gagal */
  }

  if (!isAllowedUrl(finalUrl)) {
    return NextResponse.json({ src: null }, { status: 400 });
  }

  const src = buildEmbedSrc(finalUrl) ?? (raw.includes('google') ? buildEmbedSrc(raw) : null);
  return NextResponse.json({ src });
}

function buildEmbedSrc(url: string): string | null {
  // sudah format embed / output=embed
  if (/[?&]output=embed/.test(url)) return url;
  if (/^https?:\/\/[^/]+\/maps\/embed/.test(url)) return url;
  // koordinat @lat,lng,z
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+)z)?/);
  if (at) return `https://maps.google.com/maps?q=${at[1]},${at[2]}&z=${at[3] ?? 15}&output=embed`;
  // ?q=...
  const q = url.match(/[?&]q=([^&#]+)/);
  if (q) return `https://maps.google.com/maps?q=${q[1]}&output=embed`;
  // maps/search/<query>
  const search = url.match(/maps\/search\/([^/#?@]+)/);
  if (search) return `https://maps.google.com/maps?q=${search[1]}&output=embed`;
  // maps/place/<name>
  const place = url.match(/maps\/place\/([^/#?@]+)/);
  if (place) return `https://maps.google.com/maps?q=${place[1]}&output=embed`;
  return null;
}
