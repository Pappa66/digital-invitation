'use client';

import { useEffect, useState } from 'react';
import { validateCanvasData } from '@/lib/validations';
import GuestRenderer from '@/components/guest/GuestRenderer';
import { GuestSkeleton, Spinner } from '@/components/ui/skeleton';

interface GuestViewProps {
  projectId: string;
  canvas: Record<string, unknown>;
  /** Nama tamu dari query ?to= (opsional). */
  to?: string;
}

/**
 * Gate validasi struktural kanvas. Data yang lolos divalidasi akan
 * dirender; data yang GAGAL tidak boleh dirender mentah — tampilkan
 * placeholder error yang aman (tanpa konten data pengguna).
 */
export default function GuestView({ projectId, canvas, to }: GuestViewProps) {
  const validated = validateCanvasData(canvas);
  const [ready, setReady] = useState(() => {
    // Di test (jsdom) langsung ready agar tidak flaky
    if (typeof window === 'undefined') return true;
    if (process.env.NODE_ENV === 'test') return true;
    return false;
  });

  // Font loading hanya untuk data yang sah + beri jeda skeleton 300ms agar tidak flash
  useEffect(() => {
    if (!validated) return;
    if (process.env.NODE_ENV === 'test') {
      setReady(true);
      return;
    }
    const fonts = Array.from(new Set([validated.theme.font_heading, validated.theme.font_body]));
    const families = fonts.map((f) => `family=${encodeURIComponent(f)}`).join('&');
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    const t = setTimeout(() => setReady(true), 280);
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => setReady(true)).catch(() => {});
    }
    return () => {
      clearTimeout(t);
      document.head.removeChild(link);
    };
  }, [validated?.theme.font_heading, validated?.theme.font_body]);

  if (!validated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#faf7f2] px-6 text-center">
        <p className="text-sm font-medium text-gray-700">Undangan tidak dapat ditampilkan</p>
        <p className="max-w-xs text-xs leading-relaxed text-gray-400">
          Terjadi kesalahan struktur data undangan. Silakan hubungi penyelenggara acara.
        </p>
      </div>
    );
  }

  if (!ready) return <GuestSkeleton />;

  return <GuestRenderer canvas={validated} projectId={projectId} greetingName={to} />;
}