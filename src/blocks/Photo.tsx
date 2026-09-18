import type { PhotoProps } from '@/puck/types';
import { BlockShell } from './shell';

const SHAPE: Record<NonNullable<PhotoProps['shape']>, string> = {
  square: 'rounded-none',
  rounded: 'rounded-2xl',
  circle: 'rounded-full',
  tilt: 'rounded-2xl rotate-2'
};

export default function Photo({ image, caption, shape = 'rounded', position, entrance, blockStyle }: PhotoProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-12 text-center text-[var(--color-text,#4a4036)]">
        {image ? (
          <figure className="mx-auto max-w-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={caption || ''} loading="lazy" decoding="async" className={`w-full object-cover shadow-soft ${SHAPE[shape]}`} />
            {caption ? <figcaption className="mt-2 text-xs opacity-70">{caption}</figcaption> : null}
          </figure>
        ) : (
          <p className="text-sm opacity-60">Pilih foto dari panel kanan.</p>
        )}
      </section>
    </BlockShell>
  );
}
