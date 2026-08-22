import type { CanvasData, TemplateMeta } from '@/lib/types';

import elegantGold from '../../../templates/elegant-gold.json';
import rusticGarden from '../../../templates/rustic-garden.json';
import baliTropical from '../../../templates/bali-tropical.json';
import minimalMono from '../../../templates/minimal-mono.json';
import blushRomance from '../../../templates/blush-romance.json';
import navyClassic from '../../../templates/navy-classic.json';
import bohoEarth from '../../../templates/boho-earth.json';
import forestCeladon from '../../../templates/forest-celadon.json';
import pastelDream from '../../../templates/pastel-dream.json';
import modernDark from '../../../templates/modern-dark.json';
import emeraldKhaki from '../../../templates/emerald-khaki.json';
import violetDusk from '../../../templates/violet-dusk.json';
import terracottaSun from '../../../templates/terracotta-sun.json';
import midnightOcean from '../../../templates/midnight-ocean.json';
import goldenSakura from '../../../templates/golden-sakura.json';
import platinumLuxe from '../../../templates/platinum-luxe.json';
import roseGarden from '../../../templates/rose-garden.json';
import autumnMaple from '../../../templates/autumn-maple.json';
import mintFresh from '../../../templates/mint-fresh.json';
import burgundyClassic from '../../../templates/burgundy-classic.json';
import pearlWhite from '../../../templates/pearl-white.json';
import tropicalSunset from '../../../templates/tropical-sunset.json';
import lavenderDream from '../../../templates/lavender-dream.json';
import coffeeCream from '../../../templates/coffee-cream.json';
import emeraldMist from '../../../templates/emerald-mist.json';
import moonlightSilver from '../../../templates/moonlight-silver.json';
import coralBlush from '../../../templates/coral-blush.json';
import forestEvergreen from '../../../templates/forest-evergreen.json';
import sunshineCitrus from '../../../templates/sunshine-citrus.json';
import glacierBlue from '../../../templates/glacier-blue.json';
import ivoryDawn from '../../../templates/ivory-dawn.json';
import sapphireNight from '../../../templates/sapphire-night.json';
import obsidianNoir from '../../../templates/obsidian-noir.json';
import steelBlueprint from '../../../templates/steel-blueprint.json';
import duneHorizon from '../../../templates/dune-horizon.json';
import mauveReverie from '../../../templates/mauve-reverie.json';
import simpleRustic from '../../../templates/simple-rustic.json';
import serene from '../../../templates/serene.json';
import photovita from '../../../templates/photovita.json';
import darkLuxe from '../../../templates/dark-luxe.json';
import gardenRomantic from '../../../templates/garden-romantic.json';
import modernMinimal from '../../../templates/modern-minimal.json';
import blushDream from '../../../templates/blush-dream.json';
import templateIndex from '../../../templates/index.json';

export const TEMPLATE_LIST: TemplateMeta[] = templateIndex as TemplateMeta[];

/** All templates as demo, sorted by demo_order (then name). */
export const DEMO_TEMPLATES: TemplateMeta[] = (templateIndex as TemplateMeta[])
  .sort((a, b) => (a.demo_order ?? 999) - (b.demo_order ?? 999) || a.name.localeCompare(b.name));

const RAW_TEMPLATES: Record<string, CanvasData> = {
  'elegant-gold': elegantGold as unknown as CanvasData,
  'rustic-garden': rusticGarden as unknown as CanvasData,
  'bali-tropical': baliTropical as unknown as CanvasData,
  'minimal-mono': minimalMono as unknown as CanvasData,
  'blush-romance': blushRomance as unknown as CanvasData,
  'navy-classic': navyClassic as unknown as CanvasData,
  'boho-earth': bohoEarth as unknown as CanvasData,
  'forest-celadon': forestCeladon as unknown as CanvasData,
  'pastel-dream': pastelDream as unknown as CanvasData,
  'modern-dark': modernDark as unknown as CanvasData,
  'emerald-khaki': emeraldKhaki as unknown as CanvasData,
  'violet-dusk': violetDusk as unknown as CanvasData,
  'terracotta-sun': terracottaSun as unknown as CanvasData,
  'midnight-ocean': midnightOcean as unknown as CanvasData,
  'golden-sakura': goldenSakura as unknown as CanvasData,
  'platinum-luxe': platinumLuxe as unknown as CanvasData,
  'rose-garden': roseGarden as unknown as CanvasData,
  'autumn-maple': autumnMaple as unknown as CanvasData,
  'mint-fresh': mintFresh as unknown as CanvasData,
  'burgundy-classic': burgundyClassic as unknown as CanvasData,
  'pearl-white': pearlWhite as unknown as CanvasData,
  'tropical-sunset': tropicalSunset as unknown as CanvasData,
  'lavender-dream': lavenderDream as unknown as CanvasData,
  'coffee-cream': coffeeCream as unknown as CanvasData,
  'emerald-mist': emeraldMist as unknown as CanvasData,
  'moonlight-silver': moonlightSilver as unknown as CanvasData,
  'coral-blush': coralBlush as unknown as CanvasData,
  'forest-evergreen': forestEvergreen as unknown as CanvasData,
  'sunshine-citrus': sunshineCitrus as unknown as CanvasData,
  'glacier-blue': glacierBlue as unknown as CanvasData,
  'ivory-dawn': ivoryDawn as unknown as CanvasData,
  'sapphire-night': sapphireNight as unknown as CanvasData,
  'obsidian-noir': obsidianNoir as unknown as CanvasData,
  'steel-blueprint': steelBlueprint as unknown as CanvasData,
  'dune-horizon': duneHorizon as unknown as CanvasData,
  'mauve-reverie': mauveReverie as unknown as CanvasData,
  'simple-rustic': simpleRustic as unknown as CanvasData,
  'serene': serene as unknown as CanvasData,
  'photovita': photovita as unknown as CanvasData,
  'dark-luxe': darkLuxe as unknown as CanvasData,
  'garden-romantic': gardenRomantic as unknown as CanvasData,
  'modern-minimal': modernMinimal as unknown as CanvasData,
  'blush-dream': blushDream as unknown as CanvasData
};

