import type { QuoteProps } from '@/puck/types';
import { getQuoteById } from '@/lib/quotes';
import { BlockShell } from './shell';

const BOX: Record<NonNullable<QuoteProps['variant']>, string> = {
  plain: '',
  boxed: 'mx-auto max-w-md rounded-2xl border border-black/5 bg-white/70 p-6 shadow-sm',
  ornament: 'mx-auto max-w-md border-y border-[var(--color-secondary,#c9a227)] py-6'
};

export default function Quote({ text, arabic, source, variant = 'plain', preset, position, entrance, blockStyle }: QuoteProps) {
  const lib = getQuoteById(preset);
  const original = lib?.original ?? arabic ?? '';
  const bodyText = lib?.translation ?? text;
  const sourceText = lib?.reference ?? source;
  const isArabic = /[\u0600-\u06FF]/.test(original);

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-8 py-14 text-center text-[var(--color-text,#4a4036)]">
        <div className={BOX[variant]}>
          {original ? (
            <p
              dir={isArabic ? 'rtl' : 'ltr'}
              lang={isArabic ? 'ar' : undefined}
              className={isArabic ? 'mb-3 text-2xl leading-loose' : 'mb-3 text-lg leading-relaxed opacity-90'}
              style={isArabic ? { fontFamily: "'Amiri', 'Scheherazade New', 'Noto Naskh Arabic', serif" } : undefined}
            >
              {original}
            </p>
          ) : (
            <p className="text-3xl leading-none" style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-heading)' }}>
              &ldquo;
            </p>
          )}
          {lib?.latin ? <p className="mb-2 text-xs italic opacity-60">{lib.latin}</p> : null}
          <blockquote className="mt-1 text-lg italic leading-relaxed" style={{ fontFamily: 'var(--font-heading)' }}>
            {bodyText}
          </blockquote>
          {sourceText ? <p className="mt-3 text-xs uppercase tracking-wide opacity-70">— {sourceText}</p> : null}
        </div>
      </section>
    </BlockShell>
  );
}
