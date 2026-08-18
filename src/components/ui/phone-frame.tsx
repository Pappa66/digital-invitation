'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  /** Warna aksen untuk tombol samping / kamera. */
  accent?: string;
  className?: string;
}

/**
 * Lebar kanvas desain GuestRenderer (px) — lihat GuestRenderer.tsx (`max-w-[430px]`).
 * Konten di-scale secara proporsional agar SELALU muat selebar layar.
 */
const CANVAS_W = 430;

/**
 * Bingkai ponsel realistis untuk demo template di halaman publik — seolah-olah
 * undangan dibuka di handphone sungguhan.
 *
 * Desain:
 * - Konten (GuestRenderer, 430px) di-scale ke lebar layar dalam ponsel (≈338px)
 *   sehingga tidak pernah ada overflow horizontal / konten terpotong asimetris.
 * - `transform: scale()` sekaligus menjadi *containing block* bagi elemen
 *   `position: fixed` di dalam undangan (cover "Buka Undangan", tombol musik &
 *   bagikan) — semuanya terkunci di dalam layar ponsel, tidak pernah meluber
 *   menutupi halaman.
 * - Tinggi layar menyesuaikan tinggi konten (melalui "sizer" terukur) agar
 *   scroll internal berhenti tepat di akhir undangan, tanpa ruang kosong,
 *   dan tetap di-batasi `max-h` berbasis viewport.
 */
export default function PhoneFrame({ children, accent = '#8a6d2f', className }: PhoneFrameProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const screen = screenRef.current;
    const content = contentRef.current;
    if (!screen || !content) return;
    let cancelled = false;

    const apply = () => {
      if (cancelled) return;
      // Faktor skala agar 430px pas dengan lebar layar dalam ponsel (max 1).
      const s = Math.min(1, screen.clientWidth / CANVAS_W);
      // scrollHeight = tinggi natural (belum di-scale) → tinggi visual = h * s.
      const h = content.scrollHeight;
      setScale((prev) => (prev === s ? prev : s));
      setSize((prev) => {
        const next = { w: Math.round(CANVAS_W * s), h: Math.round(h * s) };
        const stable = prev && Math.abs(prev.w - next.w) < 1 && Math.abs(prev.h - next.h) < 1;
        return stable ? prev : next;
      });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(screen);
    ro.observe(content);
    // Tinggi berubah saat font/gambar selesai dimuat → ukur ulang sekali lagi.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => !cancelled && apply()).catch(() => {});
    }
    // Gambar lazy dapat mengubah tinggi setelah RO — jaga dengan frame rAF.
    const raf = window.setTimeout(() => !cancelled && apply(), 600);
    return () => {
      cancelled = true;
      ro.disconnect();
      window.clearTimeout(raf);
    };
  }, []);

  const ready = scale > 0 && size !== null;

  return (
    <div className={`relative mx-auto w-[min(100%,360px)] select-none ${className ?? ''}`} aria-hidden>
      {/* Tombol samping kiri */}
      <span className="absolute -left-[2px] top-28 h-10 w-[3px] rounded-l-md bg-[#3a332b]/70" />
      <span className="absolute -left-[2px] top-44 h-16 w-[3px] rounded-l-md bg-[#3a332b]/70" />
      {/* Tombol samping kanan */}
      <span className="absolute -right-[2px] top-32 h-20 w-[3px] rounded-r-md bg-[#3a332b]/70" />

      {/* Body ponsel */}
      <div className="rounded-[2.6rem] border border-[#2b2620]/90 bg-gradient-to-b from-[#2a2521] via-[#191612] to-[#14110e] p-[11px] shadow-[0_30px_60px_-20px_rgba(15,12,8,0.55),0_2px_14px_rgba(15,12,8,0.28)] ring-1 ring-[#3a332b]/60">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-white shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)]">
          {/* Notch / dynamic island */}
          <span
            className="absolute left-1/2 top-[9px] z-50 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#0c0a08]"
            style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.06)' }}
          >
            <span
              className="absolute right-[7px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ring-1 ring-white/10"
              style={{ backgroundColor: accent }}
            />
          </span>

          {/* Layar undangan — scroll internal yang halus, tinggi dibatasi viewport.
              Scrollbar disembunyikan (mengikuti gaya layar ponsel) sehingga konten
              memakai selebar layar penuh. `transform-gpu` (translateZ(0)) ikut
              mengunci seluruh turunan agar tak lari keluar layar ponsel. */}
          <div
            ref={screenRef}
            className="relative z-0 max-h-[min(calc(100dvh-10rem),820px)] overflow-x-clip overflow-y-auto overscroll-contain bg-[#f4f0e9] transform-gpu [-webkit-overflow-scrolling:touch] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {/* "Sizer" menentukan ukuran layout = ukuran visual konten setelah di-scale,
                sehingga scroll internal berhenti tepat di ujung undangan. */}
            <div ref={sizerRef} className="relative" style={size ? { width: size.w, height: size.h } : undefined}>
              <div
                ref={contentRef}
                className="w-[430px]"
                style={{ transform: `scale(${ready ? scale : 0.6})`, transformOrigin: 'top left' }}
              >
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bayangan bawah */}
      <div
        className="pointer-events-none absolute inset-x-8 bottom-3 h-6 rounded-[100%] bg-[#2b2620]/40 blur-xl"
        style={{ filter: 'blur(14px)' }}
      />
    </div>
  );
}