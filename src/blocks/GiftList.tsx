'use client';

import { useState } from 'react';
import { Copy, Check, Gift } from 'lucide-react';
import type { GiftListProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function GiftList({ title, accounts, address, buttonText, position, entrance, blockStyle }: GiftListProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const list = (accounts ?? []).filter((a) => a && a.accountNumber);

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch { /* ignore */ }
  }

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>{title}</h2>

        {!open ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-soft"
            style={{ backgroundColor: 'var(--color-primary,#3b5ba5)' }}
          >
            <Gift className="h-4 w-4" /> {buttonText || 'Beri Hadiah'}
          </button>
        ) : (
          <div className="mt-8 flex flex-col gap-4">
            {list.length === 0 ? <p className="text-sm opacity-60">Belum ada rekening.</p> : null}
            {list.map((acc, i) => (
              <div key={`${acc.accountNumber}-${i}`} className="mx-auto w-full max-w-sm rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>{acc.bankName}</p>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <p className="font-mono text-lg tracking-wide">{acc.accountNumber}</p>
                  <button type="button" onClick={() => copy(`acc-${i}`, acc.accountNumber)} className="rounded-md border border-current/20 p-1" title="Salin nomor">
                    {copied === `acc-${i}` ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <p className="text-xs opacity-70">a.n. {acc.accountHolder}</p>
              </div>
            ))}
            {address ? <p className="mx-auto max-w-sm text-xs leading-relaxed opacity-70">{address}</p> : null}
            <button type="button" onClick={() => setOpen(false)} className="mx-auto text-[11px] underline opacity-60">Tutup</button>
          </div>
        )}
      </section>
    </BlockShell>
  );
}
