'use client';

import { useState } from 'react';
import type { CopyTextProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function CopyText({ title, label, value, position, entrance, blockStyle }: CopyTextProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-12 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <div className="mx-auto mt-4 flex w-full max-w-sm items-center gap-2 rounded-xl border border-dashed border-[var(--color-secondary,#c9a227)] px-3 py-2">
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] uppercase tracking-wide opacity-60">{label}</p>
            <p className="truncate font-mono text-sm">{value}</p>
          </div>
          <button
            type="button"
            onClick={copy}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
            style={{ backgroundColor: 'var(--color-primary,#3b5ba5)' }}
          >
            {copied ? 'Tersalin' : 'Salin'}
          </button>
        </div>
      </section>
    </BlockShell>
  );
}
