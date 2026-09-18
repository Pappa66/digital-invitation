import type { GiftListProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function GiftList({ title, accounts, address, position, entrance }: GiftListProps) {
  return (
    <BlockShell position={position} entrance={entrance}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <div className="mt-8 flex flex-col gap-4">
          {(accounts ?? []).map((acc, i) => (
            <div key={`${acc.accountNumber}-${i}`} className="mx-auto w-full max-w-sm rounded-2xl border border-black/5 bg-white/70 p-5 shadow-sm">
              <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                {acc.bankName}
              </p>
              <p className="mt-1 font-mono text-lg tracking-wide">{acc.accountNumber}</p>
              <p className="text-xs opacity-70">a.n. {acc.accountHolder}</p>
            </div>
          ))}
        </div>
        {address ? <p className="mx-auto mt-6 max-w-sm text-xs leading-relaxed opacity-70">{address}</p> : null}
      </section>
    </BlockShell>
  );
}
