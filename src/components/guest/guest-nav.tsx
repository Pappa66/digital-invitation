'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import {
  LayoutPanelTop,
  HeartHandshake,
  CalendarHeart,
  Images,
  Mail,
  Timer,
  BookOpen,
  MapPin,
  Gift,
  Heart,
  Quote,
  Music,
  Camera,
  MailOpen,
  MoreHorizontal
} from 'lucide-react';
import type { Block } from '@/lib/types';

type NavDef = { icon: React.ElementType; label: string };
type NavItem = { type: string; icon: React.ElementType; label: string };

/** Jenis blok yang layak masuk bottom nav (section bermakna, bukan dekorasi). */
const NAV_DEFS: Record<string, NavDef> = {
  Hero: { icon: LayoutPanelTop, label: 'Awal' },
  Couple: { icon: HeartHandshake, label: 'Mempelai' },
  Countdown: { icon: Timer, label: 'Hitung Mundur' },
  EventDetail: { icon: CalendarHeart, label: 'Acara' },
  Story: { icon: BookOpen, label: 'Kisah' },
  Gallery: { icon: Images, label: 'Galeri' },
  RSVP: { icon: Mail, label: 'RSVP' },
  Envelope: { icon: MailOpen, label: 'Amplop' },
  Maps: { icon: MapPin, label: 'Lokasi' },
  GiftList: { icon: Gift, label: 'Kado' },
  Thanks: { icon: Heart, label: 'Ucapan' },
  Quote: { icon: Quote, label: 'Kutipan' },
  Photo: { icon: Camera, label: 'Foto' },
  Music: { icon: Music, label: 'Musik' }
};

/**
 * Prioritas pemilihan item saat bilah harus dipangkas (semakin kecil semakin
 * penting). Mempelai/Acara/Galeri/RSVP/Amplop/Lokasi diprioritaskan tetap
 * tampil; dekorasi/alur (Music, Quote, Photo, Countdown, Story, Hero) dibuang
 * ke menu "Lebih" lebih dulu bila jumlah blok section > kapasitas.
 */
const NAV_IMPORTANCE: Record<string, number> = {
  Couple: 1,
  EventDetail: 2,
  Gallery: 3,
  RSVP: 4,
  Envelope: 5,
  Maps: 6,
  GiftList: 7,
  Thanks: 8,
  Story: 9,
  Countdown: 10,
  Photo: 11,
  Music: 12,
  Quote: 13,
  Hero: 14
};

/** Maksimal tombol section di bilah (5) + 1 slot "Lebih" = 6 pill. */
export const NAV_MAX_SLOTS = 6;
export const NAV_VISIBLE_SLOTS = 5;

/** Ambil nav items sesuai urutan blok di kanvas, tanpa duplikat jenis. */
export function buildNavItems(blocks: Block[]): NavItem[] {
  const seen = new Set<string>();
  const items: NavItem[] = [];
  for (const block of blocks) {
    const def = NAV_DEFS[block.type];
    if (def && !seen.has(block.type)) {
      seen.add(block.type);
      items.push({ type: block.type, icon: def.icon, label: def.label });
    }
  }
  return items;
}

export interface NavSlots {
  /** Item yang tampil langsung di bilah (≤ 5). */
  visible: NavItem[];
  /** Item yang tersembunyi di menu "Lebih" (> kapasitas), urutan kanvas. */
  more: NavItem[];
}

/**
 * Mengisi bilah nav maksimal 6 pill: 5 item terpenting (prioritas, urutan
 * kanvas dipertahankan) + sisanya dipindah ke menu "Lebih". Bila jumlah
 * item ≤ 6 semuanya tampil tanpa menu "Lebih".
 */
export function buildNavSlots(blocks: Block[]): NavSlots {
  const full = buildNavItems(blocks);
  if (full.length <= NAV_MAX_SLOTS) return { visible: full, more: [] };

  const ranked = [...full].sort(
    (a, b) => (NAV_IMPORTANCE[a.type] ?? 99) - (NAV_IMPORTANCE[b.type] ?? 99)
  );
  const kept = new Set(ranked.slice(0, NAV_VISIBLE_SLOTS).map((i) => i.type));
  return {
    visible: full.filter((i) => kept.has(i.type)),
    more: full.filter((i) => !kept.has(i.type))
  };
}

