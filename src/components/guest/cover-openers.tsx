'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface OpenerProps {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  /** Dipanggil setelah animasi pembuka selesai (untuk menyingkap undangan). */
  onDone: () => void;
}

const DONE_MS = 1700;

/** Pembuka: dua tutup buku mengelepai terbuka (rotateY) menyingkap undangan. */
export function BookOpener({ primary, secondary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  const cover = `color-mix(in srgb, ${secondary} 55%, ${background})`;
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ background, perspective: 1600 }}>
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 50%, color-mix(in srgb, ${primary} 18%, transparent), transparent 70%)` }} />
      <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-black/30" />
      {(['left', 'right'] as const).map((side, i) => (
        <motion.div
          key={side}
          className="absolute top-0 h-full w-1/2"
          style={{
            [side]: 0,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
            background: `linear-gradient(${side === 'left' ? 'to right' : 'to left'}, ${cover}, color-mix(in srgb, ${cover} 70%))`,
            borderRight: side === 'left' ? `2px solid color-mix(in srgb, ${primary} 40%, transparent)` : undefined,
            borderLeft: side === 'right' ? `2px solid color-mix(in srgb, ${primary} 40%, transparent)` : undefined,
            boxShadow: `inset 0 0 120px color-mix(in srgb, ${background} 40%, transparent)`
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: side === 'left' ? -158 : 158 }}
          transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
        >
          <div className="flex h-full items-center justify-center" style={{ color: text, [side === 'left' ? 'paddingRight' : 'paddingLeft']: '18%' }}>
            <span className="font-serif text-5xl opacity-50" style={{ fontFamily: 'Cormorant Garamond, serif' }}>❧</span>
          </div>
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <span className="text-xs uppercase tracking-[0.4em]" style={{ color: text, opacity: 0.85 }}>The Invitation</span>
      </motion.div>
    </div>
  );
}

/** Pembuka: dua gulungan film (atas & bawah) berpisah + kilat "develop". */
export function FilmRollOpener({ primary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  const sprocket = `repeating-linear-gradient(90deg, transparent 0 14px, rgba(0,0,0,0.55) 14px 22px)`;
  const filmBg = `linear-gradient(180deg, #1a1714, #0d0b09)`;
  return (
    <div className="fixed inset-0 z-[60] overflow-hidden" style={{ background, perspective: 1000 }}>
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2"
        style={{ background: filmBg, borderBottom: `10px solid ${primary}` }}
        initial={{ y: 0 }}
        animate={{ y: '-100%' }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}
      >
        <div className="absolute inset-x-0 bottom-2 h-3" style={{ background: sprocket }} />
      </motion.div>
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2"
        style={{ background: filmBg, borderTop: `10px solid ${primary}` }}
        initial={{ y: 0 }}
        animate={{ y: '100%' }}
        transition={{ duration: 1.2, ease: [0.7, 0, 0.3, 1], delay: 0.2 }}
      >
        <div className="absolute inset-x-0 top-2 h-3" style={{ background: sprocket }} />
      </motion.div>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, backgroundColor: '#ffffff' }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 0.5, delay: 1.0 }}
        style={{ mixBlendMode: 'screen' }}
      />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="text-xs uppercase tracking-[0.4em]" style={{ color: text, opacity: 0.85 }}>Roll · Play</span>
      </motion.div>
    </div>
  );
}

/** Pembuka: TV jadul (CRT) menyala lalu "dimatikan" (collapse vertikal). */
export function OldTvOpener({ primary, secondary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, #211c16, #0a0807)' }}>
      <motion.div
        className="relative"
        style={{ width: 'min(78vw, 460px)', aspectRatio: '4 / 3' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: [0.6, 1, 1, 0.05], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.6, times: [0, 0.25, 0.7, 1], ease: 'easeInOut' }}
      >
        {/* Bezel TV */}
        <div className="absolute inset-0 rounded-[8%] p-[6%]" style={{ background: `linear-gradient(145deg, ${secondary}, #2a211a)`, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6)' }}>
          {/* Layar */}
          <div className="relative h-full w-full overflow-hidden rounded-[4%]" style={{ background: '#06120c' }}>
            <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 4px)` }} />
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 0.2, 0.7, 0.1] }}
              transition={{ duration: 1.2, repeat: 1 }}
              style={{ background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${primary} 40%, transparent), transparent 60%)` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>On Air</span>
          </div>
          {/* Knob */}
          <div className="absolute -right-[3%] top-1/2 h-6 w-6 -translate-y-1/2 rounded-full" style={{ background: primary }} />
        </div>
      </motion.div>
    </div>
  );
}

