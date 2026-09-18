import type { QuoteProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Quote({ text, source, position, entrance, blockStyle }: QuoteProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-8 py-14 text-center text-[var(--color-text,#4a4036)]">
        <p className="text-3xl leading-none" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
          &ldquo;
        </p>
        <blockquote className="mt-2 text-lg italic leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
          {text}
        </blockquote>
        {source ? <p className="mt-3 text-xs uppercase tracking-wide opacity-70">— {source}</p> : null}
      </section>
    </BlockShell>
  );
}
