'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HelpCircle, Loader2, Plus, Sparkles, Trash2, ChevronLeft, ChevronRight, Eye, Search } from 'lucide-react';
import { TEMPLATE_LIST, getTemplate } from '@/lib/templates';
import { createTemplate } from '@/lib/api/custom-templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import { clientCreateProject, clientCreateProjectFromData } from '@/lib/api/project-client';
import { userTemplatesList, userTemplateDelete } from '@/lib/demo/user-templates';
import type { UserTemplate } from '@/lib/demo/user-templates';
import GuideModal from '@/components/ui/guide-modal';
import TemplateManager from '@/components/dashboard/template-manager';
import LandingTemplatePicker from '@/components/dashboard/landing-template-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [search, setSearch] = useState('');
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string } | null>(null);

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

  async function duplicateSeed(templateId: string, name: string, category?: string) {
    setBusyId(templateId);
    setError(null);
    const canvas = getTemplate(templateId);
    if (!canvas) {
      setError('Template tidak ditemukan.');
      setBusyId(null);
      return;
    }
    const res = await createTemplate({ name: `${name} (salinan)`, category: category || 'Template Saya', canvas });
    setBusyId(null);
    if (res.error) setError(res.error);
    else setError('Disalin ke Template Saya — buka menu Template untuk mengeditnya.');
  }

  async function startBuiltIn(templateId: string) {
    setBusyId(templateId);
    setError(null);
    const name = title.trim() || 'Undangan Baru';
    await go(await clientCreateProject(name, templateId));
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

  const query = search.trim().toLowerCase();
  const filtered = TEMPLATE_LIST.filter((t) => {
    const matchCategory = category === 'semua' || (t.category ?? '').toLowerCase() === category;
    if (!query) return matchCategory;
    const haystack = `${t.name} ${t.description ?? ''} ${t.category ?? ''}`.toLowerCase();
    return matchCategory && haystack.includes(query);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Template</h2>
          <p className="text-sm text-muted-foreground">
            Mulai dari template jadi, buat dari kosong, atau pakai lagi desain yang kamu simpan sebagai template.
          </p>
        </div>
        <Button variant="outline" onClick={() => setGuideOpen(true)}>
          <HelpCircle className="h-4 w-4" aria-hidden /> Panduan
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-4 shadow-soft">
        <Sparkles className="h-5 w-5 text-gold-strong" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Mulai dari halaman kosong</p>
          <p className="text-xs text-muted-foreground">Lewati template dan susun sendiri semuanya di Builder.</p>
        </div>
        <Button onClick={startBlank} disabled={busyId !== null}>
          {busyId === '_blank' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />}
          Mulai Kosong
        </Button>
      </div>

      <LandingTemplatePicker />

      <TemplateManager />

      {userTemplates.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Template Saya</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {userTemplates.map((t) => (
              <div
                key={t.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card"
              >
                <div
                  className="relative flex h-36 items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)` }}
                >
                  <span className="rounded-full bg-foreground/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {t.category}
                  </span>
                  <button
                    onClick={() => removeUser(t.id)}
                    aria-label={`Hapus template ${t.name}`}
                    className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-md bg-foreground/20 text-white transition-colors hover:bg-foreground/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
<div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border border-foreground/5" style={{ background: t.primary }} aria-hidden />
                        <span className="h-4 w-4 rounded-full border border-foreground/5" style={{ background: t.secondary }} aria-hidden />
                        <p className="ml-1 truncate text-sm font-semibold text-foreground">{t.name}</p>
                      </div>
                      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                      <Button onClick={() => startUser(t)} disabled={busyId !== null} className="mt-4 w-full">
                        {busyId === t.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                        Pakai Template
                      </Button>
                    </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Template Bawaan</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Klik preview untuk melihat detail desain, lalu pakai untuk mulai mendesain.
            </p>
          </div>
          <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{filtered.length} template</span>
        </div>

        <div className="mb-3 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari template..."
            aria-label="Cari template"
            className="pl-9 text-sm"
          />
        </div>

        <div className="mb-2 flex flex-wrap gap-2">
          <Button key="semua" variant={category === 'semua' ? 'default' : 'outline'} size="sm" className="rounded-full px-3 text-xs" onClick={() => selectCategory('semua')} aria-pressed={category === 'semua'}>
            Semua
          </Button>
          {CATEGORIES.map((c) => (
            <Button
              key={c.key}
              variant={category === c.key ? 'default' : 'outline'}
              size="sm"
              className="rounded-full px-3 text-xs"
              onClick={() => selectCategory(c.key)}
              aria-pressed={category === c.key}
            >
              {c.label}
            </Button>
          ))}
        </div>
        <div className="mb-6 max-w-3xl rounded-2xl border border-gold/30 bg-accent px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-foreground">
            {category === 'semua' ? 'Filosofi Kategori' : `Makna ${categoryLabel(category)}`}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
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
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-shadow hover:shadow-card"
              >
                <button
                  onClick={() => router.push(`/templates/${t.id}`)}
                  className="relative flex h-36 items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${t.primary} 0%, ${t.secondary} 100%)` }}
                  aria-label={`Lihat preview template ${t.name}`}
                >
                  <span className="pointer-events-none absolute left-2 bottom-1 select-none text-6xl font-bold text-white/20">
                    {String(number).padStart(2, '0')}
                  </span>
                  <span className="rounded-full bg-foreground/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {categoryLabel(t.category)}
                  </span>
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-foreground/20 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-foreground/40">
                    <Eye className="h-3 w-3" aria-hidden /> Preview
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border border-foreground/5" style={{ background: t.primary }} aria-hidden />
                    <span className="h-4 w-4 rounded-full border border-foreground/5" style={{ background: t.secondary }} aria-hidden />
                    <p className="ml-1 truncate text-sm font-semibold text-foreground">{t.name}</p>
                  </div>
                  <p className="mt-1.5 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">{t.description}</p>
                  <Button onClick={() => { setSelectedTemplate({ id: t.id, name: t.name }); setNameDialogOpen(true); }} disabled={busyId !== null} className="mt-4 w-full">
                    {busyId === t.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
                    Pakai Template
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void duplicateSeed(t.id, t.name, t.category)}
                    disabled={busyId !== null}
                    className="mt-2 w-full"
                  >
                    Duplikat ke Template Saya
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={n === safePage ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPage(n)}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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

      <Dialog open={nameDialogOpen} onOpenChange={(o) => { if (!o) { setNameDialogOpen(false); setSelectedTemplate(null); } }}>
        <DialogContent className="w-full max-w-sm gap-2 p-5 sm:rounded-2xl">
          <DialogTitle className="text-base font-semibold text-foreground">Buat Undangan Baru</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Beri nama undangan Anda dari template <span className="font-medium text-foreground">{selectedTemplate?.name}</span>.
          </DialogDescription>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="cth: Perkawinan Panca & Sena"
            aria-label="Nama undangan"
            className="mt-3"
            autoFocus
          />
          {error && <p className="mt-2 text-xs text-destructive" role="alert">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setNameDialogOpen(false); setSelectedTemplate(null); }}
              disabled={busyId !== null}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => { if (selectedTemplate) startBuiltIn(selectedTemplate.id); }}
              disabled={busyId !== null}
            >
              {busyId ? <Loader2 className="mr-1 h-3 w-3 animate-spin" aria-hidden /> : null}
              Buat
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}