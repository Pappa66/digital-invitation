'use client';

import { useContext } from 'react';
import { Gift, Check } from 'lucide-react';
import type { BlockProps } from '@/lib/types';
import { Editable, BuilderEditableContext } from '@/components/builder/inline-edit';

function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}

function arr(props: BlockProps, key: string): string[] {
  const v = props[key];
  return Array.isArray(v) ? (v as string[]) : [];
}

/**
 * Daftar Kado / list referensi hadiah. Menampilkan pesan singkat + beberapa
 * item saran hadiah yang dibingkai rapi (gaya katalog kecil).
 */
export default function GiftListBlock({ props }: { props: BlockProps }) {
  const items = arr(props, 'items');
  const inBuilder = useContext(BuilderEditableContext) !== null;

  if (items.length === 0 && !inBuilder) return null;

  return (
    <section className="mx-auto max-w-sm px-6 py-16 text-center">
      <div className="rounded-2xl border border-dashed border-current/25 bg-white/5 px-6 py-7 text-center">
        <div className="flex flex-col items-center gap-1">
          <Gift className="h-5 w-5 opacity-70" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-70">
            <Editable prop="title">{str(props, 'title') || 'Daftar Kado'}</Editable>
          </p>
        </div>
        <p className="mt-3 text-xs leading-relaxed opacity-80">
          <Editable prop="note">
            {str(props, 'note') ||
              'Kehadiran Anda adalah hadiah terindah bagi kami. Namun bila ingin berbagi kebahagiaan, berikut beberapa referensi tanda kasih.'}
          </Editable>
        </p>

        {items.length === 0 && inBuilder ? (
          <p className="mt-4 text-xs italic opacity-60">Belum ada item. Tambah via panel kanan.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-2 text-left">
            {items.map((item, i) => (
              <li
                key={`${item}-${i}`}
                className="flex items-center gap-2 rounded-lg border border-current/10 bg-white/5 px-3 py-2.5 text-xs"
              >
                <Check className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}