/** Pembuka: koran lama terbuka (unroll) lalu lipat pergi. */
export function NewspaperOpener({ primary, secondary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" style={{ background: `color-mix(in srgb, ${background} 80%, #000)` }}>
      <motion.div
        className="relative w-[88vw] max-w-[520px] overflow-hidden rounded-sm px-5 py-4 text-left"
        style={{ background: '#efe7d6', color: '#2c2419', boxShadow: '0 30px 60px rgba(0,0,0,0.4)' }}
        initial={{ scaleY: 0.02, opacity: 0 }}
        animate={{ scaleY: [0.02, 1, 1, 0.02], opacity: [0, 1, 1, 0], y: [0, 0, 0, -60] }}
        transition={{ duration: 1.7, times: [0, 0.3, 0.72, 1], ease: 'easeInOut' }}
      >
        <div className="border-b-2 border-[#2c2419] pb-1 text-center">
          <h2 className="font-serif text-2xl font-bold tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif' }}>THE WEDDING TIMES</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] opacity-70">Edisi Hari Bahagia</p>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-3 text-[9px] leading-snug opacity-80">
          <p className="column-text">Dua hati bersatu dalam ikatan suci yang diberkati keluarga &amp; sahabat. Upacara berlangsung khidmat di bawah langit senja.</p>
          <p className="column-text">Resepsi mengalir dengan tawa, doa, dan kebersamaan. Tamu kehormatan menyampaikan harapan terbaik untuk mempelai.</p>
          <p className="column-text">Kisah cinta yang panjang akhirnya sampai pada babak indah. Sampaikan restu di hadapan keluarga besar.</p>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs uppercase tracking-[0.4em]" style={{ color: primary }}>Read All About It</span>
        </div>
      </motion.div>
    </div>
  );
}

/** Pembuka: mandala mekar (scale + rotate) — konsep Hindu/Buddha. */
export function MandalaOpener({ primary, secondary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" style={{ background }}>
      <motion.div
        className="absolute inset-0"
        style={{ background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${primary} 16%, transparent), transparent 65%)` }}
      />
      <motion.svg
        viewBox="0 0 200 200"
        className="relative"
        style={{ width: 'min(80vw, 420px)', color: primary }}
        initial={{ scale: 0.1, rotate: -120, opacity: 0 }}
        animate={{ scale: [0.1, 1.05, 1], rotate: [-120, 20, 0], opacity: [0, 1, 0.85] }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.2}
      >
        {[30, 55, 80, 100].map((r, i) => (
          <motion.circle key={r} cx="100" cy="100" r={r} opacity={0.7 - i * 0.12} />
        ))}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return <line key={i} x1={100 + 30 * Math.cos(a)} y1={100 + 30 * Math.sin(a)} x2={100 + 100 * Math.cos(a)} y2={100 + 100 * Math.sin(a)} opacity={0.5} />;
        })}
        <circle cx="100" cy="100" r="14" />
      </motion.svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <span className="text-xs uppercase tracking-[0.4em]" style={{ color: text, opacity: 0.85 }}>Om Shanti</span>
      </motion.div>
    </div>
  );
}

/** Pembuka: lentera menyala lalu terang menyingkap — konsep Konghucu/Cina. */
export function LanternOpener({ primary, secondary, background, text, onDone }: OpenerProps) {
  useEffect(() => {
    const t = setTimeout(onDone, DONE_MS);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden" style={{ background: '#1a0e0e' }}>
      <motion.div
        className="relative"
        style={{ width: 'min(60vw, 260px)' }}
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: [0.5, 1, 1, 0.4], opacity: [0, 1, 1, 0], y: [30, 0, 0, -20] }}
        transition={{ duration: 1.7, times: [0, 0.3, 0.7, 1], ease: 'easeInOut' }}
      >
        <div className="mx-auto h-3 w-1 -translate-y-1 rounded bg-yellow-200" />
        <motion.div
          className="rounded-[42%] border-2 px-6 py-10 text-center"
          style={{ borderColor: primary, background: `radial-gradient(circle at 50% 40%, ${primary}, #7a1f1f)`, boxShadow: `0 0 60px ${primary}` }}
        >
          <span className="font-serif text-3xl" style={{ color: '#fff3d6', fontFamily: 'Cormorant Garamond, serif' }}>囍</span>
        </motion.div>
        <div className="mx-auto h-8 w-px bg-yellow-200" />
      </motion.div>
    </div>
  );
}
