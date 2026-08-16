'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Loader2, Plus, Sparkles, Trash2, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { TEMPLATE_LIST } from '@/lib/templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import { clientCreateProject, clientCreateProjectFromData } from '@/lib/api/project-client';
import { userTemplatesList, userTemplateDelete } from '@/lib/demo/user-templates';
import type { UserTemplate } from '@/lib/demo/user-templates';
import GuideModal from '@/components/ui/guide-modal';

const PER_PAGE = 8;

export default function TemplatesPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userTemplates, setUserTemplates] = useState<UserTemplate[]>([]);
  const [guideOpen, setGuideOpen] = useState(false);
  const [category, setCategory] = useState<TemplateCategory | 'semua'>('semua');
  const [page, setPage] = useState(1);
  const [demoIds, setDemoIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem('di_demo_templates');
      if (stored) setDemoIds(new Set(JSON.parse(stored)));
    } catch { /* ignore */ }
  }, []);

  function toggleDemo(id: string) {
    setDemoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('di_demo_templates', JSON.stringify(Array.from(next)));
      return next;
    });
  }

  const refreshUserTemplates = useCallback(() => setUserTemplates(userTemplatesList()), []);

  useEffect(() => {
    refreshUserTemplates();
  }, [refreshUserTemplates]);

  async function go(res: { id?: string; error?: string }) {
    setBusyId(null);
    if (res.error) return setError(res.error);
    router.push(`/builder/${res.id}`);
  }

  async function startBlank() {
    setBusyId('_blank');
    setError(null);
    await go(await clientCreateProject(title.trim() || 'Template Baru'));
  }

  async function startBuiltIn(templateId: string) {
    setBusyId(templateId);
    setError(null);
    await go(await clientCreateProject(title.trim() || 'Undangan Baru', templateId));
  }

  async function startUser(t: UserTemplate) {
    setBusyId(t.id);
    setError(null);
    await go(await clientCreateProjectFromData(title.trim() || `Undangan dari ${t.name}`, t.canvas));
  }

  function removeUser(id: string) {
    userTemplateDelete(id);
    refreshUserTemplates();
  }

  function selectCategory(cat: TemplateCategory | 'semua') {
    setCategory(cat);
    setPage(1);
  }

  const filtered =
    category === 'semua' ? TEMPLATE_LIST : TEMPLATE_LIST.filter((t) => (t.category ?? '').toLowerCase() === category);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Template</h2>
          <p className="text-sm text-gray-500">
            Mulai dari template jadi, buat dari kosong, atau pakai lagi desain yang kamu simpan sebagai template.
          </p>
          <label className="mt-4 block text-xs font-medium text-gray-700">Nama undangan</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Perkawinan Panca & Sena"
            className="mt-1 w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>
        <button
          onClick={() => setGuideOpen(true)}
          className="flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <HelpCircle className="h-4 w-4" /> Panduan
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white/60 px-4 py-4">
        <Sparkles className="h-5 w-5 text-gray-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-800">Mulai dari halaman kosong</p>
          <p className="text-xs text-gray-500">Lewati template dan susun sendiri semuanya di Builder.</p>
        </div>
        <button
          onClick={startBlank}
          disabled={busyId !== null}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {busyId === '_blank' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Mulai Kosong
        </button>
      </div>

      {userTemplates.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Template Saya</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userTemplates.map((t) => (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <div
                  className="relative flex h-36 items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)` }}
                >
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {t.category}
                  </span>
                  <button
                    onClick={() => removeUser(t.id)}
                    aria-label={`Hapus template ${t.name}`}
                    className="absolute right-2 top-2 rounded-md bg-black/20 p-1.5 text-white hover:bg-black/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.primary }} />
                    <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.secondary }} />
                    <p className="ml-1 truncate text-sm font-semibold text-gray-900">{t.name}</p>
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-500">{t.description}</p>
                  <button
                    onClick={() => startUser(t)}
                    disabled={busyId !== null}
                    className="mt-4 flex items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {busyId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pakai Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Template Bawaan</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Klik preview untuk melihat detail desain, lalu pakai untuk mulai mendesain.
            </p>
          </div>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{filtered.length} template</span>
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          <button
            onClick={() => selectCategory('semua')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              category === 'semua' ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => selectCategory(c.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                category === c.key ? 'bg-gray-900 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mb-6 max-w-3xl rounded-xl border border-gray-200 bg-amber-50/60 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            {category === 'semua' ? 'Filosofi Kategori' : `Makna ${categoryLabel(category)}`}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
            {category === 'semua'
              ? 'Setiap gaya membawa makna dan suasana tersendiri — pilih kategori yang paling dekat dengan cerita cinta kalian.'
              : CATEGORIES.find((c) => c.key === category)?.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((t) => {
            const number = TEMPLATE_LIST.findIndex((x) => x.id === t.id) + 1;
            return (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => router.push(`/templates/${t.id}`)}
                  className="relative flex h-36 items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)` }}
                >
                  <span className="pointer-events-none absolute left-2 bottom-1 select-none text-6xl font-bold text-white/20">
                    {String(number).padStart(2, '0')}
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {categoryLabel(t.category)}
                  </span>
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/20 px-2 py-1 text-[10px] font-medium text-white hover:bg-black/40">
                    <Eye className="h-3 w-3" /> Preview
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.primary }} />
                    <span className="h-4 w-4 rounded-full border border-black/5" style={{ background: t.secondary }} />
                    <p className="ml-1 text-sm font-semibold text-gray-900">{t.name}</p>
                  </div>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-gray-500">{t.description}</p>
                  <button
                    onClick={() => startBuiltIn(t.id)}
                    disabled={busyId !== null}
                    className="mt-4 flex items-center justify-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
                  >
                    {busyId === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Pakai Template
                  </button>
                  <button
                    onClick={() => toggleDemo(t.id)}
                    className={`mt-2 flex items-center justify-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                      demoIds.has(t.id)
                        ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {demoIds.has(t.id) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {demoIds.has(t.id) ? 'Demo Aktif' : 'Tampilkan di Landing'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-9 w-9 rounded-lg text-sm ${
                  n === safePage ? 'bg-gray-900 font-semibold text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>

      <GuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        title="Panduan Template"
        steps={[
          {
            title: '1. Template Contoh',
            body: 'Di bawah "Undangan Contoh", klik kartu template untuk melihat preview lengkap. Setiap template sudah diisi konten demo agar Anda bisa lihat hasil akhirnya.'
          },
          {
            title: '2. Pakai Template',
            body: 'Klik "Pakai Template" pada kartu yang dipilih. Nama undangan diisi otomatis dari nama template; bisa dikosongkan dan diubah nanti di Builder.'
          },
          {
            title: '3. Mulai Kosong',
            body: 'Klik "Mulai Kosong" untuk menyusun undangan dari nol. Semua blok (Hero, Mempelai, Maps, Gallery, dll.) tersedia di sidebar Builder.'
          },
          {
            title: '4. Template Saya',
            body: 'Setelah mendesain, klik "Simpan sebagai Template" di Builder. Template tersimpan di "Template Saya" dan bisa dipakai ulang untuk klien lain.'
          },
          {
            title: '5. Hapus Template',
            body: 'Klik ikon sampah di pojok kanan kartu "Template Saya" untuk menghapus. Template bawaan (Undangan Contoh) tidak bisa dihapus.'
          }
        ]}
      />
    </div>
  );
}