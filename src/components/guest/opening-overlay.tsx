'use client';

import { useEffect, useState } from 'react';
import { MailOpen } from 'lucide-react';

interface OpeningOverlayProps {
  /** Judul undangan (nama biasanya). */
  title?: string;
}

/**
 * Layar pembuka "Buka Undangan". Berguna ganda:
 * 1. Memberi kesan pembukaan yang anggun (standar undangan digital).
 * 2. Ketukan tombol = interaksi pengguna pertama, sehingga autoplay musik
 *    bersuara diizinkan browser — musik langsung berbunyi.
 * Mengunci scroll selama overlay tampil; melepaskannya setelah dibuka.
 */
export default function OpeningOverlay({ title }: OpeningOverlayProps) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (opened) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [opened]);

  if (opened) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[linear-gradient(180deg,#2b2620_0%,#3d3a74_100%)] px-8 text-white">
      <div className="flex flex-col items-center text-center" role="group" aria-label="Pembukaan undangan">
        <MailOpen className="mb-6 h-12 w-12 text-[#c9a45c]" />
        <p className="text-xs uppercase tracking-[0.4em] text-white/60">Undangan Pernikahan</p>
        {title && <h1 className="mt-4 font-script text-4xl leading-tight text-white sm:text-5xl">{title}</h1>}
        <p className="mt-4 text-sm text-white/50">Mohon dibuka dengan penuh kebahagiaan</p>
        <button
          onClick={() => {
            setOpened(true);
            window.dispatchEvent(new CustomEvent('invite-opened'));
          }}
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#c9a45c] bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-10 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#b98a3e]/30 transition-transform hover:scale-[1.03] active:scale-95"
        >
          <MailOpen className="h-4 w-4" />
          Buka Undangan
        </button>
        <p className="mt-5 text-[11px] text-white/35">Musik akan dimainkan setelah dibuka</p>
      </div>
    </div>
  );
}