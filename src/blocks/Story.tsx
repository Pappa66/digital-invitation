import type { StoryProps, StoryItem } from '@/puck/types';
import { BlockShell } from './shell';

function Timeline({ items }: { items: StoryItem[] }) {
  return (
    <div className="mt-8 flex flex-col gap-6 text-left">
      {items.map((item, i) => (
        <div key={`${item.year}-${i}`} className="border-l-2 pl-4" style={{ borderColor: 'var(--color-primary,#3b5ba5)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>
            {item.year}
          </p>
          <p className="mt-1 text-base font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
            {item.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function Cards({ items }: { items: StoryItem[] }) {
  return (
    <div className="mt-8 flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={`${item.year}-${i}`} className="rounded-2xl border border-black/5 bg-white/70 p-5 text-left shadow-sm">
          <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            {item.year}
          </span>
          <p className="mt-2 text-base font-medium" style={{ fontFamily: 'var(--font-heading)' }}>
            {item.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

function Minimal({ items }: { items: StoryItem[] }) {
  return (
    <div className="mt-8 flex flex-col gap-5 text-center">
      {items.map((item, i) => (
        <div key={`${item.year}-${i}`}>
          <p className="text-xs uppercase tracking-[0.3em] opacity-50">{item.year}</p>
          <p className="mt-1 text-lg" style={{ fontFamily: 'var(--font-heading)' }}>
            {item.title}
          </p>
          <p className="mt-1 text-sm opacity-75">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

export default function Story({ title, items, variant = 'timeline', position, entrance, blockStyle }: StoryProps) {
  const list = items ?? [];
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-[var(--color-text,#4a4036)]">
        <h2 className="text-center text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {variant === 'cards' ? <Cards items={list} /> : variant === 'minimal' ? <Minimal items={list} /> : <Timeline items={list} />}
      </section>
    </BlockShell>
  );
}
