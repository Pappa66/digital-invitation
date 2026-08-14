'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/demo/demo-store';
import { ALLOWED_EMAIL } from '@/lib/auth-allowed';

const ERROR_MSG: Record<string, string> = {
  forbidden: `Akun tidak diizinkan. Hanya ${ALLOWED_EMAIL} yang dapat masuk.`,
  auth_failed: 'Gagal masuk melalui Google. Silakan coba lagi.',
  no_code: 'Sesi login tidak valid. Silakan coba lagi.'
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

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isDemo = demoIsDemoMode();

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error');
    if (err && ERROR_MSG[err]) setError(ERROR_MSG[err]);

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
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
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
    <div className="flex min-h-screen items-center justify-center bg-dashboard-bg px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-dashboard-border bg-white p-8 shadow-sm">
          <h1 className="text-center text-xl font-semibold text-gray-900">Digital Invitation Builder</h1>
          <p className="mt-1 text-center text-sm text-gray-500">
            {isDemo ? 'Mode Demo — masuk otomatis tanpa login Google' : 'Masuk tim internal'}
          </p>

          {isDemo ? (
            <button
              onClick={enterDemo}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-md bg-gray-900 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Masuk Mode Demo
            </button>
          ) : (
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:opacity-60"
            >
              <GoogleIcon />
              {loading ? 'Mengarahkan ke Google...' : 'Masuk dengan Google'}
            </button>
          )}

          {!isDemo && <p className="mt-4 text-center text-xs text-gray-400">Hanya akun {ALLOWED_EMAIL} yang diizinkan.</p>}
          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-center text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}