/**
 * Mengambil template berdasarkan id. Berguna saat "Start from Template".
 * Mengembalikan clone deep agar state reducer tidak mengubah template asli.
 */
/**
 * Gaya bingkai dekoratif default per template (nilai Theme.frame).
 * Template di luar map memakai fallback 'double' supaya semua terlihat rapi.
 */
const TEMPLATE_FRAMES: Record<string, string> = {
  'elegant-gold': 'double',
  'rustic-garden': 'arch',
  'bali-tropical': 'corner',
  'minimal-mono': 'none',
  'blush-romance': 'classic',
  'navy-classic': 'double',
  'boho-earth': 'corner',
  'forest-celadon': 'arch',
  'pastel-dream': 'classic',
  'modern-dark': 'none',
  'emerald-khaki': 'double',
  'violet-dusk': 'classic',
  'terracotta-sun': 'corner',
  'midnight-ocean': 'double',
  'golden-sakura': 'corner',
  'platinum-luxe': 'none',
  'rose-garden': 'arch',
  'autumn-maple': 'corner',
  'mint-fresh': 'classic',
  'burgundy-classic': 'double',
  'pearl-white': 'classic',
  'tropical-sunset': 'corner',
  'lavender-dream': 'classic',
  'coffee-cream': 'double',
  'emerald-mist': 'arch',
  'moonlight-silver': 'none',
  'coral-blush': 'classic',
  'forest-evergreen': 'arch',
  'sunshine-citrus': 'classic',
  'glacier-blue': 'double',
  'ivory-dawn': 'classic',
  'sapphire-night': 'double',
  'obsidian-noir': 'double',
  'steel-blueprint': 'none',
  'dune-horizon': 'corner',
  'mauve-reverie': 'arch'
};

/** Gaya bingkai default utk template card-style baru. */
TEMPLATE_FRAMES['simple-rustic'] = 'double';
TEMPLATE_FRAMES['serene'] = 'arch';
TEMPLATE_FRAMES['photovita'] = 'none';
TEMPLATE_FRAMES['dark-luxe'] = 'none';
TEMPLATE_FRAMES['garden-romantic'] = 'arch';
TEMPLATE_FRAMES['modern-minimal'] = 'none';
TEMPLATE_FRAMES['blush-dream'] = 'classic';

export function getTemplate(id: string): CanvasData | null {
  const tpl = RAW_TEMPLATES[id];
  if (!tpl) return null;
  // Return a shallow clone with frame override — avoid structuredClone for performance.
  // Callers that mutate the result should clone deeply themselves.
  const clone = { ...tpl, theme: { ...tpl.theme, frame: TEMPLATE_FRAMES[id] ?? 'double' } };
  return clone;
}

/**
 * Preset desain untuk panel builder: ONE preset per template (39 total),
 * berisi tema warna/font + ornamen + bingkai + card style.
 * Dipakai menampilkan semua template sebagai preset, bukan hanya 10 hardcoded.
 */
export function getDesignPresets(): { id: string; name: string; theme: CanvasData['theme'] }[] {
  return TEMPLATE_LIST.map((t) => {
    const tpl = getTemplate(t.id);
    if (!tpl) return null;
    return {
      id: t.id,
      name: t.name,
      theme: tpl.theme
    };
  }).filter((p): p is { id: string; name: string; theme: CanvasData['theme'] } => p !== null);
}

/** Mengembalikan canvas_data kosong dengan theme default (Romantis Klasik). */
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
    cover_style: 'floral' as const,
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
    cover_style: 'oldtv' as const,
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
    cover_style: 'newspaper' as const,
  };
}

/** Daftar preset tema siap pakai (tombol di builder). */
export const PRESET_THEMES = [
  { key: 'romantic', label: 'Romantis Klasik', theme: romanticClassicTheme() },
  { key: 'vintage80s', label: 'Vintage 80s–90s', theme: vintage80sTheme() },
  { key: 'newsprint', label: 'Koran Lama', theme: vintageNewsprintTheme() }
];