import type { ThanksProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Thanks({ title, message, position, entrance, blockStyle }: ThanksProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-8 py-16 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed opacity-85">{message}</p>
        <div className="mx-auto mt-6 h-px w-16" style={{ backgroundColor: 'var(--color-secondary,#c9a227)' }} />
      </section>
    </BlockShell>
  );
}
