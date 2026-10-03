'use client';

import { useEffect, useState } from 'react';
import { Check, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { emptyCanvas } from '@/lib/templates';
import {
  listMyTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type CustomTemplate
} from '@/lib/api/custom-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CanvasData } from '@/lib/types';

interface ProjectLite {
  id: string;
  title: string;
}

/** Manajemen template kustom (DB): buat dari undangan, ubah, sembunyikan, hapus. */
export default function TemplateManager() {
  const [items, setItems] = useState<CustomTemplate[]>([]);
  const [projects, setProjects] = useState<ProjectLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fromProject, setFromProject] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');

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
    void (async () => {
      const { data } = await supabase
        .from('projects')
        .select('id, title')
        .order('updated_at', { ascending: false });
      setProjects((data ?? []) as ProjectLite[]);
    })();
  }, []);

  async function createFromProject() {
    if (!fromProject) return;
    setBusy(true);
    setError('');
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

  async function createBlank() {
    setBusy(true);
    setError('');
    try {
      const res = await createTemplate({ name: 'Template Baru', canvas: emptyCanvas() });
      if (res.error) setError(res.error);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisible(t: CustomTemplate) {
    setItems((prev) => prev.map((x) => (x.id === t.id ? { ...x, visible: !t.visible } : x)));
    await updateTemplate(t.id, { visible: !t.visible });
  }

  async function remove(id: string) {
    if (!confirm('Hapus template ini? Undangan asli tidak terhapus.')) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    await deleteTemplate(id);
  }

  function startEdit(t: CustomTemplate) {
    setEditing(t.id);
    setEditName(t.name);
    setEditCategory(t.category ?? 'Template Saya');
  }

  async function saveEdit(id: string) {
    const name = editName.trim() || 'Template Baru';
    const category = editCategory.trim() || 'Template Saya';
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, name, category } : x)));
    setEditing(null);
    await updateTemplate(id, { name, category });
  }

  return (
    <section className="mb-8 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Manajemen Template</h3>
          <p className="text-xs text-gray-500">Buat dari undangan, ubah, atur tampil, atau hapus.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void createBlank()} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Template Kosong
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <select
          value={fromProject}
          onChange={(e) => setFromProject(e.target.value)}
          className="h-9 flex-1 rounded-md border border-gray-300 bg-white px-2 text-sm"
        >
          <option value="">Pilih undangan untuk dijadikan template…</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        <Button size="sm" onClick={() => void createFromProject()} disabled={busy || !fromProject}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Buat dari Undangan
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {loading ? (
        <p className="mt-4 text-xs text-gray-400">Memuat template…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-xs text-gray-400">Belum ada template kustom.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t) => (
            <div key={t.id} className="rounded-lg border border-gray-200 p-3">
              {editing === t.id ? (
                <div className="space-y-2">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Nama" className="h-8 text-sm" />
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="Kategori"
                    className="h-8 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void saveEdit(t.id)}>
                      <Check className="h-3.5 w-3.5" /> Simpan
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="truncate text-[11px] text-gray-500">{t.category || 'Template Saya'}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        t.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {t.visible ? 'Tampil' : 'Disembunyikan'}
                    </span>
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => startEdit(t)}
                      className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
                      aria-label="Ubah"
                      title="Ubah nama/kategori"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void toggleVisible(t)}
                      className="rounded-md border border-gray-300 p-1.5 text-gray-600 hover:bg-gray-50"
                      aria-label="Atur tampil"
                      title={t.visible ? 'Sembunyikan dari landing' : 'Tampilkan di landing'}
                    >
                      {t.visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(t.id)}
                      className="ml-auto rounded-md border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                      aria-label="Hapus"
                      title="Hapus template"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
