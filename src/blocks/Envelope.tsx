import type { EnvelopeProps } from '@/puck/types';
import { BlockShell } from './shell';

export default function Envelope({ title, note, accounts, position, entrance, blockStyle }: EnvelopeProps) {
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {note ? <p className="mx-auto mt-2 max-w-sm text-sm opacity-80">{note}</p> : null}
        <div className="mt-8 flex flex-col gap-4">
          {(accounts ?? []).map((acc, i) => (
            <div key={`${acc.accountNumber}-${i}`} className="mx-auto w-full max-w-sm rounded-2xl border border-dashed p-5" style={{ borderColor: 'var(--color-secondary,#c9a227)' }}>
              <p className="text-xs uppercase tracking-wide opacity-70">{acc.bankName}</p>
              <p className="mt-1 font-mono text-lg tracking-wide">{acc.accountNumber}</p>
              <p className="text-xs opacity-70">a.n. {acc.accountHolder}</p>
            </div>
          ))}
        </div>
      </section>
    </BlockShell>
  );
}
