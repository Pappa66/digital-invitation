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
  MailOpen
} from 'lucide-react';
import type { Block } from '@/lib/types';

type NavDef = { icon: React.ElementType; label: string };

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

/** Ambil nav items sesuai urutan blok di kanvas, tanpa duplikat jenis. */
export function buildNavItems(blocks: Block[]): { type: string; icon: React.ElementType; label: string }[] {
  const seen = new Set<string>();
  const items: { type: string; icon: React.ElementType; label: string }[] = [];
  for (const block of blocks) {
    const def = NAV_DEFS[block.type];
    if (def && !seen.has(block.type)) {
      seen.add(block.type);
      items.push({ type: block.type, icon: def.icon, label: def.label });
    }
  }
  return items;
}

const spring: Transition = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

/**
 * Navigasi bawah (bottom nav) yang menempel di layar tamu. Item dibangun
 * dinamis dari urutan blok yang benar di kanvas — item mengikuti susunan
 * section (bukan daftar hardcoded), dan klik/scrool mengarah ke blok yang
 * benar walau blok disusun ulang, dihapus, atau ditambah.
 */
export default function GuestNav({ blocks = [] }: { blocks?: Block[] }) {
  const items = useMemo(() => buildNavItems(blocks), [blocks]);
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

  return (
    <nav className="print-hidden sticky bottom-0 z-50 flex justify-center px-4 pb-3 pt-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
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
              className={`relative flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition-colors ${
                isActive ? 'text-white' : 'opacity-55 hover:opacity-100'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  transition={spring}
                />
              )}
              <Icon className="relative z-10 h-4 w-4" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}