const spring: Transition = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

/**
 * Navigasi bawah (bottom nav) yang menempel di layar tamu. Item dibangun
 * dinamis dari urutan blok yang benar di kanvas — item mengikuti susunan
 * section (bukan daftar hardcoded), klik/scrool mengarah ke blok yang benar
 * walau blok disusun ulang, dihapus, atau ditambah. Saat lebih dari 6 jenis
 * section ada, bilah dipangkas ke 5 item terpenting + menu "Lebih".
 */
export default function GuestNav({ blocks = [] }: { blocks?: Block[] }) {
  const { visible: items, more } = useMemo(() => buildNavSlots(blocks), [blocks]);
  const [active, setActive] = useState<string>(items[0]?.type ?? '');
  const activeRef = useRef<string>(items[0]?.type ?? '');
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (items.length === 0) return;
    const findBlock = (type: string): HTMLElement | null =>
      document.querySelector(`[data-block-type="${type}"]`);

    const updateActive = (next: string) => {
      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };

    // Cari section paling bawah yang melintasi garis tengah layar — iterasi
    // sesuai urutan kanvas agar hasil titip pada susunan blok yang asli.
    const compute = () => {
      let current = items[items.length - 1]?.type ?? activeRef.current;
      const mid = window.innerHeight * 0.5;
      for (const item of items) {
        const el = findBlock(item.type);
        if (el && el.getBoundingClientRect().top <= mid) current = item.type;
      }
      updateActive(current);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        let current = activeRef.current;
        let best = -Infinity;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const top = entry.boundingClientRect.top;
          if (top <= window.innerHeight * 0.5 && top > best) {
            best = top;
            current = (entry.target as HTMLElement).dataset.blockType ?? current;
          }
        }
        updateActive(current);
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    const targets = items.map((item) => findBlock(item.type)).filter(Boolean) as HTMLElement[];
    targets.forEach((el) => observer.observe(el));
    compute();

    const onScroll = () => compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    const onResize = () => compute();
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [items]);

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  if (items.length === 0 && more.length === 0) return null;

  const moreActive = more.some((m) => m.type === active);

  function go(type: string) {
    const el = document.querySelector(`[data-block-type="${type}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const pillClass = (isActive: boolean) =>
    `relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
      isActive ? 'text-white' : 'opacity-55 hover:opacity-100'
    }`;

  return (
    <nav className="print-hidden sticky bottom-0 z-50 flex justify-center px-4 pt-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="relative flex items-center gap-1 rounded-full border border-current/12 bg-[var(--color-background)]/95 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.type;
          return (
            <button
              key={item.type}
              onClick={() => go(item.type)}
              aria-label={item.label}
              title={item.label}
              aria-current={isActive ? 'true' : undefined}
              className={pillClass(isActive)}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  transition={spring}
                />
              )}
              <Icon className="relative z-10 h-5 w-5" />
            </button>
          );
        })}

        {more.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-label="Lainnya"
              title="Lainnya"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              className={pillClass(moreActive || moreOpen)}
            >
              {(moreActive || moreOpen) && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  transition={spring}
                />
              )}
              <MoreHorizontal className="relative z-10 h-5 w-5" />
            </button>

            {moreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMoreOpen(false)}
                  aria-hidden="true"
                />
                <div
                  role="menu"
                  aria-label="Navigasi lainnya"
                  className="absolute bottom-full left-1/2 z-50 mb-2 w-44 -translate-x-1/2 rounded-2xl border border-current/12 bg-[var(--color-background)]/95 p-2 shadow-card backdrop-blur"
                >
                  {more.map((item) => {
                    const Icon = item.icon;
                    const isActive = active === item.type;
                    return (
                      <button
                        key={item.type}
                        role="menuitem"
                        onClick={() => {
                          go(item.type);
                          setMoreOpen(false);
                        }}
                        aria-current={isActive ? 'true' : undefined}
                        className={`flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-current/10 ${
                          isActive ? 'opacity-100' : 'opacity-75'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}