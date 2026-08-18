'use client';

import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';

/** Baris tabel `template_demos` (backend): gambar demo + link demo per template. */
export interface TemplateDemo {
  template_id: string;
  demo_image: string | null;
  demo_link: string | null;
}

/** Bentuk query builder yang kita butuhkan (tabel di luar types supabase). */
type TemplateDemoQuery = {
  select: (columns?: string) => Promise<{
    data: TemplateDemo[] | null;
    error: { message: string } | null;
  }>;
};

/**
 * Ambil daftar demo (demo_image + demo_link) untuk katalog landing.
 * - Mode real: query Supabase client ke tabel `template_demos` (RLS: select anon).
 * - Mode demo (NEXT_PUBLIC_DEMO_MODE=true): fallback kosong — demo-store tidak
 *   menyimpan data demo per template, jadi katalog memakai TemplatePreview.
 */
export async function listTemplateDemos(): Promise<TemplateDemo[]> {
  if (demoIsDemoMode()) return [];
  try {
    const q = supabase.from('template_demos') as unknown as TemplateDemoQuery;
    const { data, error } = await q.select('template_id, demo_image, demo_link');
    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

/** Demo milik satu template id (atau null bila tidak ada baris). */
export function demoByTemplateId(demos: TemplateDemo[], templateId: string): TemplateDemo | null {
  return demos.find((d) => d.template_id === templateId) ?? null;
}

// ---------------------------------------------------------------
// Upsert (admin/operator) — jalur supabase client dengan sesi login.
// Keamanan: boleh dipanggil dari client HANYA karena RLS INSERT/UPDATE
// tabel `template_demos` (migrasi 0014) mensyaratkan public.is_internal()
// (operator). Client anon/authenticated non-operator ditolak database.
// Validasi Zod tetap dilakukan di client sebagai lapisan pertama; jalur
// server (server action) mengulang validasi yang sama di
// `src/lib/actions/template-demo-actions.ts`.
// ---------------------------------------------------------------

/** Ubah string kosong / whitespace menjadi null (input form yang dikosongkan). */
function emptyToNull(v: unknown): unknown {
  return typeof v === 'string' && v.trim() === '' ? null : v;
}

const SlugSchema = z
  .string()
  .trim()
  .min(1, 'ID template wajib diisi')
  .max(100, 'ID template terlalu panjang')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ID template harus berupa slug (huruf kecil, angka, dan tanda hubung)');

const UrlOrNullSchema = (label: string) =>
  z.preprocess(
    emptyToNull,
    z.union([
      z
        .string()
        .trim()
        .url(`${label} harus URL valid`)
        .max(1000, `${label} terlalu panjang`)
        .refine((v) => /^https?:\/\//i.test(v), `${label} harus URL http:// atau https://`),
      z.null()
    ])
  );

const TemplateDemoClientInputSchema = z.object({
  template_id: SlugSchema,
  demo_image: UrlOrNullSchema('Gambar demo'),
  demo_link: UrlOrNullSchema('Link demo')
});

/** Upsert metadata demo template lewat supabase client (session operator). */
export async function upsertTemplateDemoClient(input: unknown): Promise<{ error?: string }> {
  const parsed = TemplateDemoClientInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data demo template tidak valid' };
  }

  try {
    const { error } = await supabase.from('template_demos').upsert({
      template_id: parsed.data.template_id,
      demo_image: parsed.data.demo_image,
      demo_link: parsed.data.demo_link,
      updated_at: new Date().toISOString()
    });

    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Gagal menyimpan demo template' };
  }
}