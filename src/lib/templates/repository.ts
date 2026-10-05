import type { CanvasData, TemplateMeta } from '@/lib/types';
import { DEMO_TEMPLATES, getTemplate } from '@/lib/templates';
import { listVisibleTemplates, type CustomTemplate } from '@/lib/api/custom-templates';
import { demoIsDemoMode } from '@/lib/env';

/**
 * Registry/repository template — SATU sumber kebenaran untuk katalog template.
 * Menggabungkan template seed (bundel `templates/*.json`) dengan template kustom
 * yang tayang di DB (`custom_templates`), lalu menormalkannya ke bentuk seragam
 * agar konsumen (landing, dashboard) tidak perlu tahu asalnya.
 */

export type TemplateSource = 'seed' | 'custom';

/** Metadata ternormalisasi; menambah penanda asal tanpa menghilangkan kontrak TemplateMeta. */
export interface TemplateRegistryMeta extends TemplateMeta {
  /** true bila template dibuat pengguna (kustom). */
  isCustom?: boolean;
  /** Urutan tampil di landing (khusus kustom). */
  sort_order?: number;
  /** Status tayang di landing (khusus kustom). */
  visible?: boolean;
  /** Waktu dibuat ISO (khusus kustom). */
  created_at?: string;
}

/** Satu item template yang sudah dinormalkan dari seed maupun kustom. */
export interface TemplateRegistryItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  primary?: string;
  secondary?: string;
  canvas: CanvasData;
  source: TemplateSource;
  meta: TemplateRegistryMeta;
}

const DEFAULT_CUSTOM_CATEGORY = 'Template Saya';
const FALLBACK_PRIMARY = '#c9a45c';
const FALLBACK_SECONDARY = '#d9a7a4';

/** Normalkan satu metadata seed menjadi item registry (null bila canvas tak ada). */
export function normalizeSeedTemplate(meta: TemplateMeta): TemplateRegistryItem | null {
  const canvas = getTemplate(meta.id);
  if (!canvas) return null;
  return {
    id: meta.id,
    name: meta.name,
    category: meta.category,
    description: meta.description,
    primary: meta.primary,
    secondary: meta.secondary,
    canvas,
    source: 'seed',
    meta
  };
}

/** Normalkan satu baris kustom DB menjadi item registry. */
export function normalizeCustomTemplate(row: CustomTemplate): TemplateRegistryItem {
  const category = row.category?.trim() || DEFAULT_CUSTOM_CATEGORY;
  const theme = row.canvas_data?.theme;
  const primary = theme?.primary || FALLBACK_PRIMARY;
  const secondary = theme?.secondary || FALLBACK_SECONDARY;
  const description = 'Template buatan sendiri';
  return {
    id: row.id,
    name: row.name,
    category,
    description,
    primary,
    secondary,
    canvas: row.canvas_data,
    source: 'custom',
    meta: {
      id: row.id,
      name: row.name,
      category,
      description,
      primary,
      secondary,
      isCustom: true,
      sort_order: row.sort_order,
      visible: row.visible,
      created_at: row.created_at
    }
  };
}

/** Semua template seed (canvas tersedia), urut sesuai DEMO_TEMPLATES (demo_order). */
export function listSeedTemplates(): TemplateRegistryItem[] {
  return DEMO_TEMPLATES.map(normalizeSeedTemplate).filter(
    (item): item is TemplateRegistryItem => item !== null
  );
}

/** Ambil template seed berdasarkan id; null bila bukan seed/tak ada. */
export function getSeedTemplateById(id: string): TemplateRegistryItem | null {
  const meta = DEMO_TEMPLATES.find((t) => t.id === id);
  return meta ? normalizeSeedTemplate(meta) : null;
}

/**
 * Daftar template publik: seed + kustom DB (hanya yang visible).
 * Selalu aman: bila DB gagal / demo mode, lanjut dengan seed saja.
 */
export async function listPublicTemplates(): Promise<TemplateRegistryItem[]> {
  const seed = listSeedTemplates();
  if (demoIsDemoMode()) return seed;

  try {
    const rows = await listVisibleTemplates();
    return [...seed, ...rows.map(normalizeCustomTemplate)];
  } catch {
    return seed;
  }
}

/**
 * Ambil satu template by id: cek seed lebih dulu, lalu kustom DB.
 * Mengembalikan null bila tak ditemukan (fallback aman, tidak melempar).
 */
export async function getTemplateById(id: string): Promise<TemplateRegistryItem | null> {
  const seed = getSeedTemplateById(id);
  if (seed) return seed;
  if (demoIsDemoMode()) return null;

  try {
    const rows = await listVisibleTemplates();
    const row = rows.find((r) => r.id === id);
    return row ? normalizeCustomTemplate(row) : null;
  } catch {
    return null;
  }
}
