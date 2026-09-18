import type { TextProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Text({ title, body, align = 'center', position, entrance, blockStyle }: TextProps) {
  const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className={`bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-[var(--color-text,#4a4036)] ${alignClass}`}>
        {title ? (
          <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
            {title}
          </h2>
        ) : null}
        <div className="mt-3 space-y-2 text-sm leading-relaxed">
          {body.split('\n').filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </section>
    </BlockShell>
  );
}
