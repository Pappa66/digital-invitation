'use client';

import type { ReactNode } from 'react';

interface PhoneFrameProps {
  children: ReactNode;
  /** Warna aksen untuk tombol samping / kamera. */
  accent?: string;
  className?: string;
}

/**
 * Bingkai ponsel realistis untuk demo template di halaman publik — seolah-olah
 * undangan sedang dibuka di handphone. Layar di dalamnya menggulir sendiri.
 */
export default function PhoneFrame({ children, accent = '#8a6d2f', className }: PhoneFrameProps) {
  return (
    <div className={`relative mx-auto w-[min(100%,360px)] select-none ${className ?? ''}`} aria-hidden>
      {/* Tombol samping kiri */}
      <span className="absolute -left-[2px] top-28 h-10 w-[3px] rounded-l-md bg-[#3a332b]/70" />
      <span className="absolute -left-[2px] top-44 h-16 w-[3px] rounded-l-md bg-[#3a332b]/70" />
      {/* Tombol samping kanan */}
      <span className="absolute -right-[2px] top-32 h-20 w-[3px] rounded-r-md bg-[#3a332b]/70" />

      {/* Body ponsel */}
      <div className="rounded-[2.6rem] border border-[#2b2620]/80 bg-[#1a1713] p-[11px] shadow-[0_30px_60px_-20px_rgba(43,38,32,0.45)] ring-1 ring-[#3a332b]/60">
        <div className="relative overflow-hidden rounded-[1.9rem] bg-white">
          {/* Notch / dynamic island */}
          <span
            className="absolute left-1/2 top-[9px] z-50 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#0c0a08]"
            style={{ boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.06)' }}
          >
            <span className="absolute right-[7px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#1b2c4d]/90 ring-1 ring-white/10" />
          </span>

          {/* Layar undangan */}
          <div className="h-[min(calc(100dvh-12rem),820px)] overflow-auto overscroll-contain bg-[#f4f0e9]">
            {children}
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
