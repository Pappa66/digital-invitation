import type { CanvasData, TemplateMeta } from '@/lib/types';
import type { PuckData } from '@/lib/canvas/puck-format';
import { PUCK_TEMPLATES, PUCK_TEMPLATE_LIST, getPuckTemplate } from '@/lib/templates/puck';

/**
 * Registri template — SEkarang bersumber dari template Puck
 * (`src/lib/templates/puck.ts`). Template lama (CanvasData) sudah dihapus.
 */

export const TEMPLATE_LIST: TemplateMeta[] = PUCK_TEMPLATE_LIST.map((t) => ({
  id: t.id,
  name: t.name,
  category: t.category,
  description: t.description,
  primary: t.primary,
  secondary: t.secondary,
  show_as_demo: true
}));

/** Semua template sebagai demo (urutan katalog). */
export const DEMO_TEMPLATES: TemplateMeta[] = TEMPLATE_LIST;

const THEME_BY_ID: Record<string, { background: string; fontHeading: string; fontBody: string; text: string }> = Object.fromEntries(
  PUCK_TEMPLATES.map((t) => {
    const p = t.data.root.props;
    return [
      t.id,
      {
        background: p?.background ?? '#FBF7F1',
        text: p?.text ?? '#4A4036',
        fontHeading: p?.fontHeading ?? 'Cormorant Garamond',
        fontBody: p?.fontBody ?? 'Jost'
      }
    ];
  })
);

/** Info tema ringkas untuk kartu/preview landing tanpa mengurai canvas. */
export function getTemplateTheme(id: string) {
  return THEME_BY_ID[id] ?? { background: '#FBF7F1', text: '#4A4036', fontHeading: 'Cormorant Garamond', fontBody: 'Jost' };
}

/** Mengambil template (format Puck) — clone deep agar aman dimutasi. */
export function getTemplate(id: string): PuckData | null {
  return getPuckTemplate(id);
}

/**
 * Preset desain untuk panel (legacy builder). Dipetakan ke bentuk tema lama.
 * @deprecated dipakai hanya oleh builder lama.
 */
export function getDesignPresets(): { id: string; name: string; theme: CanvasData['theme'] }[] {
  return PUCK_TEMPLATE_LIST.map((t) => {
    const th = getTemplateTheme(t.id);
    return {
      id: t.id,
      name: t.name,
      theme: {
        primary: t.primary,
        secondary: t.secondary,
        background: th.background,
        text: th.text,
        font_heading: th.fontHeading,
        font_body: th.fontBody,
        layout: 'center' as const,
        hero_style: 'image' as const,
        ornament: ''
      }
    };
  });
}

/** CanvasData kosong (format lama) — hanya untuk jalur legacy/demo internal. */
export function emptyCanvas(): CanvasData {
  return {
    theme: {
      primary: '#BFA06A',
      secondary: '#D9A7A4',
      background: '#FBF7F1',
      text: '#4A4036',
      font_heading: 'Cormorant Garamond',
      font_body: 'Jost',
      layout: 'center',
      hero_style: 'image',
      ornament: 'gardenia-wreath'
    },
    settings: {
      music_url: '',
      guest_book_enabled: false,
      religion: 'islam',
      music_autoplay: true,
      music_offset_sec: 0,
      music_on_section: ''
    },
    blocks: [],
    flow: 'stack'
  };
}

/** Tema romantis klasik (default) — emas antique + dusty rose + ivory. */
export function romanticClassicTheme() {
  return {
    primary: '#BFA06A',
    secondary: '#D9A7A4',
    background: '#FBF7F1',
    text: '#4A4036',
    font_heading: 'Cormorant Garamond',
    font_body: 'Jost',
    layout: 'center' as const,
    hero_style: 'image' as const,
    ornament: 'gardenia-wreath',
    cover_style: 'floral' as const
  };
}

/** Tema vintage 80s–90s — krem sepuh + aksen teal/cokelat, buka ala TV jadul. */
export function vintage80sTheme() {
  return {
    primary: '#C98A3E',
    secondary: '#5E8B7E',
    background: '#F3E9D2',
    text: '#3A2E22',
    font_heading: 'Cormorant Garamond',
    font_body: 'Jost',
    layout: 'center' as const,
    hero_style: 'image' as const,
    ornament: 'newspaper-rule',
    cover_style: 'oldtv' as const
  };
}

/** Tema koran lama — monokrom krem, buka ala koran. */
export function vintageNewsprintTheme() {
  return {
    primary: '#8A7A66',
    secondary: '#B7A98F',
    background: '#EFE7D6',
    text: '#2C2419',
    font_heading: 'Cormorant Garamond',
    font_body: 'Jost',
    layout: 'center' as const,
    hero_style: 'solid' as const,
    ornament: 'newspaper-rule',
    cover_style: 'newspaper' as const
  };
}

/** Daftar preset tema siap pakai (tombol di builder lama). */
export const PRESET_THEMES = [
  { key: 'romantic', label: 'Romantis Klasik', theme: romanticClassicTheme() },
  { key: 'vintage80s', label: 'Vintage 80s–90s', theme: vintage80sTheme() },
  { key: 'newsprint', label: 'Koran Lama', theme: vintageNewsprintTheme() }
];
