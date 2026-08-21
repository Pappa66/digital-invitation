'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookmarkPlus, HelpCircle, PenLine, Share2, Lock, Globe, GlobeLock, QrCode } from 'lucide-react';
import BuilderWorkspace from '@/components/builder/builder-workspace';
import ShareDialog from '@/components/dashboard/share-dialog';
import AbsenShareDialog from '@/components/ui/absen-share-dialog';
import SaveTemplateDialog from '@/components/builder/save-template-dialog';
import GuideModal from '@/components/ui/guide-modal';
import { useBuilderStore } from '@/store/builder-store';
import { useAutosave } from '@/hooks/use-autosave';
import { supabase } from '@/lib/supabase/client';
import { clientRenameProject, clientSetProjectStatus } from '@/lib/api/project-client';
import { demoGetDesign, demoGetProject, demoIsDemoMode } from '@/lib/demo/demo-store';
import { clientVerifyProjectAccess } from '@/lib/api/project-client';
import { getSiteOrigin } from '@/lib/site';
import { BuilderSkeleton } from '@/components/ui/skeleton';
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
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [statusBusy, setStatusBusy] = useState(false);
  const [renameStatus, setRenameStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [shareOpen, setShareOpen] = useState(false);
  const [absenOpen, setAbsenOpen] = useState(false);
  const [saveTplOpen, setSaveTplOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [access, setAccess] = useState<'checking' | 'ok' | 'denied'>('checking');
  const autoSlugRef = useRef<string | null>(null);

  useEffect(() => {
    async function load() {
      if (demoIsDemoMode()) {
        const design = demoGetDesign(projectId);
        if (design) init(design, projectId);
        const proj = demoGetProject(projectId);
        setTitle(proj?.title ?? 'Tanpa Judul');
        autoSlugRef.current = proj?.title ?? null;
        setPreviewSlug(proj?.slug ?? null);
        setStatus(proj?.status ?? 'draft');
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
        init(data.canvas_data as unknown as CanvasData, projectId);
      }
      const { data: proj } = await supabase.from('projects').select('slug, title, status').eq('id', projectId).maybeSingle();
      setTitle(proj?.title ?? 'Tanpa Judul');
      autoSlugRef.current = proj?.title ?? null;
      setPreviewSlug(proj?.slug ?? null);
      setStatus(proj?.status ?? 'draft');
    }
    load();
  }, [projectId, init]);

  async function handleRename() {
    const trimmed = title.trim();
    if (!trimmed) return;
    setRenameStatus('saving');
    const { error, slug } = await clientRenameProject(projectId, trimmed);
    if (!error && slug) setPreviewSlug(slug);
    if (!error) autoSlugRef.current = trimmed;
    setRenameStatus(error ? 'idle' : 'saved');
    setTimeout(() => setRenameStatus('idle'), 1500);
  }

  // Otomatis: slug dinamis dari nama pasangan (Hero bride & groom) — update judul & slug tanpa edit manual
  useEffect(() => {
    const hero = canvas.blocks.find((b) => b.type === 'Hero')?.props as Record<string, unknown> | undefined;
    const bride = typeof hero?.bride === 'string' ? hero.bride.trim() : '';
    const groom = typeof hero?.groom === 'string' ? hero.groom.trim() : '';
    if (!bride && !groom) return;
    const autoTitle = [bride, groom].filter(Boolean).join(' & ') || 'Tanpa Judul';
    const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const wantSlug = slugify(autoTitle);
    const haveSlug = previewSlug ? slugify(previewSlug) : '';
    const needSlugFix = wantSlug && haveSlug && wantSlug !== haveSlug && haveSlug.startsWith('elegant-gold');
    // Hanya auto bila judul masih default / masih sama dengan auto sebelumnya (jangan timpa edit manual) — atau slug lama masih template
    const isDefault = title === 'Tanpa Judul' || title === 'Elegant Gold' || title.trim() === '';
    const isAuto = autoSlugRef.current !== null && title === autoSlugRef.current;
    if (!isDefault && !isAuto && !needSlugFix) return;
    if (autoTitle === title && !needSlugFix) return;
    // Debounce 800ms agar tidak spam saat ketik
    const t = setTimeout(async () => {
      if (autoTitle !== title) setTitle(autoTitle);
      autoSlugRef.current = autoTitle;
      const { slug } = await clientRenameProject(projectId, autoTitle);
      if (slug) setPreviewSlug(slug);
    }, 800);
    return () => clearTimeout(t);
  }, [canvas.blocks, projectId, title, previewSlug]);

  async function handleToggleStatus() {
    if (statusBusy) return;
    setStatusBusy(true);
    const next = status === 'published' ? 'draft' : 'published';
    const res = await clientSetProjectStatus(projectId, next);
    if (res.error) {
      setStatusBusy(false);
      return;
    }
    setStatus(next);
    if (res.slug) setPreviewSlug(res.slug);
    setStatusBusy(false);
  }

  if (access === 'denied') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6">
        <div className="w-full max-w-sm rounded-xl border border-[#e7ddcc] bg-white p-8 text-center shadow-xl">
          <Lock className="mx-auto h-8 w-8 text-[#8a7a66]" />
          <h1 className="mt-3 text-base font-semibold text-[#2b2620]">Tidak Ada Akses</h1>
          <p className="mt-2 text-sm text-[#6b5f4d]">
            Anda tidak memiliki akses untuk mengedit undangan ini. Halaman ini hanya bisa dibuka oleh pemiliknya.
          </p>
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

  if (access === 'checking') {
    return (
      <div className="flex min-h-screen flex-col bg-[#faf7f2]">
        <div className="h-12 border-b bg-white" />
        <BuilderSkeleton />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#faf7f2]">
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#e7ddcc] bg-white px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold text-[#2b2620] transition-colors hover:text-[#b98a3e]">
            ← Dashboard
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-1">
            <PenLine className="h-3.5 w-3.5 shrink-0 text-[#8a7a66]" />
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
              }}
              aria-label="Judul undangan"
              className="w-56 min-w-0 truncate rounded-sm bg-transparent text-sm font-medium text-[#2b2620] outline-none focus:ring-1 focus:ring-[#c9a45c]"
            />
            {renameStatus === 'saving' && <span className="shrink-0 text-[10px] text-[#8a7a66]">...</span>}
            {renameStatus === 'saved' && <span className="shrink-0 text-[10px] text-emerald-600">Tersimpan</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#8a7a66]">
            {saveStatus === 'saving' && 'Menyimpan...'}
            {saveStatus === 'saved' && 'Tersimpan'}
          </span>
          <button
            onClick={() => setSaveTplOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]"
          >
            <BookmarkPlus className="h-3.5 w-3.5" /> Simpan sebagai Template
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={statusBusy}
            aria-pressed={status === 'published'}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              status === 'published'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]'
            }`}
          >
            {status === 'published' ? <Globe className="h-3.5 w-3.5" /> : <GlobeLock className="h-3.5 w-3.5" />}
            {statusBusy ? 'Menyimpan...' : status === 'published' ? 'Dipublikasikan' : 'Publish'}
          </button>
          {previewSlug && (
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1.5 rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]"
            >
              <Share2 className="h-3.5 w-3.5" /> Bagikan
            </button>
          )}
          <button
            onClick={() => setAbsenOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]"
          >
            <QrCode className="h-3.5 w-3.5" /> QR Absen
          </button>
          {previewSlug ? (
            <a
              href={`${getSiteOrigin()}/${previewSlug}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Preview ↗
            </a>
          ) : (
            <span className="rounded-md border border-[#e0d6c2] bg-white px-3 py-1.5 text-xs font-medium text-[#8a7a66]">Preview</span>
          )}
          <button
            onClick={() => setGuideOpen(true)}
            aria-label="Panduan Builder"
            className="rounded-md border border-[#e0d6c2] bg-white p-1.5 text-[#4a443c] hover:border-[#c9a45c] hover:text-[#8a6d2f]"
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
          <AbsenShareDialog
            open={absenOpen}
            projectId={projectId}
            onClose={() => setAbsenOpen(false)}
          />
        </div>
      </header>
      <BuilderWorkspace projectId={projectId} />
      <SaveTemplateDialog open={saveTplOpen} canvas={canvas} defaultName={title} onClose={() => setSaveTplOpen(false)} />
      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Builder"
        steps={[
          {
            title: '1. Tambahkan bagian',
            body: 'Seret blok dari panel kiri (Hero, Mempelai, Countdown, Maps, Gallery, dll.) ke kanvas. Blok baru muncul di posisi yang dimaksud.'
          },
          {
            title: '2. Edit teks langsung',
            body: 'Klik teks pada kanvas untuk menyunting inline. Teks otomatis wrap dan bisa dipindah拖 dengan tombol "Geser" (Inner Drag) di pojok kiri atas tiap blok.'
          },
          {
            title: '3. Ganti varian blok',
            body: 'Setiap blok punya beberapa varian (gaya). Pilih blok, lalu pilih varian di panel Properties: "Gaya". Misal Story punya varian Timeline, Cards, Minimal.'
          },
          {
            title: '4. Gaya Frame & Card',
            body: 'Di Canvas Settings (atas kanvas), pilih frame (9 opsi: classic, floral, ornate, dll) dan card style (shadow, glass, elevated, dll) untuk seluruh undangan.'
          },
          {
            title: '5. Animasi Gallery',
            body: 'Pilih blok Gallery, lalu pilih animasi di Properties: fade, zoom, flip, ken-burns, slide, blur, dll. Total 20+ animasi tersedia.'
          },
          {
            title: '6. Hero Background',
            body: 'Pilih blok Hero, klik "Pilih Foto Hero" untuk memilih gambar. Gunakan tombol "Crop & Posisi" untuk mengatur zoom, posisi, dan crop gambar latar.'
          },
          {
            title: '7. Ornamen & Decor',
            body: 'Klik blok mana pun, lalu tombol "+" di pojok kanan atas untuk menambah ornamen/decor. Pilih dari 44+ aset ornamen (bunga, geometric, dll).'
          },
          {
            title: '8. Geser elemen bebas (Inner Drag)',
            body: 'Klik "Geser" pada blok → muncul label nama elemen. Tarik label tersebut untuk memindahkan teks/elemen di dalam blok. Ada penjuru snap otomatis.'
          },
          {
            title: '9. Warna per elemen',
            body: 'Saat mode geser aktif, klik ikon palet di samping label elemen untuk mengatur warna teks khusus per elemen (judul, subjudul, dll).'
          },
          {
            title: '10. Atur tampilan',
            body: 'Tombol di atas kanvas: Grid (garis panduan) dan Mobile/Desktop preview untuk melihat hasil di berbagai perangkat.'
          },
          {
            title: '11. Simpan & Bagikan',
            body: 'Klik "Simpan" untuk menyimpan perubahan. "Simpan sebagai Template" untuk reuse desain. "Bagikan" untuk kirim undangan via WhatsApp atau salin tautan.'
          }
        ]}
      />
    </div>
  );
}