'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, LayoutTemplate, FilePlus } from 'lucide-react';
import { TEMPLATE_LIST } from '@/lib/templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import { clientCreateProject } from '@/lib/api/project-client';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

interface NewProjectModalProps {
  open: boolean;
  onClose: () => void;
}

export default function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const router = useRouter();
  const [view, setView] = useState<'blank' | 'templates'>('blank');
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState<TemplateCategory | 'semua'>('semua');

  async function startFromScratch() {
    setBusy(true);
    const res = await clientCreateProject(title, undefined);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.push(`/builder/${res.id}`);
  }

  async function startFromTemplate(templateId: string) {
    setBusy(true);
    const res = await clientCreateProject(title || 'Undangan Baru', templateId);
    setBusy(false);
    if (res.error) return setError(res.error);
    router.push(`/builder/${res.id}`);
  }

  const filtered =
    catFilter === 'semua'
      ? TEMPLATE_LIST
      : TEMPLATE_LIST.filter((t) => (t.category ?? '').toLowerCase() === catFilter);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <DialogTitle className="font-semibold">
            {view === 'blank' ? 'Buat Undangan Baru' : 'Pilih Template'}
          </DialogTitle>
        </div>
        {/* Deskripsi untuk pembaca layar — konten visual sudah cukup jelas. */}
        <DialogDescription className="sr-only">
          Buat undangan digital baru dengan nama pilihan Anda, mulai dari kosong atau dari template.
        </DialogDescription>

        <div className="flex-1 overflow-y-auto p-6">
          <label htmlFor="new-project-title" className="text-xs font-medium text-gray-700">
            Nama undangan
          </label>
          <input
            id="new-project-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Perkawinan Panca & Sena"
            aria-describedby={error ? 'new-project-error' : undefined}
            className="mt-1 w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
          />
          {error && (
            <p id="new-project-error" role="alert" className="mt-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 space-y-3">
            {view === 'blank' && (
              <button
                onClick={startFromScratch}
                disabled={busy}
                className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 text-left hover:border-gray-400 disabled:opacity-60"
              >
                <FilePlus className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="text-sm font-medium">Mulai dari Kosong</p>
                  <p className="text-xs text-gray-500">Buka kanvas kosong dan bangun desain sendiri</p>
                </div>
              </button>
            )}

            {view === 'templates' && (
              <>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCatFilter('semua')}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      catFilter === 'semua' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Semua
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCatFilter(c.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                        catFilter === c.key ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="mb-4 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                    {catFilter === 'semua' ? 'Filosofi Kategori' : `Makna ${categoryLabel(catFilter)}`}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                    {catFilter === 'semua'
                      ? 'Setiap gaya membawa makna dan suasana tersendiri — pilih yang paling dekat dengan cerita cinta kalian.'
                      : CATEGORIES.find((c) => c.key === catFilter)?.desc}
                  </p>
                </div>

                <div className="grid max-h-80 grid-cols-2 gap-3 overflow-auto sm:grid-cols-3">
                  {filtered.map((t) => {
                    const number = TEMPLATE_LIST.findIndex((x) => x.id === t.id) + 1;
                    return (
                      <button
                        key={t.id}
                        onClick={() => startFromTemplate(t.id)}
                        disabled={busy}
                        className="relative rounded-xl border border-gray-200 p-4 text-left transition-colors hover:border-gray-400 disabled:opacity-60"
                      >
                        <span className="pointer-events-none absolute right-2 bottom-0 select-none text-5xl font-bold text-gray-200">
                          {String(number).padStart(2, '0')}
                        </span>
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {categoryLabel(t.category)}
                        </span>
                        <div className="mb-3 mt-3 flex gap-1.5">
                          <span className="h-6 w-6 rounded-full border border-black/5" style={{ background: t.primary }} />
                          <span className="h-6 w-6 rounded-full border border-black/5" style={{ background: t.secondary }} />
                        </div>
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{t.description}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
          {view === 'templates' ? (
            <button onClick={() => setView('blank')} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <Plus className="h-4 w-4" /> Mulai kosong
            </button>
          ) : (
            <button onClick={() => setView('templates')} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
              <LayoutTemplate className="h-4 w-4" /> Mulai dari template
            </button>
          )}
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-900">
            Batal
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}