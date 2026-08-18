'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MailOpen, X } from 'lucide-react';
import { OrnamentArt, type OrnamentKey } from '@/components/builder/ornaments';
import { FloralCorner, FloatingPetals, DecorativeFrame } from './cover-florals';

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
  /** Teks sapaan di cover (misal: "Kepada Yth."). */
  coverGreeting?: string;
  /** Teks tombol "Buka Undangan". */
  coverButtonText?: string;
  /** Background image cover (terpisah dari Hero bg_image). */
  coverBgImage?: string;
}

/**
 * Layar pembuka "Buka Undangan" — ciri khas wevitation.com:
 * cover foto penuh + nama pasangan + sapaan "Kepada: [tamu]" + tombol.
 * SEGALA konten berada dalam kolom portrait (max-width 430px) yang di-center,
 * sehingga di desktop tampak seperti layar ponsel berdiri (bukan landscape).
 * Sisi kiri/kanan pada viewport lebar diberi latar gelap hangat yang elegan.
 * Dismiss (klik tombol) memunculkan event 'invite-opened' (memulai musik).
 * Scroll diblokir selama cover terbuka.
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
  namesScale = 'text-[clamp(1.875rem,6vw,2.5rem)]',
  ornament,
  coverGreeting,
  coverButtonText,
  coverBgImage
}: CoverModalProps) {
  const [open, setOpen] = useState(true);

  // Block scroll when cover is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  function openInvitation() {
    setOpen(false);
    document.body.style.overflow = '';
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
          style={{
            background: `color-mix(in srgb, ${background} 45%, #000 55%)`,
            color: text
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Sampul undangan"
        >
          {/* Latar samping (viewport lebar): charcoal hangat + cahaya emas redup
              yang memusat (radial), bukan strip diagonal yang terpeleset. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background: [
                `radial-gradient(ellipse 90% 55% at 50% 0%, color-mix(in srgb, ${primary} 24%, transparent) 0%, transparent 62%)`,
                `radial-gradient(ellipse 80% 45% at 50% 100%, color-mix(in srgb, ${primary} 14%, transparent) 0%, transparent 58%)`
              ].join(', ')
            }}
          />

          {/* Kolom ponsel — semua konten cover hidup di sini.
              Di layar ≤ ponsel (potrait) menjadi full-bleed; di layar lebih lebar
              menjadi bingkai ponsel portrait yang di-center. */}
          <div className="relative mx-auto h-full w-full max-w-[430px] overflow-hidden sm:my-4 sm:h-[calc(100%-2rem)] sm:rounded-[2.5rem] sm:shadow-dialog sm:ring-1 sm:ring-white/10">
            {/* Tombol lewati — cara cepat menutup sampul (aksi sama dengan tombol utama). */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              onClick={openInvitation}
              aria-label="Lewati sampul dan buka undangan"
              className="absolute right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-white shadow-soft backdrop-blur transition-colors hover:bg-black/40"
            >
              <X className="h-5 w-5" aria-hidden />
            </motion.button>

            {(coverBgImage || bgImage) && (
              <div className="absolute inset-0">
                <Image src={coverBgImage || bgImage || ''} alt="" fill priority sizes="(max-width: 640px) 100vw, 430px" className="object-cover" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, ${background} 4%, color-mix(in srgb, ${primary} 55%, transparent) 45%, color-mix(in srgb, ${primary} 88%, #000 12%) 100%)`
                  }}
                />
              </div>
            )}
            {!coverBgImage && !bgImage && (
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(165deg, ${primary} 0%, color-mix(in srgb, ${primary} 60%, ${secondary}) 55%, ${background} 130%)` }}
              />
            )}

            {/* Floral corners — 4 sudut */}
            <FloralCorner position="top-left" color={primary} />
            <FloralCorner position="top-right" color={primary} />
            <FloralCorner position="bottom-left" color={primary} />
            <FloralCorner position="bottom-right" color={primary} />

            {/* Floating petals animation */}
            <FloatingPetals color={primary} />

            {/* Decorative frame overlay */}
            <DecorativeFrame color={primary} />

            <div className="relative z-40 flex h-full w-full flex-col items-center justify-between px-6 py-12 text-center text-white" style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}>
              <motion.div
                className="mt-2 flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
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
              </motion.div>

              <motion.div
                className="flex w-full flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="mb-5 flex w-full flex-col items-center gap-1">
                  <span className="text-[10px] uppercase tracking-[0.3em] opacity-80">{coverGreeting || 'Kepada:'}</span>
                  <span className="text-base font-semibold">{greetingName || 'Bapak/Ibu/Saudara/i'}</span>
                </div>
                <div className="mb-6 h-px w-3/4 bg-current opacity-40" />
                <div className="mb-8 text-xs sm:text-sm uppercase tracking-[0.25em] opacity-90">{date}</div>
                <button
                  onClick={openInvitation}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-current/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] shadow-soft transition-transform hover:scale-[1.04] active:scale-95"
                  style={{ background, color: primary }}
                >
                  <MailOpen className="h-4 w-4" aria-hidden /> {coverButtonText || 'Buka Undangan'}
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
