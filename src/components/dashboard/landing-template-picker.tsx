'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import {
  getLandingContent,
  saveLandingContent,
  type LandingContent
} from '@/lib/settings';
import { DEMO_TEMPLATES } from '@/lib/templates';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { DashboardSkeleton } from '@/components/ui/skeleton';

/**
 * Kontrol "Template yang Tampil di Landing" — dipindahkan dari landing-admin
 * agar CRUD template + pengaturan tampil berada di satu halaman (/templates).
 * Menyimpan ke `settings.landing_content` dengan field: template_ids, only_custom.
 */
export default function LandingTemplatePicker() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const PER = 10;

  useEffect(() => {
    let alive = true;
    getLandingContent()
      .then((c) => {
        if (alive) setContent(c);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : 'Gagal memuat konten landing.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  function toggleTemplate(id: string, on: boolean) {
    setContent((c) => {
      if (!c) return c;
      const cur = c.template_ids ?? [];
      const next = on ? Array.from(new Set([...cur, id])) : cur.filter((x) => x !== id);
      return { ...c, template_ids: next };
    });
  }

  function setOnlyCustom(on: boolean) {
    setContent((c) => (c ? { ...c, only_custom: on } : c));
  }

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const res = await saveLandingContent(content);
      if (res.ok) setNotice('Pengaturan template landing disimpan.');
      else setError(res.error ?? 'Gagal menyimpan.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Template yang Tampil di Landing</h3>
          <p className="text-xs text-muted-foreground">
            Pilih template bawaan yang muncul di katalog publik. Kosong = semua template bawaan tampil.
          </p>
        </div>
        <Button size="sm" onClick={() => void handleSave()} disabled={saving || loading || !content}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          Simpan
        </Button>
      </div>

      {/* Notifikasi diumumkan ke screen reader. */}
      <div aria-live="polite" role="status" className="mt-2 min-h-4 text-xs">
        {error ? (
          <span className="text-destructive" role="alert">{error}</span>
        ) : notice ? (
          <span className="text-emerald-700">{notice}</span>
        ) : null}
      </div>

      {loading || !content ? (
        <div className="mt-4" aria-busy="true">
          <DashboardSkeleton />
        </div>
      ) : (
        <>
          <label className="mb-3 flex min-h-11 items-center gap-2 rounded-md border border-input px-3 py-2 text-xs">
            <Switch
              checked={!!content.only_custom}
              onCheckedChange={setOnlyCustom}
              aria-label="Hanya tampilkan template buatan sendiri"
            />
            <span>Hanya tampilkan template buatan sendiri (sembunyikan template bawaan)</span>
          </label>

          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Cari template bawaan…"
            aria-label="Cari template bawaan"
            className="mb-2 h-9 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="max-h-80 overflow-y-auto rounded-md border border-border p-2">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_TEMPLATES.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase())).slice((page - 1) * PER, page * PER).map((t) => {
              const checked = (content.template_ids ?? []).includes(t.id);
              return (
                <div
                  key={t.id}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-md border border-input px-3 py-2 text-xs"
                >
                  <span className="min-w-0 truncate text-foreground">{t.name}</span>
                  <Switch
                    checked={checked}
                    onCheckedChange={(v) => toggleTemplate(t.id, v)}
                    aria-label={`Tampilkan ${t.name} di landing`}
                  />
                </div>
              );
            })}
          </div>
          </div>
          {(() => {
            const total = DEMO_TEMPLATES.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase())).length;
            const pages = Math.max(1, Math.ceil(total / PER));
            if (pages <= 1) return null;
            return (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex h-9 items-center rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40"
                >
                  Sebelumnya
                </button>
                <span className="text-xs text-muted-foreground">Halaman {page} dari {pages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="inline-flex h-9 items-center rounded-md border border-input px-3 text-xs font-medium text-foreground disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            );
          })()}
        </>
      )}
    </section>
  );
}
