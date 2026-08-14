'use client';

import { useContext, useState } from 'react';
import { Check, Copy, Gift } from 'lucide-react';
import type { BlockProps, BankAccount } from '@/lib/types';
import { Editable, BuilderEditableContext } from '@/components/builder/inline-edit';

function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}

export default function EnvelopeBlock({ props }: { props: BlockProps }) {
  const [bankCopied, setBankCopied] = useState(false);
  const inBuilder = useContext(BuilderEditableContext) !== null;

  const accounts = (Array.isArray(props.accounts) ? props.accounts : []) as BankAccount[];
  const legacyAccount = {
    bank_name: str(props, 'bank_name'),
    account_number: str(props, 'account_number'),
    account_holder: str(props, 'account_holder')
  };
  const effectiveAccounts = accounts.length > 0 ? accounts : legacyAccount.account_number ? [legacyAccount] : [];

  if (effectiveAccounts.length === 0 && !inBuilder) return null;

  async function copyAccount(accountNumber: string) {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setBankCopied(true);
    } catch {
      setBankCopied(false);
    }
    setTimeout(() => setBankCopied(false), 1500);
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
            {str(props, 'note') || 'Apabila ingin mengirimkan tanda kasih, doa restu dapat disalurkan melalui rekening berikut.'}
          </Editable>
        </p>
        <div className="mt-4 space-y-2 text-sm">
          {effectiveAccounts.length === 0 && inBuilder && (
            <p className="text-xs italic opacity-60">Belum ada rekening. Tambah via panel kanan.</p>
          )}
          {effectiveAccounts.map((acc, i) => (
            <div key={i} className="rounded-xl border border-current/10 bg-white/5 px-3 py-2.5">
              {acc.bank_name && <p className="font-medium">{acc.bank_name}</p>}
              <div className="flex items-center justify-center gap-2">
                <span className="text-base font-semibold tracking-wider">{acc.account_number}</span>
                <button
                  onClick={() => copyAccount(acc.account_number)}
                  title="Salin nomor rekening"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10"
                >
                  {bankCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 opacity-80" />}
                </button>
              </div>
              {acc.account_holder && <p className="text-xs opacity-70">a.n. {acc.account_holder}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}