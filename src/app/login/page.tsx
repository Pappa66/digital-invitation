'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/demo/demo-store';
import { ALLOWED_EMAIL } from '@/lib/auth-allowed';

const ERROR_MSG: Record<string, string> = {
  forbidden: `Akun tidak diizinkan. Hanya ${ALLOWED_EMAIL} yang dapat masuk.`,
  auth_failed: 'Gagal masuk melalui Google. Silakan coba lagi.',
  no_code: 'Sesi login tidak valid. Silakan coba lagi.',
  cancelled: 'Login dibatalkan. Silakan coba lagi bila ingin masuk.',
  oauth: 'Login Google tidak dapat diproses. Periksa konfigurasi Google provider (Client ID/Secret & redirect URL) di Supabase.',
  session_expired: 'Kode login telah kedaluwarsa. Silakan coba lagi.'
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C36.9 40.3 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c9a45c]" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="#c9a45c" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c9a45c]" />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDemo = demoIsDemoMode();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const description = params.get('description');
    if (err && ERROR_MSG[err]) setError(description ? `${ERROR_MSG[err]}\n${description}` : ERROR_MSG[err]);

    if (!isDemo) {
      supabase.auth.getUser().then(({ data }) => {
        const email = data.user?.email?.toLowerCase();
        if (email && email !== ALLOWED_EMAIL) {
          supabase.auth.signOut();
        }
      });
    }
  }, [isDemo]);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Tanpa ?next — supaya lolos whitelist Supabase yang hanya berisi /auth/callback.
          // Callback default next=/dashboard (route.ts:9)
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        setError(ERROR_MSG.auth_failed);
        setLoading(false);
      }
    } catch {
      setError(ERROR_MSG.auth_failed);
      setLoading(false);
    }
  }

  async function enterDemo() {
    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf7f2] px-4">
      {/* ORNAMEN LATAR */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,138,0.08),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="rounded-2xl border border-[#e7ddcc] bg-white/80 p-8 shadow-2xl shadow-[#2b2620]/10 backdrop-blur">
          <div className="flex flex-col items-center">
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-[#3a332b] shadow-md">
              <Image src="/logo/prasha.png" width={64} height={64} alt="Prasha Digital" className="h-16 w-16 object-cover" />
            </span>
            <p className="mt-4 font-script text-3xl text-[#b98a3e]">Prasha</p>
            <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.35em] text-[#8a7a66]">Digital Indonesia</p>
          </div>

          <Ornament className="mt-4" />

          <h1 className="mt-4 text-center font-heading text-2xl font-medium text-[#2b2620]">Area Tim Prasha</h1>
          <p className="mt-1 text-center text-sm text-[#8a7a66]">
            {isDemo ? 'Mode Demo — masuk otomatis tanpa login Google' : 'Masuk untuk mengelola undangan & pesanan'}
          </p>

          {isDemo ? (
            <button
              onClick={enterDemo}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              Masuk Mode Demo
            </button>
          ) : (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-lg border border-[#e0d6c2] bg-white py-3 text-sm font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2] disabled:opacity-60"
            >
              <GoogleIcon />
              {loading ? 'Mengarahkan ke Google...' : 'Masuk dengan Google'}
            </button>
          )}

          {!isDemo && <p className="mt-4 text-center text-xs text-[#b3a69a]">Hanya akun {ALLOWED_EMAIL} yang diizinkan.</p>}
          {error && <p className="mt-4 whitespace-pre-line rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</p>}

          <Link
            href="/"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#e0d6c2] bg-white py-2.5 text-sm font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c] hover:bg-[#faf7f2]"
          >
            ← Kembali ke Beranda
          </Link>
        </div>

        <p className="mt-5 text-center text-xs text-[#b3a69a]">
          Undangan digital mewah &amp; personal &middot; {new Date().getFullYear()} Prasha Digital Indonesia
        </p>
      </div>
    </div>
  );
}
