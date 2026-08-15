'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { LayoutPanelTop, HeartHandshake, CalendarHeart, Images, Mail } from 'lucide-react';

type NavItem = { type: string; icon: React.ElementType; label: string };

const NAV_ITEMS: NavItem[] = [
  { type: 'Hero', icon: LayoutPanelTop, label: 'Awal' },
  { type: 'Couple', icon: HeartHandshake, label: 'Mempelai' },
  { type: 'EventDetail', icon: CalendarHeart, label: 'Acara' },
  { type: 'Gallery', icon: Images, label: 'Galeri' },
  { type: 'RSVP', icon: Mail, label: 'RSVP' }
];

const spring: Transition = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

/**
 * Navigasi bawah (bottom nav) yang menempel di layar tamu. Setiap item
 * menggulir halus ke blok bersangkutan (ditemukan lewat data-block-type).
 *
 * Memakai IntersectionObserver sehingga tetap akurat walau konten menggulir
 * di dalam container dalam (mis. halaman detail template), bukan di window.
 */
export default function GuestNav() {
  const [active, setActive] = useState<string>(NAV_ITEMS[0].type);
  const activeRef = useRef(NAV_ITEMS[0].type);

  useEffect(() => {
    const findBlock = (type: string): HTMLElement | null =>
      document.querySelector(`[data-block-type="${type}"]`);

    const updateActive = (next: string) => {
      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };

    // Cari section yang paling atas melampaui garis tengah layar.
    const compute = () => {
      let current = NAV_ITEMS[0].type;
      const mid = window.innerHeight * 0.5;
      for (const item of NAV_ITEMS) {
        const el = findBlock(item.type);
        if (el && el.getBoundingClientRect().top <= mid) current = item.type;
      }
      updateActive(current);
    };

    // IntersectionObserver untuk scroll di window maupun di container dalam.
    const observer = new IntersectionObserver(
      (entries) => {
        // Ambil section paling bawah yang terlihat melintasi garis tengah.
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

    const targets = NAV_ITEMS.map((item) => findBlock(item.type)).filter(Boolean) as HTMLElement[];
    targets.forEach((el) => observer.observe(el));
    compute();

    const onScroll = () => compute();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  function findBlock(type: string): HTMLElement | null {
    return document.querySelector(`[data-block-type="${type}"]`);
  }

  function go(type: string) {
    const el = findBlock(type);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="print-hidden sticky bottom-0 z-50 flex justify-center px-4 pb-3 pt-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="relative flex items-center gap-1 rounded-full border border-current/12 bg-[var(--color-background)]/95 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.type;
          return (
            <button
              key={item.type}
              onClick={() => go(item.type)}
              aria-label={item.label}
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