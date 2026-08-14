import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isAllowedEmail } from '@/lib/auth-allowed';

// Rute yang hanya boleh diakses user terautentikasi.
// /invite sengaja TIDAK di sini: halamannya memvalidasi sendiri
// token akses (?t=...) bagi pihak yang terikat desain tanpa login.
// Catatan: /templates/{id} (preview publik) TIDAK boleh dikunci;
// hanya halaman pengelolaan "/templates" (admin) yang butuh login.
const AUTH_PREFIXES = ['/dashboard', '/builder', '/orders'];
const AUTH_EXACT = ['/templates'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Mode demo: semua rute terbuka agar aplikasi bisa dicoba tanpa login.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return NextResponse.next({ request });
  }

  const isAsset = pathname.startsWith('/_next') || pathname === '/favicon.ico';
  const isLogin = pathname === '/login';
  const isApi = pathname.startsWith('/api');

  // Slug undangan publik: satu segmen, dan bukan rute admin/login/aset/api.
  const isGuestSlug =
    !isAsset &&
    !isApi &&
    pathname !== '/' &&
    pathname.split('/').length === 2 &&
    !AUTH_PREFIXES.includes(pathname) &&
    !AUTH_EXACT.includes(pathname) &&
    !isLogin;

  if (isGuestSlug || isAsset || isApi) {
    // Jangan refresh token di rute publik/aset (hindari cookie ops + kebocoran).
    return NextResponse.next({ request });
  }

  const res = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
          if (headers) {
            Object.entries(headers).forEach(([key, value]) => res.headers.set(key, value));
          }
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAuthArea =
    AUTH_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/')) ||
    AUTH_EXACT.some((p) => pathname === p || pathname === p + '/');
  const allowed = isAllowedEmail(user?.email);

  if (isAuthArea && !user) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Akun lain tidak boleh menyentuh area internal (biarkan halaman login tampil,
  // klien yang akan signOut sesi tersebut).
  if (isAuthArea && user && !allowed) {
    return NextResponse.redirect(new URL('/login?error=forbidden', request.url));
  }

  if (isLogin && user && allowed) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
