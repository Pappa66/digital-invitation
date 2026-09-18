'use client';

import CoverModal from '@/components/guest/cover-modal';
import type { CoverProps } from '@/puck/types';
import { BlockShell } from './shell';

interface Props extends CoverProps {
  puck?: { isEditing?: boolean; metadata?: { greetingName?: string } };
}

/**
 * Blok Cover "Buka Undangan" (seperti builder lama: cover tampil di kanvas).
 * - Mode edit: pratinjau statis setinggi layar.
 * - Mode tamu: overlay interaktif penuh (buka undangan).
 */
export default function Cover({ caption, bride, groom, date, bgImage, greeting, buttonText, coverStyle = 'floral', position, entrance, blockStyle, puck }: Props) {
  const editing = puck?.isEditing;
  const greetingName = puck?.metadata?.greetingName;

  if (editing) {
    return (
      <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
        <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-neutral-900 px-6 py-16 text-center text-white">
          {bgImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
          ) : null}
          <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 text-[10px] text-white">Cover</span>
          <div className="relative z-10 flex flex-col items-center" style={{ textShadow: '0 2px 14px rgba(0,0,0,0.45)' }}>
            <p className="text-[11px] uppercase tracking-[0.35em] opacity-90">{caption}</p>
            <h1 className="mt-4 text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{bride}</h1>
            <span className="my-2 text-sm opacity-60">&amp;</span>
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-heading)' }}>{groom}</h1>
            <p className="mt-6 text-xs uppercase tracking-[0.28em] opacity-90">{date}</p>
            <p className="mt-6 text-[10px] uppercase tracking-[0.3em] opacity-80">{greeting || 'Kepada Yth.'}</p>
            <span className="mt-2 rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em]">{buttonText || 'Buka Undangan'}</span>
          </div>
        </section>
      </BlockShell>
    );
  }

  return (
    <CoverModal
      caption={caption}
      bride={bride}
      groom={groom}
      date={date}
      bgImage={bgImage}
      greetingName={greetingName}
      primary="var(--color-primary, #3b5ba5)"
      secondary="var(--color-secondary, #c9a227)"
      background="var(--color-background, #fbf7f1)"
      text="var(--color-text, #4a4036)"
      coverGreeting={greeting}
      coverButtonText={buttonText}
      coverStyle={coverStyle}
    />
  );
}
