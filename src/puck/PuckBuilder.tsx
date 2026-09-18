'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Puck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import { config } from '@/puck/config';
import ComponentOverlay from '@/puck/overrides/ComponentOverlay';
import { usePuckAutosave, savePuckNow } from '@/puck/hooks/use-puck-autosave';
import { emptyPuckData, isPuckData, type PuckData } from '@/lib/canvas/puck-format';
import { PUCK_TEMPLATE_LIST, getPuckTemplate } from '@/lib/templates/puck';
import { supabase } from '@/lib/supabase/client';
import { clientSetProjectStatus, clientVerifyProjectAccess } from '@/lib/api/project-client';
import { loadDesignByShareToken, saveDesignByShareToken } from '@/lib/actions/share-token-actions';
import { demoIsDemoMode } from '@/lib/demo/demo-store';
import { getSiteOrigin } from '@/lib/site';

interface PuckBuilderProps {
  projectId: string;
  /** Bila diisi: mode "link edit" tanpa login (simpan via token). */
  editToken?: string;
}

type Access = 'checking' | 'ok' | 'denied';

/** Editor undangan berbasis Puck (Fase 3). Autosave + publish ke Supabase. */
export default function PuckBuilder({ projectId, editToken }: PuckBuilderProps) {
  const isEditLink = Boolean(editToken);
  const [data, setData] = useState<PuckData | null>(null);
  const [access, setAccess] = useState<Access>('checking');
  const [legacy, setLegacy] = useState(false);
  const [meta, setMeta] = useState<{ title: string; slug: string | null; status: 'draft' | 'published' }>({
    title: 'Tanpa Judul',
    slug: null,
    status: 'draft'
  });
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [emptyDismissed, setEmptyDismissed] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const saveStatus = usePuckAutosave({
    projectId,
    data,
    enabled: access === 'ok',
    save: editToken ? (d) => saveDesignByShareToken(editToken, d) : undefined
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (demoIsDemoMode()) {
        // Demo lokal: mulai dari template agar langsung terlihat.
        setData(getPuckTemplate('ivory-gold') ?? emptyPuckData());
        setMeta((m) => ({ ...m, title: 'Demo — Ivory Gold', slug: 'demo-undangan' }));
        setAccess('ok');
        return;
      }

      if (editToken) {
        const res = await loadDesignByShareToken(editToken);
        if (cancelled) return;
        if (res.error || !res.data) {
          setAccess('denied');
          return;
        }
        setAccess('ok');
        if (isPuckData(res.data.canvas_data)) setData(res.data.canvas_data);
        else {
          if (res.data.canvas_data) setLegacy(true);
          setData(emptyPuckData());
        }
        setMeta((m) => ({ ...m, title: res.data?.project_title ?? m.title, slug: res.data?.project_slug ?? null }));
        return;
      }

      const { allowed } = await clientVerifyProjectAccess(projectId);
      if (cancelled) return;
      if (!allowed) {
        setAccess('denied');
        return;
      }
      setAccess('ok');

      const { data: row } = await supabase
        .from('project_designs')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();
      const canvas = row?.canvas_data;
      if (isPuckData(canvas)) {
        setData(canvas);
      } else {
        if (canvas) setLegacy(true);
        setData(emptyPuckData());
      }

      const { data: proj } = await supabase.from('projects').select('title, slug, status').eq('id', projectId).maybeSingle();
      if (!cancelled && proj) {
        setMeta({
          title: proj.title ?? 'Tanpa Judul',
          slug: proj.slug ?? null,
          status: proj.status === 'published' ? 'published' : 'draft'
        });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, editToken]);

  async function handlePublish(next: PuckData) {
    if (busy) return;
    setBusy(true);
    await savePuckNow(projectId, next);
    const target = meta.status === 'published' ? 'draft' : 'published';
    const res = await clientSetProjectStatus(projectId, target);
    if (!res.error) {
      setMeta((m) => ({ ...m, status: target, slug: res.slug ?? m.slug }));
    }
    setBusy(false);
  }

  if (access === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6">
        <div className="w-full max-w-sm rounded-xl border border-[#e7ddcc] bg-white p-8 text-center shadow-xl">
          <h1 className="text-base font-semibold text-[#2b2620]">Tidak Ada Akses</h1>
          <p className="mt-2 text-sm text-[#6b5f4d]">Halaman ini hanya bisa dibuka oleh pemilik undangan.</p>
          <Link href="/dashboard" className="mt-5 inline-block rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (access === 'checking' || !data) {
    return <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-sm text-[#8a7a66]">Memuat editor…</div>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
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
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c]"
              >
                Template
              </button>
              <button
                type="button"
                onClick={() => data && handlePublish(data)}
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

      <div className="min-h-0 flex-1">
        <Puck
          key={editorKey}
          config={config}
          data={data}
          iframe={{ enabled: false }}
          overrides={{ componentOverlay: ComponentOverlay }}
          onChange={(next) => setData(next)}
          onPublish={(next) => handlePublish(next)}
        />
      </div>

      {(pickerOpen || (data.content.length === 0 && !emptyDismissed)) && (
        <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-auto bg-black/40 p-6">
          <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#2b2620]">Mulai dari Template</h2>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen(false);
                  setEmptyDismissed(true);
                }}
                className="rounded border border-[#e0d6c2] px-2 py-1 text-xs"
              >
                Tutup
              </button>
            </div>
            <p className="mt-1 text-xs text-[#8a7a66]">Pilih template untuk mengisi kanvas, atau mulai dari kosong.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PUCK_TEMPLATE_LIST.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    const tpl = getPuckTemplate(t.id);
                    if (tpl) {
                      setData(tpl);
                      setEditorKey((k) => k + 1);
                    }
                    setPickerOpen(false);
                    setEmptyDismissed(true);
                  }}
                  className="flex items-start gap-3 rounded-xl border border-[#e7ddcc] p-3 text-left hover:border-[#c9a45c] hover:bg-[#faf7f2]"
                >
                  <span className="mt-1 h-10 w-10 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-[#2b2620]">{t.name}</span>
                    <span className="block text-xs text-[#8a7a66]">{t.description}</span>
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setPickerOpen(false);
                setEmptyDismissed(true);
              }}
              className="mt-4 w-full rounded-lg border border-dashed border-[#c9a45c] px-4 py-2 text-sm text-[#8a6d2f] hover:bg-[#c9a45c]/10"
            >
              Mulai dari kosong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
