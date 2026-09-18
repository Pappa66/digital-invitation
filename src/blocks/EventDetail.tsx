import type { EventDetailProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function EventDetail({ title, events, position, entrance, blockStyle }: EventDetailProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          {(events ?? []).map((ev, i) => (
            <div key={`${ev.label}-${i}`} className="mx-auto w-full max-w-sm rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm">
              <p className="text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
                {ev.label}
              </p>
              <p className="mt-2 text-sm font-medium">{ev.date}</p>
              <p className="text-sm opacity-80">{ev.time}</p>
              <p className="mt-1 text-xs opacity-70">{ev.place}</p>
            </div>
          ))}
        </div>
      </section>
    </BlockShell>
  );
}
