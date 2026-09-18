'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, type Transition } from 'framer-motion';
import { HeartHandshake, CalendarHeart, Images, BookOpen, MapPin, Mail } from 'lucide-react';
import type { Block } from '@/lib/types';

type NavDef = { icon: React.ElementType; label: string };
export type NavItem = { blockId: string; type: string; icon: React.ElementType; label: string };

const NAV_DEFS: Record<string, NavDef> = {
  Couple: { icon: HeartHandshake, label: 'Mempelai' },
  Gallery: { icon: Images, label: 'Galeri' },
  Story: { icon: BookOpen, label: 'Kisah' },
  EventDetail: { icon: CalendarHeart, label: 'Acara' },
  RSVP: { icon: Mail, label: 'RSVP' },
  Maps: { icon: MapPin, label: 'Lokasi' }
};

/** Maksimal pill di bilah. */
export const NAV_MAX_SLOTS = 6;
export const NAV_VISIBLE_SLOTS = 6;

function navLabel(block: Block): string {
  const custom =
    (typeof block.props.nav_label === 'string' && block.props.nav_label.trim()) ||
    (typeof block.props.title === 'string' && block.props.title.trim()) ||
    (typeof block.props.event_name === 'string' && block.props.event_name.trim());
  if (custom) return custom.length > 12 ? `${custom.slice(0, 11)}…` : custom;
  return NAV_DEFS[block.type]?.label ?? block.type;
}

/**
 * Satu item nav per blok (bukan per tipe) — Akad & Resepsi keduanya muncul
 * dengan label berbeda. Maksimal 6, urutan mengikuti kanvas.
 */
export function buildNavItems(blocks: Block[]): NavItem[] {
  const items: NavItem[] = [];
  for (const block of blocks) {
    const def = NAV_DEFS[block.type];
    if (!def) continue;
    items.push({
      blockId: block.id,
      type: block.type,
      icon: def.icon,
      label: navLabel(block)
    });
  }
  return items.slice(0, NAV_MAX_SLOTS);
}

export interface NavSlots {
  visible: NavItem[];
  more: NavItem[];
}

export function buildNavSlots(blocks: Block[]): NavSlots {
  return { visible: buildNavItems(blocks), more: [] };
}

const spring: Transition = { type: 'spring', stiffness: 500, damping: 34, mass: 0.8 };

export default function GuestNav({ blocks = [] }: { blocks?: Block[] }) {
  const { visible: items } = useMemo(() => buildNavSlots(blocks), [blocks]);
  const [active, setActive] = useState<string>(items[0]?.blockId ?? '');
  const activeRef = useRef<string>(items[0]?.blockId ?? '');

  useEffect(() => {
    if (items.length === 0) return;

    const findBlock = (blockId: string): HTMLElement | null =>
      document.querySelector(`[data-block-id="${blockId}"]`);

    const updateActive = (next: string) => {
      if (activeRef.current !== next) {
        activeRef.current = next;
        setActive(next);
      }
    };

    const compute = () => {
      let current = items[items.length - 1]?.blockId ?? activeRef.current;
      const mid = window.innerHeight * 0.5;
      for (const item of items) {
        const el = findBlock(item.blockId);
        if (el && el.getBoundingClientRect().top <= mid) current = item.blockId;
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
            current = (entry.target as HTMLElement).dataset.blockId ?? current;
          }
        }
        updateActive(current);
      },
      { rootMargin: '0px 0px -50% 0px', threshold: 0 }
    );

    const targets = items.map((item) => findBlock(item.blockId)).filter(Boolean) as HTMLElement[];
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

  function go(blockId: string) {
    const el = document.querySelector(`[data-block-id="${blockId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const pillClass = (isActive: boolean) =>
    `relative flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-full px-2.5 py-1.5 transition-colors ${
      isActive ? 'text-white' : 'opacity-55 hover:opacity-100'
    }`;

  return (
    <nav className="print-hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center px-2 pt-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="relative flex max-w-full items-center gap-0.5 overflow-x-auto rounded-full border border-current/12 bg-[var(--color-background)]/95 px-1.5 py-1.5 shadow-lg shadow-black/10 backdrop-blur [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.blockId;
          return (
            <button
              key={item.blockId}
              onClick={() => go(item.blockId)}
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
              {/* @ts-expect-error lucide dynamic */}
              <Icon className="relative z-10 h-5 w-5 shrink-0" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
