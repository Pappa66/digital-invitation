import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth-allowed';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  // --- OAuth gagal di sisi penyedia/Google (tidak ada `code`) -------------
  // Supabase mengarahkan kembali dengan error + error_description, mis. saat
  // provider belum dikonfigurasi, redirect URL tidak terdaftar, atau user
  // membatalkan. Beri pesan yang akurat, bukan "Sesi login tidak valid".
  const oauthError = searchParams.get('error');
  if (!code) {
    if (oauthError === 'access_denied') {
      return NextResponse.redirect(`${origin}/login?error=cancelled`);
    }
    const description = (searchParams.get('error_description') ?? '').trim();
    const base = `${origin}/login?error=oauth`;
    if (description) {
      return NextResponse.redirect(`${base}&description=${encodeURIComponent(description.slice(0, 300))}`);
    }
    return NextResponse.redirect(base);
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    // Kode PKCE tidak valid/kedaluwarsa — biasanya token kedaluwarsa (AAL/timeout).
    const description = (error.message ?? '').trim();
    const base = `${origin}/login?error=session_expired`;
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
    return NextResponse.redirect(`${origin}/login?error=forbidden`);
  }

  return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/dashboard'}`);
}