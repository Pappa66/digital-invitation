'use client';

import { useEffect, useState } from 'react';
import type { CountdownProps } from '@/puck/types';
import { BlockShell } from './shell';

function diffParts(target: number, now: number) {
  const ms = Math.max(0, target - now);
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ title, targetDate, position, entrance, blockStyle }: CountdownProps) {
  // `now` null saat SSR/awal render agar tidak ada hydration mismatch.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // setState lewat callback (rAF) agar tidak sinkron di body effect.
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

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          {items.map(([label, value]) => (
            <div key={label} className="flex w-16 flex-col items-center">
              <span className="text-3xl font-semibold tabular-nums" style={{ color: 'var(--color-primary)' }}>
                {String(value).padStart(2, '0')}
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-wide opacity-70">{label}</span>
            </div>
          ))}
        </div>
      </section>
    </BlockShell>
  );
}
