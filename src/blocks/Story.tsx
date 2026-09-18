import type { StoryProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Story({ title, items, position, entrance }: StoryProps) {
  return (
    <BlockShell position={position} entrance={entrance}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-[var(--color-text,#4a4036)]">
        <h2 className="text-center text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <div className="mt-8 flex flex-col gap-6">
          {(items ?? []).map((item, i) => (
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
      </section>
    </BlockShell>
  );
}
