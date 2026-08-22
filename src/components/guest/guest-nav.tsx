'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { HeartHandshake, CalendarHeart, Images, BookOpen, MapPin, Mail } from 'lucide-react';
import type { Block } from '@/lib/types';

type NavDef = { icon: React.ElementType; label: string };
type NavItem = { type: string; icon: React.ElementType; label: string };

/**
 * Hanya blok PENTING yang layak masuk bottom nav. Jenis lain (Musik, Quote,
 * Photo, Countdown, Hero, Amplop, Kado, Ucapan, dll.) tidak ditampilkan —
 * pengguna tidak menyukai menu "Lebih" tersembunyi.
 */
const NAV_DEFS: Record<string, NavDef> = {
  Couple: { icon: HeartHandshake, label: 'Mempelai' },
  Gallery: { icon: Images, label: 'Galeri' },
  Story: { icon: BookOpen, label: 'Kisah' },
  EventDetail: { icon: CalendarHeart, label: 'Acara' },
  RSVP: { icon: Mail, label: 'RSVP' },
  Maps: { icon: MapPin, label: 'Lokasi' }
};

/** Maksimal pill di bilah. Tanpa menu "Lebih". */
export const NAV_MAX_SLOTS = 6;
export const NAV_VISIBLE_SLOTS = 6;

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
  /** Item yang tampil langsung di bilah (≤ 6), urutan kanvas. */
  visible: NavItem[];
  /** Selalu kosong — tidak ada menu "Lebih". */
  more: NavItem[];
}

/**
 * Membangun slot bilah nav: hanya blok penting yang ADA di kanvas, urutan
 * mengikuti kanvas, dipangkas maksimal 6. Bila blok penting tidak ada, nav
 * berisi lebih sedikit item (4-5 dst). Tidak pernah menghasilkan menu "Lebih".
 */
export function buildNavSlots(blocks: Block[]): NavSlots {
  return { visible: buildNavItems(blocks).slice(0, NAV_MAX_SLOTS), more: [] };
}

const spring: Transition = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

/**
 * Navigasi bawah (bottom nav) yang menempel di layar tamu. Item dibangun
 * dinamis dari urutan blok yang benar di kanvas — item mengikuti susunan
 * section (bukan daftar hardcoded), klik/scrool mengarah ke blok yang benar
 * walau blok disusun ulang, dihapus, atau ditambah. Maksimal 6 pill tanpa
 * menu "Lebih".
 */
export default function GuestNav({ blocks = [] }: { blocks?: Block[] }) {
  const { visible: items } = useMemo(() => buildNavSlots(blocks), [blocks]);
  const [active, setActive] = useState<string>(items[0]?.type ?? '');
  const activeRef = useRef<string>(items[0]?.type ?? '');

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

  if (items.length === 0) return null;

  function go(type: string) {
    const el = document.querySelector(`[data-block-type="${type}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const pillClass = (isActive: boolean) =>
    `relative flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
      isActive ? 'text-white' : 'opacity-55 hover:opacity-100'
    }`;

  return (
    <nav className="print-hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pt-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
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
              {/* @ts-ignore */}
              <Icon className="relative z-10 h-5 w-5" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}