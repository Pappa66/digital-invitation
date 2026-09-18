'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSiteOrigin } from '@/lib/site';
import { generateShareToken } from '@/lib/actions/share-token-actions';
import { clientGetInviteAccessToken } from '@/lib/api/project-client';
import { guestLink } from '@/lib/guest-links';
import type { ProjectMeta } from '@/puck/hooks/use-puck-project';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
export type DeviceKind = 'mobile' | 'tablet' | 'desktop';

interface BuilderHeaderProps {
  meta: ProjectMeta;
  saveStatus: SaveStatus;
  busy: boolean;
  isEditLink: boolean;
  legacy: boolean;
  projectId: string;
  device: DeviceKind;
  onDevice: (device: DeviceKind) => void;
  onOpenPicker: () => void;
  onOpenMedia: () => void;
  onPublish: () => void;
}

const BTN = 'rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c]';

/** Header editor: judul, status simpan, aksi template/publish/preview + tamu/share. */
export default function BuilderHeader({ meta, saveStatus, busy, isEditLink, legacy, projectId, device, onDevice, onOpenPicker, onOpenMedia, onPublish }: BuilderHeaderProps) {
  const [busyLink, setBusyLink] = useState(false);
  const [toast, setToast] = useState('');

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`${label} disalin`);
      setTimeout(() => setToast(''), 1800);
    } catch {
      setToast('Gagal menyalin');
    }
  }

  async function shareEditLink() {
    setBusyLink(true);
    try {
      const res = await generateShareToken(projectId, 72);
      if (res.data?.token) await copy(`${getSiteOrigin()}/edit/${res.data.token}`, 'Link edit');
      else setToast(res.error ?? 'Gagal membuat link edit');
    } finally {
      setBusyLink(false);
    }
  }

  async function shareGuestManageLink() {
    setBusyLink(true);
    try {
      const res = await clientGetInviteAccessToken(projectId);
      if (res.token) await copy(`${getSiteOrigin()}/invite/${projectId}?t=${res.token}`, 'Link kelola tamu');
      else setToast(res.error ?? 'Gagal membuat link tamu');
    } finally {
      setBusyLink(false);
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7ddcc] bg-white px-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/dashboard" className="shrink-0 text-sm font-semibold text-[#2b2620] hover:text-[#b98a3e]">
          ← Dashboard
        </Link>
        <span className="truncate text-sm font-medium text-[#4a443c]">{meta.title}</span>
        {isEditLink ? <span className="rounded bg-sky-100 px-2 py-0.5 text-[10px] text-sky-700">Mode Link Edit</span> : null}
        {legacy ? <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">Desain lama — kanvas kosong</span> : null}
      </div>
      <div className="flex items-center gap-2">
        {toast ? <span className="text-xs text-emerald-600">{toast}</span> : null}
        <span className="text-xs text-[#8a7a66]">
          {saveStatus === 'saving' && 'Menyimpan…'}
          {saveStatus === 'saved' && 'Tersimpan'}
          {saveStatus === 'error' && <span className="text-red-500">Gagal menyimpan</span>}
        </span>

        {!isEditLink ? (
          <>
            <div className="flex items-center overflow-hidden rounded-md border border-[#e0d6c2]">
              {(['mobile', 'tablet', 'desktop'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDevice(d)}
                  aria-pressed={device === d}
                  className={`px-2.5 py-1.5 text-xs font-medium ${device === d ? 'bg-[#c9a45c] text-white' : 'bg-white text-[#4a443c] hover:bg-[#f4efe6]'}`}
                >
                  {d === 'mobile' ? 'HP' : d === 'tablet' ? 'Tablet' : 'Desktop'}
                </button>
              ))}
            </div>
            <button type="button" onClick={onOpenPicker} className={BTN}>
              Template
            </button>
            <button type="button" onClick={onOpenMedia} className={BTN}>
              Media
            </button>
            <Link href={`/invite/${projectId}`} className={BTN}>
              Kelola Tamu
            </Link>
            <button type="button" onClick={shareGuestManageLink} disabled={busyLink} className={BTN}>
              Link Tamu
            </button>
            {meta.slug ? (
              <button type="button" onClick={() => copy(guestLink(getSiteOrigin(), meta.slug ?? undefined, ''), 'Link undangan')} className={BTN}>
                Bagikan
              </button>
            ) : null}
            <button type="button" onClick={shareEditLink} disabled={busyLink} className={BTN}>
              {busyLink ? 'Membuat…' : 'Link Edit'}
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
