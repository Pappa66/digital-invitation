'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Puck } from '@puckeditor/core';
import '@puckeditor/core/puck.css';
import '@/puck/editor-theme.css';
import { config } from '@/puck/config';
import ComponentOverlay from '@/puck/overrides/ComponentOverlay';
import { usePuckAutosave, savePuckNow } from '@/puck/hooks/use-puck-autosave';
import { usePuckProject } from '@/puck/hooks/use-puck-project';
import { getPuckTemplate } from '@/lib/templates/puck';
import { clientSetProjectStatus } from '@/lib/api/project-client';
import { saveDesignByShareToken } from '@/lib/actions/share-token-actions';
import BuilderHeader from '@/puck/components/builder-header';
import TemplatePicker from '@/puck/components/template-picker';
import MediaLibrary from '@/puck/components/media-library';
import type { PuckData } from '@/lib/canvas/puck-format';

interface PuckBuilderProps {
  projectId: string;
  /** Bila diisi: mode "link edit" tanpa login (simpan via token). */
  editToken?: string;
}

/** Editor undangan berbasis Puck. Autosave + publish ke Supabase. */
export default function PuckBuilder({ projectId, editToken }: PuckBuilderProps) {
  const isEditLink = Boolean(editToken);
  const { data, setData, access, legacy, meta, setMeta } = usePuckProject(projectId, editToken);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [emptyDismissed, setEmptyDismissed] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  const saveStatus = usePuckAutosave({
    projectId,
    data,
    enabled: access === 'ok',
    save: editToken ? (d) => saveDesignByShareToken(editToken, d) : undefined
  });

  async function handlePublish(next: PuckData) {
    if (busy) return;
    setBusy(true);
    await savePuckNow(projectId, next);
    const target = meta.status === 'published' ? 'draft' : 'published';
    const res = await clientSetProjectStatus(projectId, target);
    if (!res.error) setMeta((m) => ({ ...m, status: target, slug: res.slug ?? m.slug }));
    setBusy(false);
  }

  function closePicker() {
    setPickerOpen(false);
    setEmptyDismissed(true);
  }

  function selectTemplate(id: string | null) {
    if (id) {
      const tpl = getPuckTemplate(id);
      if (tpl) {
        setData(tpl);
        setEditorKey((k) => k + 1);
      }
    }
    closePicker();
  }

  if (access === 'denied') return <DeniedScreen />;
  if (access === 'checking' || !data) return <LoadingScreen />;

  return (
    <div
      className="puck-brand flex h-screen flex-col overflow-hidden bg-white"
      style={{ '--canvas-max-w': device === 'tablet' ? '768px' : device === 'desktop' ? 'none' : '430px' } as React.CSSProperties}
    >
      <BuilderHeader
        meta={meta}
        saveStatus={saveStatus}
        busy={busy}
        isEditLink={isEditLink}
        legacy={legacy}
        projectId={projectId}
        device={device}
        onDevice={setDevice}
        onOpenPicker={() => setPickerOpen(true)}
        onOpenMedia={() => setMediaOpen(true)}
        onPublish={() => data && handlePublish(data)}
      />

      <div className="min-h-0 flex-1">
        <Puck
          key={editorKey}
          config={config}
          data={data}
          iframe={{ enabled: false }}
          overrides={{ componentOverlay: ComponentOverlay }}
          onChange={(next) => setData(next)}
          onPublish={handlePublish}
        />
      </div>

      {(pickerOpen || (data.content.length === 0 && !emptyDismissed)) && <TemplatePicker onSelect={selectTemplate} onClose={closePicker} />}

      <MediaLibrary open={mediaOpen} onClose={() => setMediaOpen(false)} />
    </div>
  );
}

function DeniedScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6">
      <div className="w-full max-w-sm rounded-xl border border-[#e7ddcc] bg-white p-8 text-center shadow-xl">
        <h1 className="text-base font-semibold text-[#2b2620]">Tidak Ada Akses</h1>
        <p className="mt-2 text-sm text-[#6b5f4d]">Halaman ini hanya bisa dibuka oleh pemilik undangan.</p>
        <Link
          href="/dashboard"
          className="mt-5 inline-block rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] text-sm text-[#8a7a66]">Memuat editor…</div>;
}
