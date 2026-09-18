/** Preset sticker PNG/SVG transparan — taruh file di `public/stickers/`. */
export interface StickerPreset {
  id: string;
  label: string;
  /** Path publik atau URL Supabase Storage. */
  url: string;
  /** Lebar default saat disisipkan (px, skala kanvas 420). */
  width: number;
  height: number;
}

export const STICKER_PRESETS: StickerPreset[] = [
  { id: 'rose-left', label: 'Mawar Kiri', url: '/stickers/rose-left.svg', width: 140, height: 180 },
  { id: 'rose-right', label: 'Mawar Kanan', url: '/stickers/rose-right.svg', width: 140, height: 180 },
  { id: 'leaf-garland', label: 'Daun Garland', url: '/stickers/leaf-garland.svg', width: 320, height: 80 },
  { id: 'gold-frame', label: 'Bingkai Emas', url: '/stickers/gold-frame.svg', width: 360, height: 120 },
  { id: 'sparkle', label: 'Kilau', url: '/stickers/sparkle.svg', width: 64, height: 64 },
  { id: 'butterfly', label: 'Kupu-kupu', url: '/stickers/butterfly.svg', width: 96, height: 72 }
];
