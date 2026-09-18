'use client';

import Link from 'next/link';
import { getSiteOrigin } from '@/lib/site';
import type { ProjectMeta } from '@/puck/hooks/use-puck-project';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface BuilderHeaderProps {
  meta: ProjectMeta;
  saveStatus: SaveStatus;
  busy: boolean;
  isEditLink: boolean;
  legacy: boolean;
  onOpenPicker: () => void;
  onPublish: () => void;
}

/** Header editor: judul, status simpan, aksi template/publish/preview. */
export default function BuilderHeader({ meta, saveStatus, busy, isEditLink, legacy, onOpenPicker, onPublish }: BuilderHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7ddcc] bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/dashboard" className="shrink-0 text-sm font-semibold text-[#2b2620] hover:text-[#b98a3e]">
          ← Dashboard
        </Link>
        <span className="truncate text-sm font-medium text-[#4a443c]">{meta.title}</span>
        {isEditLink ? <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700">Mode Link Edit</span> : null}
        {legacy ? <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">Desain lama — dimulai dari kanvas kosong</span> : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#8a7a66]">
          {saveStatus === 'saving' && 'Menyimpan…'}
          {saveStatus === 'saved' && 'Tersimpan'}
          {saveStatus === 'error' && <span className="text-red-500">Gagal menyimpan</span>}
        </span>
        {!isEditLink ? (
          <>
            <button type="button" onClick={onOpenPicker} className="rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c]">
              Template
            </button>
            <button
              type="button"
              onClick={onPublish}
              disabled={busy}
              className={`rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
                meta.status === 'published' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-[#e0d6c2] bg-white text-[#4a443c]'
              }`}
            >
              {busy ? 'Menyimpan…' : meta.status === 'published' ? 'Dipublikasikan' : 'Publish'}
            </button>
          </>
        ) : null}
        {meta.slug ? (
          <a
            href={`${getSiteOrigin()}/${meta.slug}${isEditLink ? '' : '?preview=1'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Preview ↗
          </a>
        ) : null}
      </div>
    </header>
  );
}
