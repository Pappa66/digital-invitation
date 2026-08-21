import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { isAllowedEmail } from '@/lib/auth-allowed';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  // Supabase kadang mengirim next di state, bukan searchParams — fallback ke /dashboard
  const next = searchParams.get('next') ?? '/dashboard';
  // Origin yang benar di Vercel: pakai x-forwarded-host/proto (custom domain), fallback ke origin request
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const originFromHeader =
    forwardedHost ? `${forwardedProto ?? 'https'}://${forwardedHost}` : new URL(request.url).origin;

  // --- OAuth gagal di sisi penyedia/Google (tidak ada `code`) -------------
  // Supabase mengarahkan kembali dengan error + error_description, mis. saat
  // provider belum dikonfigurasi, redirect URL tidak terdaftar, atau user
  // membatalkan. Beri pesan yang akurat, bukan "Sesi login tidak valid".
  const oauthError = searchParams.get('error');
  if (!code) {
    if (oauthError === 'access_denied') {
      return NextResponse.redirect(`${originFromHeader}/login?error=cancelled`);
    }
    const description = (searchParams.get('error_description') ?? '').trim();
    const base = `${originFromHeader}/login?error=oauth`;
    if (description) {
      return NextResponse.redirect(`${base}&description=${encodeURIComponent(description.slice(0, 300))}`);
    }
    return NextResponse.redirect(base);
  }

  // Buat response redirect dulu agar cookie auth bisa ditempel (pola resmi Supabase SSR)
  const redirectUrl = `${originFromHeader}${next.startsWith('/') ? next : '/dashboard'}`;
  const response = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        }
      }
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Kode PKCE tidak valid/kedaluwarsa — biasanya token kedaluwarsa (AAL/timeout).
    const description = (error.message ?? '').trim();
    const base = `${originFromHeader}/login?error=session_expired`;
    if (description && description !== 'Invalid code' && description !== 'invalid code') {
      return NextResponse.redirect(`${base}&description=${encodeURIComponent(description.slice(0, 300))}`);
    }
    return NextResponse.redirect(base);
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!isAllowedEmail(user?.email)) {
    await supabase.auth.signOut();
    // signOut menempel cookie clear ke `response` — salin Set-Cookie ke redirect forbidden
    const forbidden = NextResponse.redirect(`${originFromHeader}/login?error=forbidden`);
    response.headers.getSetCookie().forEach((cookie) => {
      forbidden.headers.append('set-cookie', cookie);
    });
    return forbidden;
  }

  // Sukses — kembalikan response yang sudah ditempel cookie session
  return response;
}