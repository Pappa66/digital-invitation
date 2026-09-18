import type { DividerProps, DividerVariant } from '@/puck/types';
import { BlockShell } from './shell';

const GLYPH: Record<DividerVariant, string> = {
  line: '—',
  dots: '• • •',
  diamond: '◆',
  hearts: '♥ ♥',
  leaves: '❧ ❧'
};

export default function Divider({ variant = 'line', position, entrance }: DividerProps) {
  return (
    <BlockShell position={position} entrance={entrance}>
      <div className="flex items-center justify-center gap-4 bg-[var(--color-background,#fbf7f1)] px-6 py-8" aria-hidden>
        {variant === 'line' ? (
          <span className="h-px w-40" style={{ backgroundColor: 'var(--color-secondary,#c9a227)' }} />
        ) : (
          <span className="text-sm tracking-[0.4em]" style={{ color: 'var(--color-secondary,#c9a227)' }}>
            {GLYPH[variant]}
          </span>
        )}
      </div>
    </BlockShell>
  );
}
