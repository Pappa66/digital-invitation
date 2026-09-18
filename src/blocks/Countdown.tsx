'use client';

import { useEffect, useState } from 'react';
import type { CountdownProps } from '@/puck/types';
import { BlockShell } from './shell';

function diffParts(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms % 86_400_000) / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000)
  };
}

export default function Countdown({ title, targetDate, variant = 'circles', position, entrance, blockStyle }: CountdownProps) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setNow(Date.now()));
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearInterval(id);
    };
  }, []);

  const target = new Date(targetDate).getTime();
  const parts = now ? diffParts(Number.isFinite(target) ? target : 0, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const items: [string, number][] = [
    ['Hari', parts.days],
    ['Jam', parts.hours],
    ['Menit', parts.minutes],
    ['Detik', parts.seconds]
  ];

  function renderUnits() {
    if (variant === 'line') {
      return (
        <p className="mt-8 text-2xl tabular-nums" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
          {items.map(([label, value]) => `${String(value).padStart(2, '0')} ${label}`).join('  ·  ')}
        </p>
      );
    }
    const box = variant === 'boxes' ? 'rounded-xl bg-[var(--color-primary,#3b5ba5)] text-white px-4 py-3' : 'flex w-16 flex-col items-center';
    return (
      <div className="mt-8 flex justify-center gap-3">
        {items.map(([label, value]) => (
          <div key={label} className={box}>
            <span className={variant === 'boxes' ? 'text-2xl font-semibold tabular-nums' : 'text-3xl font-semibold tabular-nums'} style={variant === 'boxes' ? undefined : { color: 'var(--color-primary)' }}>
              {String(value).padStart(2, '0')}
            </span>
            <span className={variant === 'boxes' ? 'mt-0.5 block text-[9px] uppercase tracking-wide opacity-80' : 'mt-1 text-[10px] uppercase tracking-wide opacity-70'}>{label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {renderUnits()}
      </section>
    </BlockShell>
  );
}
