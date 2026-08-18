'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createServerSupabase, requireInternalUser } from '@/lib/supabase/server';
import type { TemplateDemo } from '@/lib/types';

/**
 * Metadata "Demo Template" yang diatur admin: gambar + link per template,
 * ditampilkan di landing publik. Backend-nya:
 *  - Tabel `template_demos` (migrasi 0014): RLS SELECT publik (`using true`)
 *    karena hanya kolom demo metadata; INSERT/UPDATE/DELETE hanya untuk
 *    operator (public.is_internal(), security definer dari 0010).
 *  - Server action di file ini melakukan DUA lapis proteksi: requireInternalUser()
 *    (email operator) di app + RLS is_internal() di database.
 */

/** Ubah string kosong / whitespace menjadi null (input form yang dikosongkan). */
function emptyToNull(v: unknown): unknown {
  return typeof v === 'string' && v.trim() === '' ? null : v;
}

/** Slug template = huruf kecil, angka, dan tanda hubung (contoh: elegant-gold). */
const SlugSchema = z
  .string()
  .trim()
  .min(1, 'ID template wajib diisi')
  .max(100, 'ID template terlalu panjang')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ID template harus berupa slug (huruf kecil, angka, dan tanda hubung)');

/** URL opsional: string URL valid, string kosong → null, atau null.
 *  CATATAN: zod `url()` menerima scheme apapun (file:, javascript:, dll) —
 *  reject scheme non-http(s) agar tidak lolos (lihat test keamanan). */
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

/** Skema input upsert demo template — validasi Zod di server, tidak pernah percaya client. */
export const TemplateDemoInputSchema = z.object({
  template_id: SlugSchema,
  demo_image: UrlOrNullSchema('Gambar demo'),
  demo_link: UrlOrNullSchema('Link demo')
});
export type TemplateDemoInput = z.infer<typeof TemplateDemoInputSchema>;

/**
 * Daftar metadata demo template dalam bentuk map `template_id -> TemplateDemo`.
 * Dipakai landing publik (server component) — TANPA auth: SELECT RLS anon
 * mengizinkan anon/authenticated membaca kolom demo metadata saja.
 * Bila query gagal (mis. tabel belum ada di environment lama), kembalikan {}
 * agar landing tidak ikut error — demo tanpa metadata tetap tampil normal.
 */
export async function listTemplateDemos(): Promise<Record<string, TemplateDemo>> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('template_demos')
    .select('template_id, demo_image, demo_link');

  if (error) return {};

  const map: Record<string, TemplateDemo> = {};
  for (const row of data ?? []) {
    map[row.template_id] = {
      template_id: row.template_id,
      demo_image: row.demo_image,
      demo_link: row.demo_link
    };
  }
  return map;
}

/**
 * Simpan (upsert) metadata demo template. Hanya operator internal.
 * Catatan keamanan: dua lapis — requireInternalUser() di app, dan RLS
 * INSERT/UPDATE is_internal() di database (migrasi 0014).
 */
export async function upsertTemplateDemo(input: unknown): Promise<{ error?: string }> {
  const user = await requireInternalUser();
  if (!user) return { error: 'Unauthorized' };

  const parsed = TemplateDemoInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Data demo template tidak valid' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('template_demos')
    .upsert({
      template_id: parsed.data.template_id,
      demo_image: parsed.data.demo_image,
      demo_link: parsed.data.demo_link,
      updated_at: new Date().toISOString()
    });

  if (error) return { error: error.message };

  revalidatePath('/');
  revalidatePath('/templates');
  return {};
}
