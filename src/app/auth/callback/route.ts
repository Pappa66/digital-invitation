import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAllowedEmail } from '@/lib/auth-allowed';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
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