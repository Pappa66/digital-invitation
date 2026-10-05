'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Copy, Loader2, Pencil, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { emptyCanvas } from '@/lib/templates';
import {
  listMyTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type CustomTemplate
} from '@/lib/api/custom-templates';
import { clientCreateProjectFromData } from '@/lib/api/project-client';
import { userTemplatesList } from '@/lib/demo/user-templates';
import { CATEGORIES } from '@/lib/template-categories';
import TemplatePreview from '@/components/landing/template-preview';
import ConfirmDialog from '@/components/dashboard/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DashboardSkeleton } from '@/components/ui/skeleton';
import type { CanvasData } from '@/lib/types';

interface ProjectLite {
  id: string;
  title: string;
}

type SortBy = 'newest' | 'name';

const DEFAULT_CATEGORY = CATEGORIES[0]?.key ?? 'classic';

/** Label kategori yang aman: key CATEGORIES → label, selain itu tampilkan apa adanya. */
function displayCategory(category: string | null | undefined): string {
  if (!category) return 'Template Saya';
  const found = CATEGORIES.find((c) => c.key === category.toLowerCase());
  return found ? found.label : category;
}

/** Manajemen template kustom (DB): buat dari undangan, ubah, sembunyikan, duplikat, hapus. */
export default function TemplateManager() {
  const router = useRouter();
  const [items, setItems] = useState<CustomTemplate[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [fromProject, setFromProject] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<string>(DEFAULT_CATEGORY);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [deleteTarget, setDeleteTarget] = useState<CustomTemplate | null>(null);
  const [localCount, setLocalCount] = useState(0);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await listMyTemplates());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    setLocalCount(userTemplatesList().length);
    void (async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, title')
        .order('updated_at', { ascending: false });
      setProjects((data ?? []) as ProjectLite[]);
    })();
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((t) => `${t.name} ${t.category ?? ''}`.toLowerCase().includes(q))
      : items;
    const sorted = [...filtered];
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    else sorted.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return sorted;
  }, [items, query, sortBy]);

  /** Opsi kategori: key standar + nilai lama yang belum termasuk key (jaga data). */
  const knownKeys = useMemo(() => new Set<string>(CATEGORIES.map((c) => c.key)), []);
  const legacyCategory = editCategory && !knownKeys.has(editCategory) ? editCategory : null;

  async function createFromProject() {
    if (!fromProject) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const { data } = await supabase
        .from('project_designs')
        .select('canvas_data')
        .eq('project_id', fromProject)
        .maybeSingle();
      const canvas = data?.canvas_data as unknown as CanvasData | undefined;
      if (!canvas) {
        setError('Undangan itu belum punya desain.');
        return;
      }
      const proj = projects.find((p) => p.id === fromProject);
      const res = await createTemplate({ name: proj?.title || 'Template Baru', canvas });
      if (res.error) setError(res.error);
      else setFromProject('');
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function applyTemplate(t: CustomTemplate) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await clientCreateProjectFromData(t.name, t.canvas_data);
      if (res.error || !res.id) {
        setError(res.error ?? 'Gagal membuat undangan dari template.');
        return;
      }
      router.push(`/builder/${res.id}`);
    } finally {
      setBusy(false);
    }
  }

  async function createBlank() {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await createTemplate({ name: 'Template Baru', canvas: emptyCanvas() });
      if (res.error) setError(res.error);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function duplicateTemplate(t: CustomTemplate) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const res = await createTemplate({
        name: `${t.name} (Salinan)`,
        category: t.category ?? undefined,
        canvas: t.canvas_data,
        visible: false
      });
      if (res.error) setError(res.error);
      else setNotice(`Template "${t.name}" diduplikat.`);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  /** Impor template dari localStorage ("Template Saya") ke DB. Tidak menghapus localStorage. */
  async function importLocalTemplates() {
    const locals = userTemplatesList();
    if (locals.length === 0) {
      setNotice('Tidak ada template lokal untuk diimpor.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    let imported = 0;
    const failed: string[] = [];
    try {
      for (const t of locals) {
        const res = await createTemplate({
          name: t.name,
          category: t.category,
          canvas: t.canvas,
          visible: false
        });
        if (res.error) failed.push(t.name);
        else imported += 1;
      }
      await refresh();
      if (failed.length > 0) {
        setError(`${imported} template lokal diimpor, ${failed.length} gagal (${failed.join(', ')}).`);
      } else {
        setNotice(`${imported} template lokal berhasil diimpor ke database.`);
      }
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(t: CustomTemplate, visible: boolean) {
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, visible } : x)));
    await updateTemplate(t.id, { visible });
  }

  function requestRemove(t: CustomTemplate) {
    setDeleteTarget(t);
  }

  async function confirmRemove() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setBusy(true);
    setItems((prev) => prev.filter((x) => x.id !== id));
    setDeleteTarget(null);
    try {
      await deleteTemplate(id);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(t: CustomTemplate) {
    setEditing(t.id);
    setEditName(t.name);
    setEditCategory(t.category || DEFAULT_CATEGORY);
  }

  async function saveEdit(id: string) {
    const name = editName.trim() || 'Template Baru';
    const category = editCategory || DEFAULT_CATEGORY;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name, category } : x)));
    setEditing(null);
    await updateTemplate(id, { name, category });
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Manajemen Template</h3>
          <p className="text-xs text-muted-foreground">Buat dari undangan, ubah, atur tampil, duplikat, atau hapus.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void importLocalTemplates()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />} Impor Template Lokal
            {localCount > 0 ? ` (${localCount})` : ''}
          </Button>
          <Button variant="outline" size="sm" onClick={() => void createBlank()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} Template Kosong
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={fromProject}
          onChange={(e) => setFromProject(e.target.value)}
          aria-label="Pilih undangan untuk dijadikan template"
          className="h-9 flex-1 rounded-md border border-input bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Pilih undangan untuk dijadikan template…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={() => void createFromProject()} disabled={busy || !fromProject}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Plus className="h-4 w-4" aria-hidden />} Buat dari Undangan
        </Button>
      </div>

      {/* Notifikasi error/sukses diumumkan ke screen reader. */}
      <div aria-live="polite" role="status" className="mt-2 min-h-4 text-xs">
        {error ? (
          <span className="text-destructive">{error}</span>
        ) : notice ? (
          <span className="text-emerald-700">{notice}</span>
        ) : null}
      </div>

      {items.length > 0 && !loading && (
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari template..."
              aria-label="Cari template"
              className="h-9 pl-9 text-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label="Urutkan template"
            className="h-9 rounded-md border border-input bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Terbaru</option>
            <option value="name">Nama (A–Z)</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="mt-4" aria-busy="true">
          <DashboardSkeleton />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">Belum ada template kustom.</p>
      ) : filteredItems.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">Tidak ada template yang cocok dengan pencarian.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((t) => (
            <div key={t.id} className="rounded-2xl border border-border bg-card p-3 shadow-soft">
              <div className="mb-3 aspect-[3/4] overflow-hidden rounded-lg border border-border bg-muted">
                <TemplatePreview canvas={t.canvas_data} bg={t.canvas_data.theme.background} />
              </div>
              {editing === t.id ? (
                <div className="space-y-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nama" className="h-8 text-sm" aria-label="Nama template" />
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    aria-label="Kategori template"
                    className="h-8 w-full rounded-md border border-input bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {legacyCategory && <option value={legacyCategory}>{legacyCategory}</option>}
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void saveEdit(t.id)}>
                      <Check className="h-3.5 w-3.5" aria-hidden /> Simpan
                    </Button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      aria-label="Batal ubah"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">{displayCategory(t.category)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-2.5 text-[11px] font-medium text-muted-foreground">
                      <Switch
                        checked={t.visible}
                        onCheckedChange={(v) => void toggleVisible(t, v)}
                        aria-label={`Tampil di landing: ${t.name}`}
                        className="data-[state=checked]:bg-gold-strong"
                      />
                      {t.visible ? 'Tampil di Landing' : 'Disembunyikan'}
                    </label>
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Ubah"
                      title="Ubah nama/kategori"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void duplicateTemplate(t)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Duplikat"
                      title="Duplikat template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void applyTemplate(t)}
                      className="inline-flex min-h-11 items-center rounded-md border border-gold/40 bg-gold/5 px-3 text-[11px] font-medium text-gold-deep transition-colors hover:bg-gold/10"
                      title="Buat undangan dari template ini"
                    >
                      Pakai
                    </button>
                    <button
                      type="button"
                      onClick={() => requestRemove(t)}
                      className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-md border border-destructive/30 text-destructive transition-colors hover:bg-destructive/10"
                      aria-label="Hapus"
                      title="Hapus template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus template?"
        message={
          deleteTarget
            ? `Template "${deleteTarget.name}" akan dihapus. Undangan asli tidak ikut terhapus.`
            : 'Template akan dihapus. Undangan asli tidak ikut terhapus.'
        }
        confirmLabel="Hapus"
        danger
        busy={busy}
        onConfirm={() => void confirmRemove()}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  );
}
