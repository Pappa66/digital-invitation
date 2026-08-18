'use client';

import { useContext, useState } from 'react';
import { Check, Copy, Eye, EyeOff, Gift } from 'lucide-react';
import type { BlockProps, BankAccount } from '@/lib/types';
import { Editable, BuilderEditableContext } from '@/components/builder/inline-edit';
import { Inner } from '@/components/guest/inner-context';

function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}

function arr(props: BlockProps, key: string): string[] {
  const v = props[key];
  return Array.isArray(v) ? (v as string[]) : [];
}

function bool(props: BlockProps, key: string): boolean {
  return props[key] === true || props[key] === 'true';
}

export default function EnvelopeBlock({ props }: { props: BlockProps }) {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<'cash' | 'gift'>('cash');
  const inBuilder = useContext(BuilderEditableContext) !== null;
  const variant = str(props, 'variant') || 'standard';

  const accounts = (Array.isArray(props.accounts) ? props.accounts : []) as BankAccount[];
  const legacyAccount = {
    bank_name: str(props, 'bank_name'),
    account_number: str(props, 'account_number'),
    account_holder: str(props, 'account_holder')
  };
  const effectiveAccounts = accounts.length > 0 ? accounts : legacyAccount.account_number ? [legacyAccount] : [];
  const giftRegistryEnabled = bool(props, 'gift_registry_enabled');
  const giftItems = arr(props, 'gift_items');

  if (effectiveAccounts.length === 0 && !giftRegistryEnabled && !inBuilder) return null;

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

  const showTabs = giftRegistryEnabled && effectiveAccounts.length > 0;

  return (
    <section className="mx-auto max-w-sm px-6 py-8 sm:py-10 md:py-12 text-center">
      <div className={`${variant === 'minimal' ? 'rounded-xl border border-current/10 bg-current/[0.03]' : 'rounded-2xl border border-dashed border-current/25 bg-white/5'} px-6 py-6 text-center`}>
        <Inner name="title">
          <div className="flex flex-col items-center gap-1">
            {variant !== 'minimal' && <Gift className="h-5 w-5 opacity-70" />}
            <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
              <Editable prop="title">{str(props, 'title') || 'Amplop Online'}</Editable>
            </p>
          </div>
        </Inner>
        <Inner name="note">
          <p className="mt-3 text-xs leading-relaxed opacity-80">
            <Editable prop="note">
              {str(props, 'note') ||
                'Apabila ingin mengirimkan tanda kasih, doa restu dapat disalurkan melalui rekening berikut. Cukup ketuk untuk melihat nomornya.'}
            </Editable>
          </p>
        </Inner>

        {showTabs && (
          <Inner name="tabs">
            <div className="mt-4 flex items-center justify-center gap-1 rounded-full border border-current/15 bg-white/5 p-1">
              <button
                onClick={() => setTab('cash')}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  tab === 'cash' ? 'bg-[var(--color-primary)] text-white' : 'opacity-60 hover:opacity-100'
                }`}
              >
                Kado Cashless
              </button>
              <button
                onClick={() => setTab('gift')}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  tab === 'gift' ? 'bg-[var(--color-primary)] text-white' : 'opacity-60 hover:opacity-100'
                }`}
              >
                Daftar Kado
              </button>
            </div>
          </Inner>
        )}

        {!open ? (
          <Inner name="button">
            <button
              onClick={() => setOpen(true)}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-7 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition-transform hover:scale-[1.03] active:scale-95"
            >
              <Gift className="h-4 w-4" aria-hidden /> Beri Kado
            </button>
          </Inner>
        ) : (
          <Inner name="accounts">
            <div className="mt-5 space-y-3 text-sm">
              {showTabs && tab === 'gift' ? (
                giftItems.length > 0 ? (
                  <ul className="grid grid-cols-2 gap-2 text-left">
                    {giftItems.map((item, i) => (
                      <li
                        key={`${item}-${i}`}
                        className="flex items-center gap-2 rounded-lg border border-current/10 bg-white/5 px-3 py-2.5 text-xs"
                      >
                        <Check className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        <span className="leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic opacity-60">Belum ada daftar kado. Tambah via panel kanan.</p>
                )
              ) : (
                <>
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
                              aria-label="Salin nomor rekening"
                              className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10"
                            >
                              {copied[i] ? <Check className="h-4 w-4 text-green-500" aria-hidden /> : <Copy className="h-4 w-4 opacity-80" aria-hidden />}
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
                </>
              )}
            </div>
          </Inner>
        )}
      </div>
    </section>
  );
}