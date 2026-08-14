'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookmarkPlus, HelpCircle, PenLine, Share2, Lock } from 'lucide-react';
import ElementsSidebar from '@/components/builder/elements-sidebar';
import BuilderCanvas from '@/components/builder/builder-canvas';
import PropertiesPanel from '@/components/builder/properties-panel';
import ShareDialog from '@/components/dashboard/share-dialog';
import SaveTemplateDialog from '@/components/builder/save-template-dialog';
import GuideModal from '@/components/ui/guide-modal';
import { useBuilderStore } from '@/store/builder-store';
import { useAutosave } from '@/hooks/use-autosave';
import { supabase } from '@/lib/supabase/client';
import { clientRenameProject } from '@/lib/api/project-client';
import { demoGetDesign, demoGetProject, demoIsDemoMode } from '@/lib/demo/demo-store';
import { clientVerifyProjectAccess } from '@/lib/api/project-client';
import type { CanvasData } from '@/lib/types';

export default function BuilderPage() {
  const params = useParams<{ id: string }>();
  const projectId = params.id;
  const canvas = useBuilderStore((s) => s.canvas);
  const init = useBuilderStore((s) => s.init);
  const setReligion = useBuilderStore((s) => s.setReligion);
  const saveStatus = useAutosave({ projectId, canvas });
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [title, setTitle] = useState('Tanpa Judul');
  const [renameStatus, setRenameStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [shareOpen, setShareOpen] = useState(false);
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [access, setAccess] = useState<'checking' | 'ok' | 'denied'>('checking');

  useEffect(() => {
    async function load() {
      if (demoIsDemoMode()) {
        const design = demoGetDesign(projectId);
        if (design) init(design);
        const proj = demoGetProject(projectId);
        setTitle(proj?.title ?? 'Tanpa Judul');
        setPreviewSlug(proj?.slug ?? null);
        setAccess('ok');
        return;
      }
      const { allowed } = await clientVerifyProjectAccess(projectId);
      if (!allowed) {
        setAccess('denied');
        return;
      }
      setAccess('ok');
      const { data, error } = await supabase
        .from('project_designs')
        .select('canvas_data')
        .eq('project_id', projectId)
        .maybeSingle();
      if (!error && data?.canvas_data) {
        init(data.canvas_data as unknown as CanvasData);
      }
      const { data: proj } = await supabase.from('projects').select('slug, title').eq('id', projectId).maybeSingle();
      setTitle(proj?.title ?? 'Tanpa Judul');
      setPreviewSlug(proj?.slug ?? null);
    }
    load();
  }, [projectId, init]);

  async function handleRename() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setRenameStatus('saving');
    const { error } = await clientRenameProject(projectId, trimmed);
    setRenameStatus(error ? 'idle' : 'saved');
    setTimeout(() => setRenameStatus('idle'), 1500);
  }

  if (access === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Lock className="mx-auto h-8 w-8 text-gray-300" />
          <h1 className="mt-3 text-base font-semibold text-gray-900">Tidak Ada Akses</h1>
          <p className="mt-2 text-sm text-gray-500">
            Anda tidak memiliki akses untuk mengedit undangan ini. Halaman ini hanya bisa dibuka oleh pemiliknya.
          </p>
          <Link
            href="/dashboard"
            className="mt-5 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (access === 'checking') {
    return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-400">Memeriksa akses...</div>;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold text-gray-900">
            ← Dashboard
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 py-1">
            <PenLine className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              aria-label="Judul undangan"
              className="w-56 min-w-0 truncate rounded-sm bg-transparent text-sm font-medium text-gray-900 outline-none focus:ring-1 focus:ring-gray-900"
            />
            {renameStatus === 'saving' && <span className="shrink-0 text-[10px] text-gray-400">...</span>}
            {renameStatus === 'saved' && <span className="shrink-0 text-[10px] text-green-600">Tersimpan</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {saveStatus === 'saving' && 'Menyimpan...'}
            {saveStatus === 'saved' && 'Tersimpan'}
          </span>
          <button
            onClick={() => setSaveTplOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Simpan sebagai Template
          </button>
          {previewSlug && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
            >
              <Share2 className="h-3.5 w-3.5" /> Bagikan
            </button>
          )}
          {previewSlug ? (
            <a
              href={`/${previewSlug}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
            >
              Preview ↗
            </a>
          ) : (
            <span className="rounded-md bg-gray-300 px-3 py-1.5 text-xs font-medium text-white">Preview</span>
          )}
          <button
            onClick={() => setGuideOpen(true)}
            aria-label="Panduan Builder"
            className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          {previewSlug && (
            <ShareDialog
              open={shareOpen}
              projectId={projectId}
              slug={previewSlug}
              title={title}
              religion={canvas.settings.religion}
              onChangeReligion={setReligion}
              onClose={() => setShareOpen(false)}
            />
          )}
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <ElementsSidebar />
        <BuilderCanvas projectId={projectId} />
        <PropertiesPanel />
      </div>
      <SaveTemplateDialog open={saveTplOpen} canvas={canvas} defaultName={title} onClose={() => setSaveTplOpen(false)} />
      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Builder"
        steps={[
          {
            title: 'Tambahkan bagian',
            body: 'Seret blok dari panel kiri (Hero, Mempelai, Countdown, Pemisah, dst.) ke kanvas. Blok baru muncul di posisi kursor.'
          },
          {
            title: 'Edit teks langsung',
            body: 'Klik teks pada kanvas untuk menyunting. Klik tombol "Geser" pada blok untuk memindahkannya; seret dari tombol itu, bukan dari seluruh blok.'
          },
          {
            title: 'Atur gaya & isi',
            body: 'Panel kanan (Properties) dipakai untuk mengubah warna, foto latar, varian, hingga teks & isi tiap blok.'
          },
          {
            title: 'Simpan sebagai template',
            body: 'Klik "Simpan sebagai Template" agar desain tersimpan di halaman Templates dan bisa dipakai ulang.'
          },
          {
            title: 'Bagikan ke tamu',
            body: 'Klik "Bagikan" untuk mengirim undangan via WhatsApp satu per satu atau massal, dan kelola daftar tamu lewat "Tautan Kelola Tamu".'
          }
        ]}
      />
    </div>
  );
}