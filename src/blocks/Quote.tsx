import type { QuoteProps } from '@/puck/types';
import { BlockShell } from './shell';

const BOX: Record<NonNullable<QuoteProps['variant']>, string> = {
  plain: '',
  boxed: 'mx-auto max-w-md rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm',
  ornament: 'mx-auto max-w-md border-y border-[var(--color-secondary,#c9a227)] py-6'
};

export default function Quote({ text, arabic, source, variant = 'plain', position, entrance, blockStyle }: QuoteProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-8 py-14 text-center text-[var(--color-text,#4a4036)]">
        <div className={BOX[variant]}>
          {arabic ? (
            <p
              dir="rtl"
              lang="ar"
              className="mb-4 text-2xl leading-loose"
              style={{ fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif" }}
            >
              {arabic}
            </p>
          ) : (
            <p className="text-3xl leading-none" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              &ldquo;
            </p>
          )}
          <blockquote className="mt-1 text-lg italic leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
            {text}
          </blockquote>
          {source ? <p className="mt-3 text-xs uppercase tracking-wide opacity-70">— {source}</p> : null}
        </div>
      </section>
    </BlockShell>
  );
}
