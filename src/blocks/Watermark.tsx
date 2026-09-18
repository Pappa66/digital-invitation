import type { WatermarkProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Watermark({ text, opacity = 0.08, position, entrance, blockStyle }: WatermarkProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <div className="pointer-events-none select-none overflow-hidden bg-[var(--color-background,#fbf7f1)] py-10" aria-hidden>
        <p
          className="whitespace-nowrap text-center text-4xl font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'var(--color-primary,#3b5ba5)', opacity, fontFamily: 'var(--font-heading)' }}
        >
          {text} · {text} · {text}
        </p>
      </div>
    </BlockShell>
  );
}
