'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MailOpen } from 'lucide-react';
import { OrnamentArt, type OrnamentKey } from '@/components/builder/ornaments';

interface CoverModalProps {
  caption: string;
  bride: string;
  groom: string;
  date: string;
  bgImage?: string;
  greetingName?: string;
  primary: string;
  secondary: string;
  background: string;
  text: string;
  /** Skala huruf nama (dipakai template agar nama terlihat besar & mewah). */
  namesScale?: string;
  /** Ornamen SVG dekoratif (kunci di ornaments.tsx). */
  ornament?: string;
}

/**
 * Layar pembuka fullscreen "Buka Undangan" — ciri khas webvitation.com:
 * cover foto penuh + nama pasangan + sapaan "Kepada: [tamu]" + tombol.
 * Dismiss (klik tombol) memunculkan event 'invite-opened' (memulai musik).
 */
export default function CoverModal({
  caption,
  bride,
  groom,
  date,
  bgImage,
  greetingName,
  primary,
  secondary,
  background,
  text,
  namesScale = 'text-4xl',
  ornament
}: CoverModalProps) {
  const [open, setOpen] = useState(true);

  function openInvitation() {
    setOpen(false);
    window.dispatchEvent(new CustomEvent('invite-opened'));
    window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-50 overflow-hidden"
          style={{ background, color: text }}
        >
          {bgImage && (
            <div className="absolute inset-0">
              <Image src={bgImage} alt="" fill priority sizes="100vw" className="object-cover" />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${background} 4%, color-mix(in srgb, ${primary} 55%, transparent) 45%, color-mix(in srgb, ${primary} 88%, #000 12%) 100%)`
                }}
              />
            </div>
          )}
          {!bgImage && (
            <div
              className="absolute inset-0"
              style={{ background: `linear-gradient(165deg, ${primary} 0%, color-mix(in srgb, ${primary} 60%, ${secondary}) 55%, ${background} 130%)` }}
            />
          )}

          <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-8 py-12 text-center text-white">
            <div className="mt-2 flex flex-col items-center">
              {ornament && (
                <OrnamentArt ornament={ornament as OrnamentKey} width={180} className="mb-3 text-white opacity-60" />
              )}
              <p className="text-xs uppercase tracking-[0.35em] opacity-90">{caption}</p>
              <h1
                className={`font-script mt-4 leading-tight ${namesScale}`}
                style={{ fontFamily: 'Great Vibes, cursive' }}
              >
                {bride} &amp; {groom}
              </h1>
            </div>

            <div className="flex w-full flex-col items-center">
              <div className="mb-5 flex w-full flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">Kepada:</span>
                <span className="text-lg font-semibold">{greetingName || 'Bapak/Ibu/Saudara/i'}</span>
              </div>
              <div className="mb-6 h-px w-3/4 bg-current opacity-40" />
              <div className="mb-8 text-sm uppercase tracking-[0.25em] opacity-90">{date}</div>
              <button
                onClick={openInvitation}
                className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)] transition-transform hover:scale-[1.04] active:scale-95"
                style={{ background, color: primary }}
              >
                <MailOpen className="h-4 w-4" /> Buka Undangan
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}