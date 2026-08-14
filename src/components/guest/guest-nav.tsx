'use client';

import { useEffect, useState } from 'react';
import { LayoutPanelTop, HeartHandshake, CalendarHeart, Images, Mail } from 'lucide-react';

type NavItem = { type: string; icon: React.ElementType; label: string };

const NAV_ITEMS: NavItem[] = [
  { type: 'Hero', icon: LayoutPanelTop, label: 'Awal' },
  { type: 'Couple', icon: HeartHandshake, label: 'Mempelai' },
  { type: 'EventDetail', icon: CalendarHeart, label: 'Acara' },
  { type: 'Gallery', icon: Images, label: 'Galeri' },
  { type: 'RSVP', icon: Mail, label: 'RSVP' }
];

/**
 * Navigasi bawah (bottom nav) yang menempel di layar tamu. Setiap item
 * menggulir halus ke blok bersangkutan (ditemukan lewat data-block-type).
 */
export default function GuestNav() {
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      let current = NAV_ITEMS[0].type;
      for (const item of NAV_ITEMS) {
        const el = findBlock(item.type);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.5) current = item.type;
        }
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function findBlock(type: string): HTMLElement | null {
    return document.querySelector(`[data-block-type="${type}"]`);
  }

  function go(type: string) {
    const el = findBlock(type);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav className="print-hidden fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-current/12 bg-[var(--color-background)]/95 px-2 py-1.5 shadow-lg shadow-black/10 backdrop-blur">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.type;
          return (
            <button
              key={item.type}
              onClick={() => go(item.type)}
              aria-label={item.label}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[9px] transition-all ${
                isActive ? 'text-white' : 'opacity-60 hover:opacity-100'
              }`}
              style={isActive ? { backgroundColor: 'var(--color-primary)' } : undefined}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}