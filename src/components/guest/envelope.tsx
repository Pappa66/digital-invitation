'use client';

import { useContext, useState } from 'react';
import { Check, Copy, Eye, EyeOff, Gift } from 'lucide-react';
import type { BlockProps, BankAccount } from '@/lib/types';
import { Editable, BuilderEditableContext } from '@/components/builder/inline-edit';

function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}

export default function EnvelopeBlock({ props }: { props: BlockProps }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<Record<number, boolean>>({});
  const inBuilder = useContext(BuilderEditableContext) !== null;

  const accounts = (Array.isArray(props.accounts) ? props.accounts : []) as BankAccount[];
  const legacyAccount = {
    bank_name: str(props, 'bank_name'),
    account_number: str(props, 'account_number'),
    account_holder: str(props, 'account_holder')
  };
  const effectiveAccounts = accounts.length > 0 ? accounts : legacyAccount.account_number ? [legacyAccount] : [];

  if (effectiveAccounts.length === 0 && !inBuilder) return null;

  async function reveal(i: number) {
    setRevealed((r) => ({ ...r, [i]: true }));
  }

  async function copyAccount(i: number, accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setRevealed((r) => ({ ...r, [i]: true }));
      setCopied((c) => ({ ...c, [i]: true }));
    } catch {
      /* ignore */
    }
    setTimeout(() => setCopied((c) => ({ ...c, [i]: false })), 1800);
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-16 text-center">
      <div className="rounded-2xl border border-dashed border-current/25 bg-white/5 px-6 py-6 text-center">
        <div className="flex flex-col items-center gap-1">
          <Gift className="h-5 w-5 opacity-70" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
            <Editable prop="title">{str(props, 'title') || 'Amplop Online'}</Editable>
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed opacity-80">
          <Editable prop="note">
            {str(props, 'note') ||
              'Apabila ingin mengirimkan tanda kasih, doa restu dapat disalurkan melalui rekening berikut. Cukup ketuk untuk melihat nomornya.'}
          </Editable>
        </p>

        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform hover:scale-[1.03]"
          >
            <Gift className="h-4 w-4" /> Beri Kado
          </button>
        ) : (
          <div className="mt-5 space-y-3 text-sm">
            {effectiveAccounts.length === 0 && inBuilder && (
              <p className="text-xs italic opacity-60">Belum ada rekening. Tambah via panel kanan.</p>
            )}
            {effectiveAccounts.map((acc, i) => {
              const isOpen = !!revealed[i];
              return (
                <div key={i} className="overflow-hidden rounded-2xl border border-current/10 bg-white/5 text-left">
                  <button
                    type="button"
                    onClick={() => (isOpen ? setRevealed((r) => ({ ...r, [i]: false })) : reveal(i))}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-current/5"
                  >
                    <div className="min-w-0">
                      {acc.bank_name && <p className="font-medium">{acc.bank_name}</p>}
                      {acc.account_holder && <p className="truncate text-[11px] opacity-60">a.n. {acc.account_holder}</p>}
                    </div>
                    <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-current/20 px-2.5 py-1 text-[11px] uppercase tracking-wide opacity-80">
                      {isOpen ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      {isOpen ? 'Sembunyikan' : 'Lihat'}
                    </span>
                  </button>
                  {isOpen ? (
                    <div className="flex items-center gap-2 border-t border-current/10 px-4 py-2.5">
                      <span className="text-sm font-semibold tracking-[0.08em]">{acc.account_number}</span>
                      <button
                        onClick={() => copyAccount(i, acc.account_number)}
                        title="Salin nomor rekening"
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10"
                      >
                        {copied[i] ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 opacity-80" />}
                      </button>
                    </div>
                  ) : (
                    <div className="border-t border-current/10 px-4 py-2.5 text-[11px] uppercase tracking-[0.25em] text-current/40">
                      ••••• ••••• •••••
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}