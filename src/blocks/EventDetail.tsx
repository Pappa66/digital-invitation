import type { EventDetailProps } from '@/puck/types';
import { BlockShell } from './shell';

function Card({ label, date, time, place }: { label: string; date: string; time: string; place: string }) {
  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm">
      <p className="text-lg" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-primary)' }}>
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{date}</p>
      <p className="text-sm opacity-80">{time}</p>
      <p className="mt-1 text-xs opacity-70">{place}</p>
    </div>
  );
}

export default function EventDetail({ title, events, variant = 'cards', position, entrance, blockStyle }: EventDetailProps) {
  const list = events ?? [];

  function body() {
    if (variant === 'inline') {
      return (
        <div className="mx-auto mt-8 max-w-sm divide-y divide-black/10 border-y border-black/10">
          {list.map((ev, i) => (
            <div key={`${ev.label}-${i}`} className="flex items-baseline justify-between gap-3 py-3 text-left">
              <span className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
                {ev.label}
              </span>
              <span className="text-right text-xs opacity-80">
                {ev.date} · {ev.time}
                <br />
                {ev.place}
              </span>
            </div>
          ))}
        </div>
      );
    }
    if (variant === 'roman') {
      return (
        <div className="mx-auto mt-8 flex max-w-sm flex-col gap-8">
          {list.map((ev, i) => (
            <div key={`${ev.label}-${i}`} className="text-center">
              <span className="text-xs uppercase tracking-[0.3em] opacity-50" style={{ color: 'var(--color-primary)' }}>
                {['I', 'II', 'III', 'IV'][i] ?? i + 1}
              </span>
              <p className="mt-2 text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
                {ev.label}
              </p>
              <p className="mt-1 text-sm font-medium">{ev.date}</p>
              <p className="text-sm opacity-80">{ev.time}</p>
              <p className="mt-1 text-xs opacity-70">{ev.place}</p>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-8 flex flex-col gap-6">
        {list.map((ev, i) => (
          <Card key={`${ev.label}-${i}`} {...ev} />
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
        {body()}
      </section>
    </BlockShell>
  );
}
