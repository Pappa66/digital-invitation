'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Check, Loader2 } from 'lucide-react';
import BuilderWorkspace from '@/components/builder/builder-workspace';
import { useBuilderStore } from '@/store/builder-store';
import { getCustomTemplate } from '@/lib/api/custom-templates';
import { migrateCanvas } from '@/lib/canvas-migrate';
import { useTemplateAutosave } from '@/hooks/use-template-autosave';
import { BuilderSkeleton } from '@/components/ui/skeleton';
import { demoIsDemoMode } from '@/lib/env';

type LoadState = 'loading' | 'ready' | 'error';

/**
 * Halaman "Edit Isi" template kustom — mengedit `canvas_data` yang tampil di
 * landing secara langsung, tanpa membuat undangan baru. Perubahan disimpan
 * otomatis (debounced) ke baris `custom_templates` yang sama.
 *
 * Halaman ini berada di route group `(app)`; karena builder butuh layar penuh,
 * kontennya dirender sebagai overlay `fixed inset-0` agar tidak bertabrakan
 * dengan kerangka dashboard (sidebar/header/bottom-nav).
 */
export default function TemplateEditPage() {
  const params = useParams<{ id: string }>();
  const templateId = params.id;
  const canvas = useBuilderStore((s) => s.canvas);
  const init = useBuilderStore((s) => s.init);
  const [name, setName] = useState('');
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const { status, saveNow } = useTemplateAutosave(templateId, canvas, state === 'ready');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (demoIsDemoMode()) {
        if (!cancelled) {
          setError('Mode demo: template kustom tersimpan di database dan tidak tersedia untuk diedit.');
          setState('error');
        }
        return;
      }
      // RLS membatasi select ke baris yang tampil publik atau milik pemilik/internal.
      const row = await getCustomTemplate(templateId);
      if (cancelled) return;
      if (!row?.canvas_data) {
        setError('Template tidak ditemukan atau Anda tidak punya akses untuk mengeditnya.');
        setState('error');
        return;
      }
      setName(row.name || 'Template');
      init(migrateCanvas(row.canvas_data), `custom-template:${templateId}`);
      setState('ready');
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [templateId, init]);

  // Bersihkan store saat keluar agar kanvas template tidak bocor ke halaman builder lain.
  useEffect(() => {
    return () => {
      useBuilderStore.getState().reset();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#faf7f2]">
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#e7ddcc] bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/templates"
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-sm font-semibold text-[#2b2620] transition-colors hover:bg-[#f0ebe3] hover:text-[#b98a3e]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali
          </Link>
          <span className="truncate text-sm font-medium text-[#6b5f4d]" title={name}>
            Edit Isi{name ? `: ${name}` : ''}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            role="status"
            aria-live="polite"
            className={`flex items-center gap-1.5 text-xs ${
              status === 'error' ? 'text-red-600' : status === 'saved' ? 'text-emerald-700' : 'text-[#8a7a66]'
            }`}
          >
            {status === 'saving' && (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Menyimpan…
              </>
            )}
            {status === 'saved' && (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden /> Tersimpan
              </>
            )}
            {status === 'error' && (
              <>
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> Gagal menyimpan
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => void saveNow(useBuilderStore.getState().canvas)}
            disabled={state !== 'ready' || status === 'saving'}
            className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Simpan
          </button>
        </div>
      </header>

      {state === 'loading' && (
        <div className="min-h-0 flex-1">
          <BuilderSkeleton />
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl border border-[#e7ddcc] bg-white p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-8 w-8 text-[#b98a3e]" aria-hidden />
            <h1 className="mt-3 text-base font-semibold text-[#2b2620]">Tidak Bisa Mengedit</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6b5f4d]">{error}</p>
            <Link
              href="/templates"
              className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden /> Kembali ke Template
            </Link>
          </div>
        </div>
      )}

      {state === 'ready' && (
        <BuilderWorkspace projectId={templateId} onSave={saveNow} />
      )}
    </div>
  );
}
