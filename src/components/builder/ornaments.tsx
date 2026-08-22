'use client';

import type { CSSProperties } from 'react';

/**
 * Perpustakaan ornamen SVG untuk undangan — aset dekoratif yang mengikuti
 * "filosofi tema & kategori" template. Semua ornamen digambar dalam
 * currentColor agar otomatis mengikuti warna tema (primary/secondary/text).
 *
 * Tiap ornamen punya kategori default agar template bisa memilih yang
 * paling cocok, tetapi pengguna bebas memilih di builder.
 */

export type OrnamentKey =
  | 'flourish'
  | 'corner-flourish'
  | 'laurel'
  | 'eucalyptus'
  | 'wildflower'
  | 'rose-branch'
  | 'heart-swirl'
  | 'arch-geometric'
  | 'diamond-lines'
  | 'lotus'
  | 'paisley'
  | 'celestial'
  | 'flourish-double'
  | 'birds'
  | 'cherry-blossom'
  | 'olive-branch'
  | 'art-deco'
  | 'mandala'
  | 'tropical-leaf'
  | 'infinity-love'
  | 'scroll-divider'
  | 'botanical-garland'
  | 'geometric-hex'
  | 'vine-border'
  | 'jasmine-garland'
  | 'corner-jasmine'
  | 'corner-rose'
  | 'corner-peony'
  | 'orchid-spray'
  | 'lily-divider'
  | 'peony-bouquet'
  | 'frangipani'
  | 'monstera-garland'
  | 'sunflower'
  | 'baby-breath'
  | 'gardenia-wreath'
  | 'rose-head'
  | 'jasmine-head'
  | 'orchid-head'
  | 'peony-head'
  | 'lily-head'
  | 'tulip-head'
  | 'daisy-head'
  | 'hydrangea-head'
  | 'newspaper-rule'
  | 'batik-parang'
  | 'wayang'
  | 'om-symbol'
  | 'cross'
  | 'lantern'
  | 'naga'
  | 'stupa'
  | 'islamic-geometric'
  | 'masjid-dome'
  | 'church-window'
  | 'hindu-mandala'
  | 'buddha-wheel'
  | 'jawa-gunungan'
  | 'batak-ulos'
  | 'sunda-kebat'
  | 'minang-gadang'
  | 'papua-asmat';

export const ORNAMENT_CATEGORIES: Record<string, { label: string; keys: OrnamentKey[] }> = {
  classic: { label: 'Klasik & Mewah', keys: ['flourish', 'corner-flourish', 'laurel', 'flourish-double', 'paisley', 'scroll-divider', 'vine-border', 'gardenia-wreath', 'baby-breath'] },
  outdoor: { label: 'Outdoor & Natural', keys: ['eucalyptus', 'wildflower', 'lotus', 'birds', 'cherry-blossom', 'olive-branch', 'tropical-leaf', 'botanical-garland', 'frangipani', 'monstera-garland', 'sunflower'] },
  romance: { label: 'Romantis', keys: ['rose-branch', 'heart-swirl', 'celestial', 'paisley', 'infinity-love', 'corner-rose', 'corner-peony', 'orchid-spray', 'lily-divider', 'peony-bouquet'] },
  modern: { label: 'Modern & Minimal', keys: ['arch-geometric', 'diamond-lines', 'celestial', 'flourish', 'art-deco', 'geometric-hex', 'mandala'] },
  floral: { label: 'Sudut & Bunga', keys: ['corner-jasmine', 'corner-rose', 'corner-peony', 'jasmine-garland', 'orchid-spray', 'peony-bouquet', 'gardenia-wreath'] },
  flowers: { label: 'Kepala Bunga', keys: ['rose-head', 'jasmine-head', 'orchid-head', 'peony-head', 'lily-head', 'tulip-head', 'daisy-head', 'hydrangea-head'] },
  cultural: { label: 'Budaya & Agama', keys: ['newspaper-rule', 'batik-parang', 'wayang', 'om-symbol', 'cross', 'lantern', 'naga', 'stupa', 'islamic-geometric', 'masjid-dome', 'church-window', 'hindu-mandala', 'buddha-wheel', 'jawa-gunungan', 'batak-ulos', 'sunda-kebat', 'minang-gadang', 'papua-asmat'] }
};

export const ORNAMENTS: { key: OrnamentKey; label: string; category: string }[] = [
  { key: 'flourish', label: 'Kembang Mekar', category: 'classic' },
  { key: 'corner-flourish', label: 'Sudut Mewah', category: 'classic' },
  { key: 'laurel', label: 'Laurel / Dahan', category: 'classic' },
  { key: 'flourish-double', label: 'Mekar Ganda', category: 'classic' },
  { key: 'paisley', label: 'Paisley', category: 'classic' },
  { key: 'scroll-divider', label: 'Gulungan Klasik', category: 'classic' },
  { key: 'vine-border', label: 'Tanaman Rambat', category: 'classic' },
  { key: 'gardenia-wreath', label: 'Melati Putih', category: 'classic' },
  { key: 'baby-breath', label: 'Baby\'s Breath', category: 'classic' },
  { key: 'eucalyptus', label: 'Daun Eucalyptus', category: 'outdoor' },
  { key: 'wildflower', label: 'Bunga Liar', category: 'outdoor' },
  { key: 'lotus', label: 'Teratai', category: 'outdoor' },
  { key: 'birds', label: 'Burung & Dahan', category: 'outdoor' },
  { key: 'cherry-blossom', label: 'Bunga Sakura', category: 'outdoor' },
  { key: 'olive-branch', label: 'Dahan Zaitun', category: 'outdoor' },
  { key: 'tropical-leaf', label: 'Daun Tropis', category: 'outdoor' },
  { key: 'botanical-garland', label: 'Rantai Bunga', category: 'outdoor' },
  { key: 'frangipani', label: 'Kamboja', category: 'outdoor' },
  { key: 'monstera-garland', label: 'Monstera', category: 'outdoor' },
  { key: 'sunflower', label: 'Matahari', category: 'outdoor' },
  { key: 'rose-branch', label: 'Tangkai Mawar', category: 'romance' },
  { key: 'heart-swirl', label: 'Hati Berpilin', category: 'romance' },
  { key: 'celestial', label: 'Bintang & Bulan', category: 'romance' },
  { key: 'infinity-love', label: 'Infinity Love', category: 'romance' },
  { key: 'corner-rose', label: 'Sudut Mawar', category: 'romance' },
  { key: 'corner-peony', label: 'Sudut Peony', category: 'romance' },
  { key: 'orchid-spray', label: 'Anggrek', category: 'romance' },
  { key: 'lily-divider', label: 'Lily', category: 'romance' },
  { key: 'peony-bouquet', label: 'Buket Peony', category: 'romance' },
  { key: 'arch-geometric', label: 'Lengkung Modern', category: 'modern' },
  { key: 'diamond-lines', label: 'Belah Ketupat', category: 'modern' },
  { key: 'art-deco', label: 'Art Deco', category: 'modern' },
  { key: 'geometric-hex', label: 'Heksagon', category: 'modern' },
  { key: 'mandala', label: 'Mandala', category: 'modern' },
  { key: 'corner-jasmine', label: 'Sudut Melati', category: 'floral' },
  { key: 'jasmine-garland', label: 'Rantai Melati', category: 'floral' },
  { key: 'rose-head', label: 'Kepala Mawar', category: 'flowers' },
  { key: 'jasmine-head', label: 'Kepala Melati', category: 'flowers' },
  { key: 'orchid-head', label: 'Kepala Anggrek', category: 'flowers' },
  { key: 'peony-head', label: 'Kepala Peony', category: 'flowers' },
  { key: 'lily-head', label: 'Kepala Lily', category: 'flowers' },
  { key: 'tulip-head', label: 'Kepala Tulip', category: 'flowers' },
  { key: 'daisy-head', label: 'Kepala Daisy', category: 'flowers' },
  { key: 'hydrangea-head', label: 'Kepala Hydrangea', category: 'flowers' },
  { key: 'newspaper-rule', label: 'Garis Koran', category: 'cultural' },
  { key: 'batik-parang', label: 'Batik Parang', category: 'cultural' },
  { key: 'wayang', label: 'Wayang Kulit', category: 'cultural' },
  { key: 'om-symbol', label: 'Om (Hindu)', category: 'cultural' },
  { key: 'cross', label: 'Salib (Kristen)', category: 'cultural' },
  { key: 'lantern', label: 'Lentera (Konghucu)', category: 'cultural' },
  { key: 'naga', label: 'Naga (Cina)', category: 'cultural' },
  { key: 'stupa', label: 'Stupa (Buddha)', category: 'cultural' },
  { key: 'islamic-geometric', label: 'Geometrik Islam', category: 'cultural' },
  { key: 'masjid-dome', label: 'Kubah Masjid', category: 'cultural' },
  { key: 'church-window', label: 'Jendela Gereja', category: 'cultural' },
  { key: 'hindu-mandala', label: 'Mandala Hindu', category: 'cultural' },
  { key: 'buddha-wheel', label: 'Roda Dharma', category: 'cultural' },
  { key: 'jawa-gunungan', label: 'Gunungan Wayang', category: 'cultural' },
  { key: 'batak-ulos', label: 'Kain Ulos', category: 'cultural' },
  { key: 'sunda-kebat', label: 'Kebat Sunda', category: 'cultural' },
  { key: 'minang-gadang', label: 'Rumah Gadang', category: 'cultural' },
  { key: 'papua-asmat', label: 'Motif Asmat', category: 'cultural' }
];

export const ORNAMENT_LABELS: Record<OrnamentKey, string> = Object.fromEntries(
  ORNAMENTS.map((o) => [o.key, o.label])
) as Record<OrnamentKey, string>;

export const DEFAULT_ORNAMENT_BY_CATEGORY: Record<string, OrnamentKey> = {
  classic: 'flourish',
  outdoor: 'eucalyptus',
  romance: 'rose-branch',
  modern: 'arch-geometric'
};

interface OrnamentSvgProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  /** Warna aksen kedua (dua-nada) agar ornamen terlihat berwarna namun elegan. */
  accent?: string;
}

/** Ornamen dipakai sebagai pembagi / pengisi antar section. */
type Comp = (p: OrnamentSvgProps) => React.ReactNode;

function Svg({ viewBox, width = 24, height, className, style, title, accent, children }: OrnamentSvgProps & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      width={width}
      height={height ?? width}
      viewBox={viewBox}
      className={className}
      style={{ ...style, ['--oa-accent' as string]: accent ?? 'currentColor' } as CSSProperties}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

const ORNAMENT_COMPONENTS: Record<OrnamentKey, Comp> = {
  /* ===== Klasik & Mewah ===== */
  flourish: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 40" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M8 20c12-10 28-14 48-14s36 4 56 14" opacity={0.55} />
      <path d="M18 20c6-8 16-12 30-12s24 4 42 12" opacity={0.35} />
      <path d="M60 4v10M60 26v10" />
      <path d="M46 8l14 6 14-6M46 32l14-6 14 6" />
      <circle cx="60" cy="20" r="2.6" />
      <circle cx="6" cy="20" r="1.6" />
      <circle cx="114" cy="20" r="1.6" />
    </Svg>
  ),
  'corner-flourish': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 70" width={width ?? 160} height={height} className={className} style={style} title={title}>
      <path d="M8 66C8 30 34 8 70 8h42" />
      <path d="M14 66c0-28 20-52 52-52h34" opacity={0.5} />
      <path d="M44 66c2-16 12-30 30-32" opacity={0.6} />
      <path d="M70 14c-4 6-6 12-6 18" opacity={0.7} />
      <circle cx="68" cy="40" r="2" />
      <path d="M60 12h18M68 4v14" />
    </Svg>
  ),
  laurel: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 100 56" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M50 52V14" />
      <circle cx="50" cy="8" r="2" />
      <path d="M22 46C8 40 2 28 6 16c0 12 10 22 26 24z" opacity={0.5} />
      <path d="M30 50c-10-8-14-20-10-32 0 12 8 24 24 28z" opacity={0.35} />
      <path d="M78 46c14-6 22-18 18-30-1 12-12 22-28 24z" opacity={0.5} />
      <path d="M70 50c10-8 14-20 10-32 0 12-8 24-24 28z" opacity={0.35} />
    </Svg>
  ),
  'flourish-double': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 36" width={width ?? 240} height={height} className={className} style={style} title={title}>
      <path d="M70 30V6" />
      <circle cx="70" cy="4" r="2" />
      <path d="M12 18C24 6 48 2 70 8" opacity={0.5} />
      <path d="M70 8c22-6 46-2 58 10" opacity={0.5} />
      <path d="M20 22c8-10 28-14 48-10" opacity={0.32} />
      <path d="M70 12c18-4 38 0 50 8" opacity={0.32} />
      <circle cx="10" cy="20" r="1.4" />
      <circle cx="130" cy="20" r="1.4" />
    </Svg>
  ),
  paisley: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 40" width={width ?? 180} height={height} className={className} style={style} title={title}>
      <path d="M22 8c10 4 14 14 12 24-6 2-12 2-16-2 4-16 12-24 26-24 18 0 28 12 24 26-2 2-4 4-6 4-8-8-8-20 2-26" />
      <path d="M20 38h80" opacity={0.4} />
      <circle cx="20" cy="32" r="1.4" />
      <circle cx="100" cy="32" r="1.4" />
    </Svg>
  ),

  /* ===== Outdoor & Natural ===== */
  eucalyptus: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 50" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M6 44C26 44 42 34 56 12" />
      <path d="M10 38c8-2 16-8 22-18" opacity={0.45} />
      <ellipse cx="14" cy="30" rx="7" ry="3" transform="rotate(-30 14 30)" opacity={0.7} />
      <ellipse cx="26" cy="20" rx="7" ry="3" transform="rotate(-50 26 20)" opacity={0.7} />
      <ellipse cx="20" cy="40" rx="6" ry="2.8" transform="rotate(-18 20 40)" opacity={0.5} />
      <path d="M114 44C94 44 78 34 64 12" />
      <path d="M110 38c-8-2-16-8-22-18" opacity={0.45} />
      <ellipse cx="106" cy="30" rx="7" ry="3" transform="rotate(30 106 30)" opacity={0.7} />
      <ellipse cx="94" cy="20" rx="7" ry="3" transform="rotate(50 94 20)" opacity={0.7} />
      <ellipse cx="100" cy="40" rx="6" ry="2.8" transform="rotate(18 100 40)" opacity={0.5} />
      <path d="M60 44v-24" />
      <path d="M52 24c4-4 12-4 16 0" />
    </Svg>
  ),
  wildflower: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 56" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M8 50c24-4 40-16 48-30" />
      <path d="M18 42c6-10 14-18 24-24" opacity={0.4} />
      <circle cx="12" cy="28" r="6" />
      <circle cx="12" cy="28" r="2.4" />
      <circle cx="30" cy="18" r="5" />
      <circle cx="30" cy="18" r="2" />
      <circle cx="46" cy="30" r="4" />
      <path d="M60 10c8 8 8 24 0 36" opacity={0.6} />
      <circle cx="60" cy="8" r="6" />
      <circle cx="60" cy="8" r="2.4" />
      <circle cx="72" cy="16" r="4.5" />
      <circle cx="72" cy="16" r="1.8" />
      <circle cx="82" cy="28" r="5" />
      <circle cx="82" cy="28" r="2" />
      <circle cx="88" cy="40" r="4" />
    </Svg>
  ),
  lotus: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 60" width={width ?? 180} height={height} className={className} style={style} title={title}>
      <path d="M60 42C30 42 12 30 8 14c12 2 34 6 52 28Z" opacity={0.7} />
      <path d="M60 42C30 42 12 30 8 14" />
      <path d="M60 42c30 0 48-12 52-28-12 2-34 6-52 28Z" opacity={0.5} />
      <path d="M60 42c18-22 40-26 52-28" />
      <path d="M60 42C52 26 40 16 26 12" />
      <path d="M60 42c8-16 20-26 34-30" />
      <path d="M60 22v20M60 10v8" />
    </Svg>
  ),
  birds: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 130 44" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M4 36c20-2 66-14 88-28" />
      <path d="M20 26c6-8 12-12 18-14" opacity={0.5} />
      <path d="M36 18c-2 6-2 12 2 16M56 20c-4-2-6-6-6-10M74 24c-6 0-8-4-8-8M98 30c-6 2-8 6-7 11" />
      <path d="M20 26c-6 8-8 16-6 22" />
      <circle cx="60" cy="14" r="1.6" />
    </Svg>
  ),

  /* ===== Romantis ===== */
  'rose-branch': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 130 50" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M4 42c30-6 56-20 62-38" />
      <path d="M18 34c-6-4-6-12 0-16 6 4 6 12 0 16Z" opacity={0.65} />
      <path d="M34 24c-7-2-9-10-4-16 5 6 7 14 4 16Z" opacity={0.65} />
      <path d="M128 42C98 36 72 22 66 4" />
      <path d="M112 34c6-4 6-12 0-16-6 4-6 12 0 16Z" opacity={0.65} />
      <path d="M94 24c7-2 9-10 4-16-5 6-7 14-4 16Z" opacity={0.65} />
      <path d="M66 14c2 4 6 6 10 6-4 2-8 0-10-2-2 2-6 4-10 2 4 0 8-2 10-6Z" />
      <circle cx="66" cy="8" r="2" />
      <path d="M46 32c8-2 14 0 18 6M84 32c-8-2-14 0-18 6" opacity={0.5} />
    </Svg>
  ),
  'heart-swirl': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 40" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M10 20c0-8 6-14 14-14 5 0 8 2 10 4 2-2 5-4 10-4 8 0 14 6 14 14 0 10-14 18-24 24-10-6-24-14-24-24Z" />
      <path d="M60 20c0-8 6-14 14-14 5 0 8 2 10 4 2-2 5-4 10-4 8 0 14 6 14 14 0 10-14 18-24 24-10-6-24-14-24-24Z" opacity={0.55} />
    </Svg>
  ),
  celestial: ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 48" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M8 36c16-4 30-20 52-20s36 16 52 20" opacity={0.4} />
      <circle cx="60" cy="16" r="6" />
      <circle cx="60" cy="16" r="2.2" />
      <path d="M60 2v6M60 24v6M46 16h6M74 16h6M50 6l6 6M70 20l4 4M70 12l4-4M50 20l-4 4" opacity={0.8} />
    </Svg>
  ),

  /* ===== Modern & Minimal ===== */
  'arch-geometric': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 46" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M60 42V16M14 8h92M28 16c0-8 14-12 32-12s32 4 32 12" opacity={0.5} />
      <path d="M14 12c6 14 22 20 46 20s40-6 46-20" opacity={0.35} />
      <path d="M28 14l6 14M92 14l-6 14" opacity={0.7} />
    </Svg>
  ),
  'diamond-lines': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 40" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M12 8h96M16 32h88" opacity={0.3} />
      <rect x="46" y="6" width="28" height="28" transform="rotate(45 60 20)" />
      <path d="M60 2v8M60 30v8" opacity={0.5} />
    </Svg>
  ),

  /* ===== Baru: Klasik & Mewah ===== */
  'scroll-divider': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 44" width={width ?? 240} height={height} className={className} style={style} title={title}>
      <path d="M10 22c0-8 6-14 14-14h4c2 0 3 1 3 3s-1 3-3 3h-4c-4 0-8 4-8 8s4 8 8 8h4c2 0 3 1 3 3s-1 3-3 3h-4c-8 0-14-6-14-14" opacity={0.6} />
      <path d="M130 22c0 8-6 14-14 14h-4c-2 0-3-1-3-3s1-3 3-3h4c4 0 8-4 8-8s-4-8-8-8h-4c-2 0-3-1-3-3s1-3 3-3h4c8 0 14 6 14 14" opacity={0.6} />
      <path d="M40 22h60" opacity={0.3} />
      <circle cx="70" cy="22" r="2.5" />
    </Svg>
  ),
  'vine-border': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 160 40" width={width ?? 260} height={height} className={className} style={style} title={title}>
      <path d="M8 20c16-12 32 8 48-4s32 8 48-4 16 8 48-4" opacity={0.5} />
      <path d="M20 16c-2-4 0-8 4-8s6 4 4 8M60 24c-2-4 0-8 4-8s6 4 4 8M100 16c-2-4 0-8 4-8s6 4 4 8M140 24c-2-4 0-8 4-8s6 4 4 8" opacity={0.6} />
      <circle cx="20" cy="14" r="1.5" />
      <circle cx="60" cy="22" r="1.5" />
      <circle cx="100" cy="14" r="1.5" />
      <circle cx="140" cy="22" r="1.5" />
    </Svg>
  ),

  /* ===== Baru: Outdoor & Natural ===== */
  'cherry-blossom': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 130 50" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M10 40c18-4 34-16 42-28" />
      <path d="M20 32c-4-6-2-12 4-12 4 2 6 8 2 12" opacity={0.6} />
      <circle cx="30" cy="18" r="5" />
      <circle cx="30" cy="18" r="2" />
      <path d="M120 40c-18-4-34-16-42-28" />
      <path d="M110 32c4-6 2-12-4-12-4 2-6 8-2 12" opacity={0.6} />
      <circle cx="100" cy="18" r="5" />
      <circle cx="100" cy="18" r="2" />
      <path d="M65 8c2 4 6 6 10 6-4 2-8 0-10-2-2 2-6 4-10 2 4 0 8-2 10-6Z" />
      <circle cx="65" cy="4" r="3" />
    </Svg>
  ),
  'olive-branch': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 50" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M6 42C26 42 42 30 58 10" />
      <path d="M12 36c6-4 14-12 20-20" opacity={0.4} />
      <ellipse cx="16" cy="28" rx="6" ry="2.5" transform="rotate(-35 16 28)" opacity={0.6} />
      <ellipse cx="28" cy="18" rx="6" ry="2.5" transform="rotate(-50 28 18)" opacity={0.6} />
      <path d="M114 42C94 42 78 30 62 10" />
      <path d="M108 36c-6-4-14-12-20-20" opacity={0.4} />
      <ellipse cx="104" cy="28" rx="6" ry="2.5" transform="rotate(35 104 28)" opacity={0.6} />
      <ellipse cx="92" cy="18" rx="6" ry="2.5" transform="rotate(50 92 18)" opacity={0.6} />
      <path d="M60 42v-20" />
      <circle cx="60" cy="20" r="1.8" />
    </Svg>
  ),
  'tropical-leaf': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 60" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M20 50C10 30 20 10 50 8c-10 12-16 28-14 42Z" opacity={0.5} />
      <path d="M20 50C10 30 20 10 50 8" />
      <path d="M100 50C110 30 100 10 70 8c10 12 16 28 14 42Z" opacity={0.5} />
      <path d="M100 50C110 30 100 10 70 8" />
      <path d="M50 8v42M70 8v42" opacity={0.3} />
      <path d="M35 20c8-4 16-4 25 0M85 20c-8-4-16-4-25 0" opacity={0.4} />
      <path d="M40 34c6-2 12-2 18 0M80 34c-6-2-12-2-18 0" opacity={0.4} />
    </Svg>
  ),
  'botanical-garland': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 160 48" width={width ?? 260} height={height} className={className} style={style} title={title}>
      <path d="M8 38c20-4 40-20 72-20s52 16 72 20" opacity={0.4} />
      <path d="M16 34c8-2 16-10 24-16" opacity={0.3} />
      <circle cx="20" cy="22" r="4" />
      <circle cx="20" cy="22" r="1.6" />
      <circle cx="44" cy="16" r="3.5" />
      <circle cx="44" cy="16" r="1.4" />
      <path d="M80 14c2 4 6 6 10 6-4 2-8 0-10-2-2 2-6 4-10 2 4 0 8-2 10-6Z" />
      <circle cx="80" cy="10" r="4" />
      <circle cx="80" cy="10" r="1.6" />
      <circle cx="116" cy="16" r="3.5" />
      <circle cx="116" cy="16" r="1.4" />
      <circle cx="140" cy="22" r="4" />
      <circle cx="140" cy="22" r="1.6" />
    </Svg>
  ),

  /* ===== Baru: Romantis ===== */
  'infinity-love': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 44" width={width ?? 220} height={height} className={className} style={style} title={title}>
      <path d="M36 22c0-10 10-16 18-16 8 0 16 6 16 16 0 10-16 18-18 20-2-2-18-10-18-20Z" opacity={0.6} />
      <path d="M104 22c0-10-10-16-18-16-8 0-16 6-16 16 0 10 16 18 18 20 2-2 18-10 18-20Z" opacity={0.6} />
      <path d="M36 22h68" opacity={0.3} />
      <circle cx="70" cy="22" r="2" />
    </Svg>
  ),

  /* ===== Baru: Modern & Minimal ===== */
  'art-deco': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 48" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M60 4V44M20 4h80M28 12h64M36 20h48M44 28h32M52 36h16" opacity={0.4} />
      <path d="M60 4l16 18H44Z" opacity={0.6} />
      <path d="M44 22l16 18h-32Z" opacity={0.4} />
      <path d="M76 22l16 18H60Z" opacity={0.4} />
      <circle cx="60" cy="12" r="2" />
    </Svg>
  ),
  'geometric-hex': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 48" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M30 8h60M24 16h72M24 32h72M30 40h60" opacity={0.25} />
      <path d="M60 8l20 8v16l-20 8-20-8V16Z" />
      <path d="M60 16l10 4v8l-10 4-10-4v-8Z" opacity={0.5} />
      <circle cx="60" cy="24" r="2" />
    </Svg>
  ),
  'mandala': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 60" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <circle cx="60" cy="30" r="24" opacity={0.3} />
      <circle cx="60" cy="30" r="16" opacity={0.4} />
      <circle cx="60" cy="30" r="8" opacity={0.5} />
      <circle cx="60" cy="30" r="2.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="60"
          y1="30"
          x2={60 + 24 * Math.cos((deg * Math.PI) / 180)}
          y2={30 + 24 * Math.sin((deg * Math.PI) / 180)}
          opacity={0.3}
        />
      ))}
      {[0, 90, 180, 270].map((deg) => (
        <circle
          key={deg}
          cx={60 + 20 * Math.cos((deg * Math.PI) / 180)}
          cy={30 + 20 * Math.sin((deg * Math.PI) / 180)}
          r="2"
          opacity={0.5}
        />
      ))}
    </Svg>
  ),

  /* ===== Baru: Sudut & Bunga ===== */
  'corner-jasmine': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 90" width={width ?? 180} height={height} className={className} style={style} title={title}>
      <path d="M12 86C12 40 40 10 80 10h48" opacity={0.6} />
      <path d="M18 86c0-34 22-62 56-62h40" opacity={0.35} />
      {/* Melati bunga 1 */}
      <circle cx="30" cy="56" r="5" opacity={0.7} />
      <circle cx="30" cy="56" r="2" />
      <path d="M25 52l5-6 5 6M25 60l5 6 5-6" opacity={0.5} />
      {/* Melati bunga 2 */}
      <circle cx="52" cy="36" r="4.5" opacity={0.65} />
      <circle cx="52" cy="36" r="1.8" />
      <path d="M48 33l4-5 4 5M48 39l4 5 4-5" opacity={0.45} />
      {/* Melati bunga 3 */}
      <circle cx="78" cy="18" r="4" opacity={0.6} />
      <circle cx="78" cy="18" r="1.6" />
      {/* Daun kecil */}
      <ellipse cx="40" cy="68" rx="6" ry="2.5" transform="rotate(-40 40 68)" opacity={0.45} />
      <ellipse cx="64" cy="48" rx="5" ry="2" transform="rotate(-50 64 48)" opacity={0.4} />
      <ellipse cx="90" cy="28" rx="5" ry="2" transform="rotate(-55 90 28)" opacity={0.35} />
      <path d="M100 14h30" opacity={0.3} />
      <circle cx="108" cy="14" r="1.5" />
    </Svg>
  ),

  'corner-rose': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 90" width={width ?? 180} height={height} className={className} style={style} title={title}>
      <path d="M12 86C12 40 40 10 80 10h48" opacity={0.5} />
      <path d="M18 86c0-34 22-62 56-62h40" opacity={0.3} />
      {/* Mawar besar */}
      <circle cx="28" cy="58" r="8" opacity={0.6} />
      <path d="M22 54c2-4 6-6 10-4-4 0-8 2-10 4Z" opacity={0.7} />
      <path d="M34 54c-2-4-6-6-10-4 4 0 8 2 10 4Z" opacity={0.7} />
      <path d="M22 62c2 4 6 6 10 4-4 0-8-2-10-4Z" opacity={0.7} />
      <path d="M34 62c-2 4-6 6-10 4 4 0 8-2 10-4Z" opacity={0.7} />
      <circle cx="28" cy="58" r="3" opacity={0.8} />
      {/* Mawar kecil */}
      <circle cx="56" cy="32" r="5.5" opacity={0.55} />
      <path d="M52 29c2-3 5-4 8-3-3 0-6 1-8 3Z" opacity={0.65} />
      <path d="M60 29c-2-3-5-4-8-3 3 0 6 1 8 3Z" opacity={0.65} />
      <circle cx="56" cy="32" r="2" opacity={0.7} />
      {/* Mawar kecil 2 */}
      <circle cx="84" cy="16" r="4.5" opacity={0.5} />
      <circle cx="84" cy="16" r="1.8" opacity={0.6} />
      {/* Dahan & daun */}
      <path d="M28 66c8-6 18-14 28-34" opacity={0.4} />
      <path d="M38 52c-4-2-2-8 2-8s5 4 2 8" opacity={0.5} />
      <path d="M68 30c-3-2-1-6 2-6s4 3 2 6" opacity={0.45} />
      <ellipse cx="42" cy="62" rx="5" ry="2" transform="rotate(-35 42 62)" opacity={0.4} />
      <path d="M100 14h30" opacity={0.3} />
    </Svg>
  ),

  'corner-peony': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 90" width={width ?? 180} height={height} className={className} style={style} title={title}>
      <path d="M12 86C12 40 40 10 80 10h48" opacity={0.5} />
      <path d="M18 86c0-34 22-62 56-62h40" opacity={0.3} />
      {/* Peony besar - multiple petal layers */}
      <circle cx="30" cy="58" r="10" opacity={0.4} />
      <path d="M24 52c0-6 3-10 6-10s6 4 6 10-3 10-6 10-6-4-6-10Z" opacity={0.55} />
      <path d="M20 58c-4 0-6-3-6-6s2-5 6-6c4 1 6 3 6 6s-2 6-6 6Z" opacity={0.5} />
      <path d="M40 58c4 0 6-3 6-6s-2-5-6-6c-4 1-6 3-6 6s2 6 6 6Z" opacity={0.5} />
      <path d="M30 48c0-5 2-8 4-8s4 3 4 8-2 8-4 8-4-3-4-8Z" opacity={0.6} />
      <circle cx="30" cy="58" r="3.5" opacity={0.65} />
      {/* Peony kecil */}
      <circle cx="60" cy="30" r="6.5" opacity={0.35} />
      <path d="M56 27c0-4 2-6 4-6s4 2 4 6-2 6-4 6-4-2-4-6Z" opacity={0.5} />
      <path d="M53 30c-3 0-4-2-4-4s1-4 4-4c3 0 4 2 4 4s-1 4-4 4Z" opacity={0.45} />
      <circle cx="60" cy="30" r="2" opacity={0.55} />
      {/* Peony kecil 2 */}
      <circle cx="86" cy="16" r="5" opacity={0.35} />
      <path d="M83 14c0-3 1-5 3-5s3 2 3 5-1 5-3 5-3-2-3-5Z" opacity={0.45} />
      <circle cx="86" cy="16" r="1.5" opacity={0.5} />
      {/* Daun peony */}
      <ellipse cx="42" cy="64" rx="7" ry="3" transform="rotate(-30 42 64)" opacity={0.4} />
      <ellipse cx="72" cy="36" rx="6" ry="2.5" transform="rotate(-45 72 36)" opacity={0.35} />
      <path d="M100 14h30" opacity={0.3} />
    </Svg>
  ),

  'orchid-spray': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 50" width={width ?? 240} height={height} className={className} style={style} title={title}>
      <path d="M10 44C30 44 50 30 70 8" />
      <path d="M130 44C110 44 90 30 70 8" />
      {/* Anggrek bunga kiri */}
      <ellipse cx="20" cy="30" rx="8" ry="4" transform="rotate(-30 20 30)" opacity={0.6} />
      <ellipse cx="16" cy="26" rx="6" ry="3" transform="rotate(-60 16 26)" opacity={0.55} />
      <ellipse cx="24" cy="26" rx="6" ry="3" transform="rotate(0 24 26)" opacity={0.55} />
      <ellipse cx="20" cy="34" rx="5" ry="2.5" opacity={0.5} />
      <circle cx="20" cy="30" r="2" opacity={0.7} />
      {/* Anggrek bunga tengah */}
      <ellipse cx="70" cy="8" rx="9" ry="4.5" transform="rotate(-10 70 8)" opacity={0.55} />
      <ellipse cx="65" cy="4" rx="7" ry="3.5" transform="rotate(-50 65 4)" opacity={0.5} />
      <ellipse cx="75" cy="4" rx="7" ry="3.5" transform="rotate(30 75 4)" opacity={0.5} />
      <ellipse cx="70" cy="13" rx="6" ry="3" opacity={0.45} />
      <circle cx="70" cy="8" r="2.2" opacity={0.65} />
      {/* Anggrek bunga kanan */}
      <ellipse cx="120" cy="30" rx="8" ry="4" transform="rotate(30 120 30)" opacity={0.6} />
      <ellipse cx="116" cy="26" rx="6" ry="3" transform="rotate(-30 116 26)" opacity={0.55} />
      <ellipse cx="124" cy="26" rx="6" ry="3" transform="rotate(60 124 26)" opacity={0.55} />
      <ellipse cx="120" cy="34" rx="5" ry="2.5" opacity={0.5} />
      <circle cx="120" cy="30" r="2" opacity={0.7} />
      {/* Daun anggrek */}
      <path d="M34 40c-2-6 2-10 6-8 2 4-2 8-6 8" opacity={0.4} />
      <path d="M106 40c2-6-2-10-6-8-2 4 2 8 6 8" opacity={0.4} />
      <circle cx="70" cy="38" r="1.5" opacity={0.3} />
    </Svg>
  ),

  'lily-divider': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 160 50" width={width ?? 260} height={height} className={className} style={style} title={title}>
      <path d="M10 42C30 42 50 28 70 8" opacity={0.4} />
      <path d="M150 42C130 42 110 28 90 8" opacity={0.4} />
      <path d="M30 36c-2-6 2-10 6-8 1 3-1 6-4 8" opacity={0.4} />
      <path d="M130 36c2-6-2-10-6-8-1 3 1 6 4 8" opacity={0.4} />
      {/* Lily tengah */}
      <path d="M80 2c-4 6-4 14 0 20 4-6 4-14 0-20Z" opacity={0.6} />
      <path d="M74 6c0 6 2 12 6 16 0-6-2-12-6-16Z" opacity={0.5} />
      <path d="M86 6c0 6-2 12-6 16 0-6 2-12 6-16Z" opacity={0.5} />
      <path d="M70 10c-2 6 0 12 4 16 0-6-2-10-4-16Z" opacity={0.4} />
      <path d="M90 10c2 6 0 12-4 16 0-6 2-10 4-16Z" opacity={0.4} />
      <circle cx="80" cy="14" r="2" opacity={0.7} />
      {/* Garis pembagi */}
      <path d="M40 44h80" opacity={0.25} />
      <circle cx="80" cy="44" r="1.5" opacity={0.4} />
      <circle cx="50" cy="44" r="1" opacity={0.3} />
      <circle cx="110" cy="44" r="1" opacity={0.3} />
    </Svg>
  ),

  'peony-bouquet': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 60" width={width ?? 200} height={height} className={className} style={style} title={title}>
      {/* Peony utama */}
      <circle cx="60" cy="24" r="12" opacity={0.35} />
      <path d="M52 18c0-6 4-10 8-10s8 4 8 10-4 12-8 12-8-6-8-12Z" opacity={0.5} />
      <path d="M48 24c-4 0-8-4-8-8s4-6 8-6c4 0 8 2 8 6s-4 8-8 8Z" opacity={0.45} />
      <path d="M72 24c4 0 8-4 8-8s-4-6-8-6c-4 0-8 2-8 6s4 8 8 8Z" opacity={0.45} />
      <path d="M60 14c0-4 2-6 4-6s4 2 4 6-2 8-4 8-4-4-4-8Z" opacity={0.55} />
      <circle cx="60" cy="24" r="4" opacity={0.6} />
      {/* Peony kiri */}
      <circle cx="34" cy="34" r="8" opacity={0.3} />
      <path d="M28 30c0-5 3-8 6-8s6 3 6 8-3 10-6 10-6-5-6-10Z" opacity={0.45} />
      <circle cx="34" cy="34" r="3" opacity={0.55} />
      {/* Peony kanan */}
      <circle cx="86" cy="34" r="8" opacity={0.3} />
      <path d="M80 30c0-5 3-8 6-8s6 3 6 8-3 10-6 10-6-5-6-10Z" opacity={0.45} />
      <circle cx="86" cy="34" r="3" opacity={0.55} />
      {/* Daun & batang */}
      <path d="M60 36v20" opacity={0.4} />
      <path d="M44 48c-6 2-10-2-8-6 4 0 8 4 8 6" opacity={0.35} />
      <path d="M76 48c6 2 10-2 8-6-4 0-8 4-8 6" opacity={0.35} />
      <ellipse cx="38" cy="44" rx="6" ry="2.5" transform="rotate(-25 38 44)" opacity={0.35} />
      <ellipse cx="82" cy="44" rx="6" ry="2.5" transform="rotate(25 82 44)" opacity={0.35} />
    </Svg>
  ),

  'frangipani': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 50" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M8 44C28 44 48 30 60 10" opacity={0.4} />
      <path d="M112 44C92 44 72 30 60 10" opacity={0.4} />
      {/* Kamboja kiri */}
      <ellipse cx="16" cy="28" rx="7" ry="3.5" transform="rotate(-20 16 28)" opacity={0.6} />
      <ellipse cx="12" cy="24" rx="6" ry="3" transform="rotate(-60 12 24)" opacity={0.55} />
      <ellipse cx="20" cy="24" rx="6" ry="3" transform="rotate(20 20 24)" opacity={0.55} />
      <ellipse cx="16" cy="32" rx="5" ry="2.5" transform="rotate(10 16 32)" opacity={0.5} />
      <ellipse cx="10" cy="30" rx="5" ry="2.5" transform="rotate(-40 10 30)" opacity={0.5} />
      <circle cx="16" cy="28" r="2.2" opacity={0.7} />
      {/* Kamboja tengah */}
      <ellipse cx="60" cy="8" rx="8" ry="4" opacity={0.55} />
      <ellipse cx="55" cy="4" rx="7" ry="3.5" transform="rotate(-50 55 4)" opacity={0.5} />
      <ellipse cx="65" cy="4" rx="7" ry="3.5" transform="rotate(50 65 4)" opacity={0.5} />
      <ellipse cx="60" cy="14" rx="6" ry="3" opacity={0.45} />
      <ellipse cx="52" cy="10" rx="6" ry="3" transform="rotate(-30 52 10)" opacity={0.45} />
      <circle cx="60" cy="8" r="2.5" opacity={0.65} />
      {/* Kamboja kanan */}
      <ellipse cx="104" cy="28" rx="7" ry="3.5" transform="rotate(20 104 28)" opacity={0.6} />
      <ellipse cx="100" cy="24" rx="6" ry="3" transform="rotate(-20 100 24)" opacity={0.55} />
      <ellipse cx="108" cy="24" rx="6" ry="3" transform="rotate(60 108 24)" opacity={0.55} />
      <ellipse cx="104" cy="32" rx="5" ry="2.5" transform="rotate(-10 104 32)" opacity={0.5} />
      <circle cx="104" cy="28" r="2.2" opacity={0.7} />
      {/* Daun */}
      <ellipse cx="32" cy="40" rx="6" ry="2.5" transform="rotate(-35 32 40)" opacity={0.35} />
      <ellipse cx="88" cy="40" rx="6" ry="2.5" transform="rotate(35 88 40)" opacity={0.35} />
    </Svg>
  ),

  'monstera-garland': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 160 48" width={width ?? 260} height={height} className={className} style={style} title={title}>
      <path d="M8 38c20-4 40-20 72-20s52 16 72 20" opacity={0.35} />
      {/* Monstera leaves - kiri */}
      <path d="M16 32c-4-8 0-16 8-16s8 8 4 16" opacity={0.5} />
      <path d="M16 32c0-6 2-10 4-12" opacity={0.3} />
      <path d="M20 30c-1-4 1-8 4-8" opacity={0.25} />
      {/* Monstera leaves - tengah kiri */}
      <path d="M50 22c-4-8 0-14 8-14s8 6 4 14" opacity={0.45} />
      <path d="M50 22c0-5 2-8 4-10" opacity={0.28} />
      {/* Monstera leaves - tengah */}
      <path d="M80 18c-4-8 0-14 8-14s8 6 4 14" opacity={0.5} />
      <path d="M80 18c0-5 2-8 4-10" opacity={0.3} />
      {/* Monstera leaves - tengah kanan */}
      <path d="M110 22c-4-8 0-14 8-14s8 6 4 14" opacity={0.45} />
      <path d="M110 22c0-5 2-8 4-10" opacity={0.28} />
      {/* Monstera leaves - kanan */}
      <path d="M140 32c-4-8 0-16 8-16s8 8 4 16" opacity={0.5} />
      <path d="M140 32c0-6 2-10 4-12" opacity={0.3} />
      {/* Small berries/buds */}
      <circle cx="34" cy="28" r="2" opacity={0.4} />
      <circle cx="66" cy="18" r="2" opacity={0.35} />
      <circle cx="96" cy="18" r="2" opacity={0.35} />
      <circle cx="126" cy="28" r="2" opacity={0.4} />
    </Svg>
  ),

  'sunflower': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 56" width={width ?? 200} height={height} className={className} style={style} title={title}>
      <path d="M8 50C28 50 48 36 60 16" opacity={0.4} />
      <path d="M112 50C92 50 72 36 60 16" opacity={0.4} />
      {/* Bunga matahari kiri */}
      <circle cx="18" cy="30" r="4" opacity={0.7} />
      <circle cx="18" cy="30" r="1.6" opacity={0.8} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse key={`l${deg}`} cx={18 + 6 * Math.cos((deg * Math.PI) / 180)} cy={30 + 6 * Math.sin((deg * Math.PI) / 180)} rx="2.5" ry="4" transform={`rotate(${deg} ${18 + 6 * Math.cos((deg * Math.PI) / 180)} ${30 + 6 * Math.sin((deg * Math.PI) / 180)})`} opacity={0.5} />
      ))}
      {/* Bunga matahari tengah */}
      <circle cx="60" cy="10" r="5" opacity={0.65} />
      <circle cx="60" cy="10" r="2" opacity={0.75} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse key={`c${deg}`} cx={60 + 7.5 * Math.cos((deg * Math.PI) / 180)} cy={10 + 7.5 * Math.sin((deg * Math.PI) / 180)} rx="3" ry="5" transform={`rotate(${deg} ${60 + 7.5 * Math.cos((deg * Math.PI) / 180)} ${10 + 7.5 * Math.sin((deg * Math.PI) / 180)})`} opacity={0.45} />
      ))}
      {/* Bunga matahari kanan */}
      <circle cx="102" cy="30" r="4" opacity={0.7} />
      <circle cx="102" cy="30" r="1.6" opacity={0.8} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <ellipse key={`r${deg}`} cx={102 + 6 * Math.cos((deg * Math.PI) / 180)} cy={30 + 6 * Math.sin((deg * Math.PI) / 180)} rx="2.5" ry="4" transform={`rotate(${deg} ${102 + 6 * Math.cos((deg * Math.PI) / 180)} ${30 + 6 * Math.sin((deg * Math.PI) / 180)})`} opacity={0.5} />
      ))}
      {/* Daun */}
      <ellipse cx="38" cy="44" rx="6" ry="2.5" transform="rotate(-30 38 44)" opacity={0.35} />
      <ellipse cx="82" cy="44" rx="6" ry="2.5" transform="rotate(30 82 44)" opacity={0.35} />
    </Svg>
  ),

  'baby-breath': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 48" width={width ?? 240} height={height} className={className} style={style} title={title}>
      <path d="M10 42C30 42 50 28 70 8" opacity={0.35} />
      <path d="M130 42C110 42 90 28 70 8" opacity={0.35} />
      {/* Baby's breath clusters - small dots */}
      <circle cx="14" cy="32" r="1.5" opacity={0.5} />
      <circle cx="18" cy="28" r="1.2" opacity={0.45} />
      <circle cx="12" cy="28" r="1" opacity={0.4} />
      <circle cx="16" cy="34" r="1.3" opacity={0.45} />
      <circle cx="22" cy="30" r="1.1" opacity={0.4} />

      <circle cx="30" cy="22" r="1.8" opacity={0.5} />
      <circle cx="34" cy="18" r="1.4" opacity={0.45} />
      <circle cx="28" cy="18" r="1.2" opacity={0.4} />
      <circle cx="32" cy="24" r="1.3" opacity={0.45} />

      <circle cx="48" cy="14" r="1.8" opacity={0.5} />
      <circle cx="52" cy="10" r="1.5" opacity={0.45} />
      <circle cx="46" cy="10" r="1.2" opacity={0.4} />
      <circle cx="50" cy="16" r="1.4" opacity={0.45} />

      <circle cx="70" cy="6" r="2" opacity={0.55} />
      <circle cx="74" cy="4" r="1.5" opacity={0.5} />
      <circle cx="66" cy="4" r="1.3" opacity={0.45} />
      <circle cx="70" cy="10" r="1.5" opacity={0.5} />
      <circle cx="66" cy="8" r="1.2" opacity={0.45} />
      <circle cx="74" cy="8" r="1.2" opacity={0.45} />

      <circle cx="92" cy="14" r="1.8" opacity={0.5} />
      <circle cx="96" cy="10" r="1.5" opacity={0.45} />
      <circle cx="90" cy="10" r="1.2" opacity={0.4} />
      <circle cx="94" cy="16" r="1.4" opacity={0.45} />

      <circle cx="110" cy="22" r="1.8" opacity={0.5} />
      <circle cx="114" cy="18" r="1.4" opacity={0.45} />
      <circle cx="108" cy="18" r="1.2" opacity={0.4} />

      <circle cx="126" cy="32" r="1.5" opacity={0.5} />
      <circle cx="130" cy="28" r="1.2" opacity={0.45} />
      <circle cx="124" cy="28" r="1" opacity={0.4} />
      {/* Tangkai tipis */}
      <path d="M14 38v-6M20 34v-6M30 28v-6M48 20v-6M70 12v-6M92 20v-6M110 28v-6M126 38v-6" opacity={0.25} strokeWidth={0.8} />
    </Svg>
  ),

  'gardenia-wreath': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 120 60" width={width ?? 200} height={height} className={className} style={style} title={title}>
      {/* Wreath shape - daun melati melingkar */}
      <path d="M60 50C30 50 10 35 10 20s20-30 50-30 50 15 50 30-20 30-50 30Z" opacity={0.3} />
      <path d="M60 46C34 46 16 33 16 20s18-26 44-26 44 13 44 26-18 26-44 26Z" opacity={0.2} />
      {/* Daun-daun kecil melati */}
      <ellipse cx="20" cy="34" rx="5" ry="2.5" transform="rotate(-40 20 34)" opacity={0.5} />
      <ellipse cx="14" cy="24" rx="5" ry="2.5" transform="rotate(-60 14 24)" opacity={0.45} />
      <ellipse cx="18" cy="14" rx="5" ry="2.5" transform="rotate(-80 18 14)" opacity={0.4} />
      <ellipse cx="30" cy="8" rx="5" ry="2.5" transform="rotate(-10 30 8)" opacity={0.45} />
      <ellipse cx="46" cy="6" rx="5" ry="2.5" transform="rotate(10 46 6)" opacity={0.5} />
      <ellipse cx="60" cy="8" rx="5" ry="2.5" opacity={0.5} />
      <ellipse cx="74" cy="6" rx="5" ry="2.5" transform="rotate(-10 74 6)" opacity={0.5} />
      <ellipse cx="90" cy="8" rx="5" ry="2.5" transform="rotate(10 90 8)" opacity={0.45} />
      <ellipse cx="102" cy="14" rx="5" ry="2.5" transform="rotate(80 102 14)" opacity={0.4} />
      <ellipse cx="106" cy="24" rx="5" ry="2.5" transform="rotate(60 106 24)" opacity={0.45} />
      <ellipse cx="100" cy="34" rx="5" ry="2.5" transform="rotate(40 100 34)" opacity={0.5} />
      {/* Bunga melati kecil */}
      <circle cx="16" cy="28" r="2.5" opacity={0.6} />
      <circle cx="16" cy="28" r="1" opacity={0.7} />
      <circle cx="36" cy="6" r="2.5" opacity={0.6} />
      <circle cx="36" cy="6" r="1" opacity={0.7} />
      <circle cx="60" cy="4" r="3" opacity={0.65} />
      <circle cx="60" cy="4" r="1.2" opacity={0.75} />
      <circle cx="84" cy="6" r="2.5" opacity={0.6} />
      <circle cx="84" cy="6" r="1" opacity={0.7} />
      <circle cx="104" cy="28" r="2.5" opacity={0.6} />
      <circle cx="104" cy="28" r="1" opacity={0.7} />
      <circle cx="60" cy="54" r="3" opacity={0.65} />
      <circle cx="60" cy="54" r="1.2" opacity={0.75} />
    </Svg>
  ),

  'jasmine-garland': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 140 44" width={width ?? 240} height={height} className={className} style={style} title={title}>
      <path d="M8 36c20-4 40-20 62-20s42 16 62 20" opacity={0.3} />
      {/* Jasmine flowers along garland */}
      <circle cx="16" cy="30" r="3.5" opacity={0.6} />
      <circle cx="16" cy="30" r="1.4" opacity={0.7} />
      <path d="M12 27l4-5 4 5M12 33l4 5 4-5" opacity={0.45} />

      <circle cx="38" cy="20" r="3" opacity={0.55} />
      <circle cx="38" cy="20" r="1.2" opacity={0.65} />
      <path d="M35 18l3-4 3 4M35 22l3 4 3-4" opacity={0.4} />

      <circle cx="62" cy="14" r="3.5" opacity={0.6} />
      <circle cx="62" cy="14" r="1.4" opacity={0.7} />
      <path d="M58 11l4-5 4 5M58 17l4 5 4-5" opacity={0.45} />

      <circle cx="88" cy="14" r="3.5" opacity={0.6} />
      <circle cx="88" cy="14" r="1.4" opacity={0.7} />
      <path d="M84 11l4-5 4 5M84 17l4 5 4-5" opacity={0.45} />

      <circle cx="112" cy="20" r="3" opacity={0.55} />
      <circle cx="112" cy="20" r="1.2" opacity={0.65} />
      <path d="M109 18l3-4 3 4M109 22l3 4 3-4" opacity={0.4} />

      <circle cx="132" cy="30" r="3.5" opacity={0.6} />
      <circle cx="132" cy="30" r="1.4" opacity={0.7} />
      <path d="M128 27l4-5 4 5M128 33l4 5 4-5" opacity={0.45} />
      {/* Tali/garland line */}
      <path d="M16 30C30 24 50 18 70 14s40 0 62 16" opacity={0.2} strokeWidth={0.8} />
    </Svg>
  ),

  /* ===== Single Flower Heads ===== */
  'rose-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Outer petals */}
      <path d="M30 8c-8 4-12 12-10 20 2-8 8-14 10-14s8 6 10 14c2-8-2-16-10-20Z" opacity={0.5} />
      <path d="M12 22c-4 8-2 18 6 22 2-10 2-18-6-22Z" opacity={0.45} />
      <path d="M48 22c4 8 2 18-6 22-2-10-2-18 6-22Z" opacity={0.45} />
      <path d="M18 42c-6 6-4 14 4 16 0-8 0-12-4-16Z" opacity={0.4} />
      <path d="M42 42c6 6 4 14-4 16 0-8 0-12 4-16Z" opacity={0.4} />
      {/* Inner petals */}
      <path d="M30 16c-5 3-7 8-6 14 1-6 4-10 6-10s5 4 6 10c1-6-1-11-6-14Z" opacity={0.6} />
      <path d="M20 26c-3 4-2 10 2 12 1-6 0-9-2-12Z" opacity={0.55} />
      <path d="M40 26c3 4 2 10-2 12-1-6 0-9 2-12Z" opacity={0.55} />
      {/* Center */}
      <circle cx="30" cy="30" r="5" opacity={0.65} />
      <circle cx="30" cy="30" r="2" opacity={0.75} />
    </Svg>
  ),

  'jasmine-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* 5 petals like star */}
      <ellipse cx="30" cy="12" rx="5" ry="10" opacity={0.55} />
      <ellipse cx="30" cy="12" rx="5" ry="10" transform="rotate(72 30 30)" opacity={0.55} />
      <ellipse cx="30" cy="12" rx="5" ry="10" transform="rotate(144 30 30)" opacity={0.55} />
      <ellipse cx="30" cy="12" rx="5" ry="10" transform="rotate(216 30 30)" opacity={0.55} />
      <ellipse cx="30" cy="12" rx="5" ry="10" transform="rotate(288 30 30)" opacity={0.55} />
      {/* Inner petals */}
      <ellipse cx="30" cy="18" rx="3" ry="6" opacity={0.5} />
      <ellipse cx="30" cy="18" rx="3" ry="6" transform="rotate(72 30 30)" opacity={0.5} />
      <ellipse cx="30" cy="18" rx="3" ry="6" transform="rotate(144 30 30)" opacity={0.5} />
      <ellipse cx="30" cy="18" rx="3" ry="6" transform="rotate(216 30 30)" opacity={0.5} />
      <ellipse cx="30" cy="18" rx="3" ry="6" transform="rotate(288 30 30)" opacity={0.5} />
      <circle cx="30" cy="30" r="4" opacity={0.65} />
      <circle cx="30" cy="30" r="1.8" opacity={0.75} />
    </Svg>
  ),

  'orchid-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Top petal */}
      <ellipse cx="30" cy="10" rx="7" ry="10" opacity={0.5} />
      {/* Side petals */}
      <ellipse cx="12" cy="22" rx="10" ry="6" transform="rotate(-30 12 22)" opacity={0.45} />
      <ellipse cx="48" cy="22" rx="10" ry="6" transform="rotate(30 48 22)" opacity={0.45} />
      {/* Bottom petals (lip) */}
      <path d="M20 38c-4 6-2 12 4 14 2-6 4-10 6-14-2 4-6 8-10 0Z" opacity={0.55} />
      <path d="M40 38c4 6 2 12-4 14-2-6-4-10-6-14 2 4 6 8 10 0Z" opacity={0.55} />
      {/* Center column */}
      <ellipse cx="30" cy="30" rx="4" ry="6" opacity={0.6} />
      <circle cx="30" cy="28" r="2" opacity={0.7} />
    </Svg>
  ),

  'peony-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Multiple layered petals */}
      <circle cx="30" cy="30" r="22" opacity={0.25} />
      <path d="M30 8c-6 4-10 12-8 20 2-8 6-14 8-14s6 6 8 14c2-8-2-16-8-20Z" opacity={0.45} />
      <path d="M10 20c-4 6-4 16 4 22 0-10 0-16-4-22Z" opacity={0.4} />
      <path d="M50 20c4 6 4 16-4 22 0-10 0-16 4-22Z" opacity={0.4} />
      <path d="M14 40c-4 6-2 12 4 14 0-8 0-10-4-14Z" opacity={0.35} />
      <path d="M46 40c4 6 2 12-4 14 0-8 0-10 4-14Z" opacity={0.35} />
      {/* Inner layers */}
      <path d="M30 14c-4 3-6 8-5 14 1-6 3-10 5-10s4 4 5 10c1-6-1-11-5-14Z" opacity={0.55} />
      <path d="M18 24c-3 4-2 10 2 14 0-6-1-10-2-14Z" opacity={0.5} />
      <path d="M42 24c3 4 2 10-2 14 0-6 1-10 2-14Z" opacity={0.5} />
      <circle cx="30" cy="30" r="6" opacity={0.55} />
      <circle cx="30" cy="30" r="2.5" opacity={0.65} />
    </Svg>
  ),

  'lily-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* 6 petals like star */}
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" opacity={0.5} />
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" transform="rotate(60 30 30)" opacity={0.5} />
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" transform="rotate(120 30 30)" opacity={0.5} />
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" transform="rotate(180 30 30)" opacity={0.5} />
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" transform="rotate(240 30 30)" opacity={0.5} />
      <path d="M30 6c-3 8-3 16 0 24 3-8 3-16 0-24Z" transform="rotate(300 30 30)" opacity={0.5} />
      {/* Inner petals */}
      <path d="M30 12c-2 6-2 12 0 18 2-6 2-12 0-18Z" opacity={0.45} />
      <path d="M30 12c-2 6-2 12 0 18 2-6 2-12 0-18Z" transform="rotate(60 30 30)" opacity={0.45} />
      <path d="M30 12c-2 6-2 12 0 18 2-6 2-12 0-18Z" transform="rotate(120 30 30)" opacity={0.45} />
      {/* Stamens */}
      <circle cx="30" cy="22" r="1.5" opacity={0.6} />
      <circle cx="24" cy="26" r="1.2" opacity={0.55} />
      <circle cx="36" cy="26" r="1.2" opacity={0.55} />
      <circle cx="30" cy="30" r="2" opacity={0.65} />
    </Svg>
  ),

  'tulip-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Cup shape */}
      <path d="M18 28c0-12 6-20 12-20s12 8 12 20c0 8-5 14-12 14s-12-6-12-14Z" opacity={0.5} />
      {/* Petals */}
      <path d="M20 26c-2-10 4-18 10-18s8 6 6 14" opacity={0.55} />
      <path d="M40 26c2-10-4-18-10-18s-8 6-6 14" opacity={0.55} />
      <path d="M26 12c-1-4 0-8 4-8s4 4 2 8" opacity={0.5} />
      {/* Inner */}
      <path d="M26 18c-1-4 1-8 4-8s3 4 2 8" opacity={0.45} />
      <path d="M34 18c1-4-1-8-4-8s-3 4-2 8" opacity={0.45} />
      {/* Stem hint */}
      <path d="M30 42v14" opacity={0.35} strokeWidth={1.2} />
      <circle cx="30" cy="32" r="2" opacity={0.6} />
    </Svg>
  ),

  'daisy-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Many thin petals around center */}
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={i}
          cx="30"
          cy="10"
          rx="3"
          ry="10"
          transform={`rotate(${i * 30} 30 30)`}
          opacity={0.5}
        />
      ))}
      {/* Second layer */}
      {Array.from({ length: 12 }).map((_, i) => (
        <ellipse
          key={`s${i}`}
          cx="30"
          cy="14"
          rx="2"
          ry="7"
          transform={`rotate(${i * 30 + 15} 30 30)`}
          opacity={0.4}
        />
      ))}
      {/* Center disk */}
      <circle cx="30" cy="30" r="7" opacity={0.55} />
      <circle cx="30" cy="30" r="4" opacity={0.65} />
      <circle cx="30" cy="30" r="2" opacity={0.75} />
    </Svg>
  ),

  'hydrangea-head': ({ width, height, className, style, title }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 80} height={height} className={className} style={style} title={title}>
      {/* Cluster of small 4-petal flowers */}
      {/* Flower 1 */}
      <circle cx="20" cy="16" r="3" opacity={0.5} />
      <path d="M20 13v6M17 16h6" strokeWidth={0.8} opacity={0.4} />
      {/* Flower 2 */}
      <circle cx="32" cy="14" r="2.5" opacity={0.45} />
      <path d="M32 12v4M30 14h4" strokeWidth={0.7} opacity={0.35} />
      {/* Flower 3 */}
      <circle cx="42" cy="18" r="3" opacity={0.5} />
      <path d="M42 15v6M39 18h6" strokeWidth={0.8} opacity={0.4} />
      {/* Flower 4 */}
      <circle cx="14" cy="28" r="2.5" opacity={0.45} />
      <path d="M14 26v4M12 28h4" strokeWidth={0.7} opacity={0.35} />
      {/* Flower 5 - center */}
      <circle cx="28" cy="26" r="3.5" opacity={0.55} />
      <path d="M28 23v6M25 26h6" strokeWidth={0.8} opacity={0.45} />
      {/* Flower 6 */}
      <circle cx="40" cy="28" r="2.5" opacity={0.45} />
      <path d="M40 26v4M38 28h4" strokeWidth={0.7} opacity={0.35} />
      {/* Flower 7 */}
      <circle cx="22" cy="38" r="3" opacity={0.5} />
      <path d="M22 35v6M19 38h6" strokeWidth={0.8} opacity={0.4} />
      {/* Flower 8 */}
      <circle cx="34" cy="36" r="2.5" opacity={0.45} />
      <path d="M34 34v4M32 36h4" strokeWidth={0.7} opacity={0.35} />
      {/* Flower 9 */}
      <circle cx="44" cy="36" r="2" opacity={0.4} />
      <circle cx="28" cy="46" r="2.5" opacity={0.45} />
      <circle cx="38" cy="44" r="2" opacity={0.4} />
    </Svg>
  ),
  /* ===== Vintage & Budaya Indonesia ===== */
  'newspaper-rule': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 140 24" width={width ?? 240} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M4 8h132M4 16h132" />
      <path d="M62 4l8 8-8 8-8-8z" opacity={0.7} />
      <circle cx="70" cy="12" r="2.5" fill="var(--oa-accent)" stroke="none" />
      <path d="M70 2v4M70 18v4" />
    </Svg>
  ),
  'batik-parang': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 120 48" width={width ?? 200} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M10 40C26 24 18 12 34 8c-8 8 0 18-6 26M40 40C56 24 48 12 64 8c-8 8 0 18-6 26M70 40C86 24 78 12 94 8c-8 8 0 18-6 26M100 40C116 24 108 12 124 8c-8 8 0 18-6 26" opacity={0.7} />
      <path d="M18 44c6-10 2-18 12-22M48 44c6-10 2-18 12-22M78 44c6-10 2-18 12-22M108 44c6-10 2-18 12-22" opacity={0.4} />
      <circle cx="34" cy="20" r="2" fill="var(--oa-accent)" stroke="none" opacity={0.8} />
      <circle cx="94" cy="20" r="2" fill="var(--oa-accent)" stroke="none" opacity={0.8} />
    </Svg>
  ),
  'wayang': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 60 80" width={width ?? 70} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M30 6c10 0 16 8 16 18 0 8-4 12-4 18 0 6 6 8 6 16H16c0-8 6-10 6-16 0-6-4-10-4-18 0-10 6-18 16-18z" opacity={0.65} />
      <path d="M30 22v34M22 40h16" opacity={0.4} />
      <path d="M14 70h32" />
      <circle cx="30" cy="40" r="3.5" fill="var(--oa-accent)" stroke="none" opacity={0.85} />
    </Svg>
  ),
  'om-symbol': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 60 60" width={width ?? 70} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M30 44c-8 0-14-5-14-13 0-8 7-13 15-13 6 0 11 3 13 9" />
      <path d="M30 18c-7 0-12 5-12 11" opacity={0.7} />
      <path d="M44 26c2 6-1 12-7 14" opacity={0.7} />
      <path d="M22 48c4 4 10 5 16 3" />
      <circle cx="30" cy="44" r="2.4" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'cross': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 40 60" width={width ?? 50} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M20 6v48M8 22h24" />
      <path d="M14 6h12v10H14z" opacity={0.5} />
      <circle cx="20" cy="14" r="2.4" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'lantern': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 50 70" width={width ?? 56} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M25 4v6M18 10h14v6M14 16c0 14 0 22 0 30M36 16c0 14 0 22 0 30M14 46h22v6M18 52h14v8" />
      <path d="M25 60v6" />
      <path d="M16 22h18M16 30h18M16 38h18" opacity={0.4} />
      <circle cx="25" cy="33" r="3" fill="var(--oa-accent)" stroke="none" opacity={0.9} />
    </Svg>
  ),
  'naga': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 120 40" width={width ?? 200} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M6 28c10-16 22 8 32-4s20 14 30 2 18 12 26 2" />
      <path d="M6 28c4-4 8-2 10 2M112 26l8-6-2 10" opacity={0.7} />
      <circle cx="10" cy="26" r="2.2" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'stupa': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 60 70" width={width ?? 64} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M30 4c4 4 4 8 0 12M22 18h16l-4 8h-8zM18 30h24l-4 8h-16zM14 42h32l-5 10H19zM10 56h40" />
      <path d="M22 64h16" />
      <circle cx="30" cy="8" r="2.4" fill="var(--oa-accent)" stroke="none" opacity={0.9} />
    </Svg>
  ),
  'islamic-geometric': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 80" width={width ?? 90} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M40 6l34 20v28L40 74 6 54V26z" opacity={0.7} />
      <path d="M40 18l22 13v18L40 62 18 49V31z" opacity={0.45} />
      <path d="M40 30l10 6v8l-10 6-10-6v-8z" fill="var(--oa-accent)" stroke="var(--oa-accent)" opacity={0.85} />
    </Svg>
  ),
  'masjid-dome': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 70" width={width ?? 90} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M40 8c14 0 22 10 22 22 0 6-2 10-2 14H20c0-4-2-8-2-14 0-12 8-22 22-22z" opacity={0.7} />
      <path d="M40 4v6M30 30h20" />
      <path d="M16 44h48v8H16zM24 52v10M40 52v10M56 52v10" />
      <circle cx="40" cy="6" r="2.4" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'church-window': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 60 80" width={width ?? 60} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M30 6c12 0 18 10 18 22v46H12V28C12 16 18 6 30 6z" opacity={0.7} />
      <path d="M30 16v46M18 40h24M22 30l8 8 8-8" opacity={0.5} />
      <circle cx="30" cy="14" r="2.6" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'hindu-mandala': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 80" width={width ?? 90} height={height} className={className} style={style} title={title} accent={accent}>
      <circle cx="40" cy="40" r="30" opacity={0.6} />
      <circle cx="40" cy="40" r="20" opacity={0.45} />
      <path d="M40 10v60M10 40h60M18 18l44 44M62 18L18 62" opacity={0.35} />
      <circle cx="40" cy="40" r="8" fill="var(--oa-accent)" stroke="var(--oa-accent)" opacity={0.85} />
    </Svg>
  ),
  'buddha-wheel': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 60" width={width ?? 90} height={height} className={className} style={style} title={title} accent={accent}>
      <circle cx="40" cy="30" r="22" opacity={0.7} />
      <path d="M40 8v44M22 30h36M27 14l26 32M53 14L27 46" opacity={0.5} />
      <path d="M16 52h48" />
      <circle cx="40" cy="30" r="3" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'jawa-gunungan': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 70 80" width={width ?? 70} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M35 6c14 6 22 22 22 40 0 14-10 22-22 28-12-6-22-14-22-28 0-18 8-34 22-40z" opacity={0.7} />
      <path d="M35 24v44M24 44h22" opacity={0.4} />
      <circle cx="35" cy="40" r="3" fill="var(--oa-accent)" stroke="none" opacity={0.9} />
    </Svg>
  ),
  'batak-ulos': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 50" width={width ?? 100} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M10 8h60v34H10z" opacity={0.6} />
      <path d="M10 16h60M10 34h60M22 8v34M58 8v34" opacity={0.4} />
      <path d="M30 16l10 9 10-9M30 34l10-9 10 9" opacity={0.5} />
      <path d="M40 8v34" stroke="var(--oa-accent)" opacity={0.7} />
    </Svg>
  ),
  'sunda-kebat': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 90 40" width={width ?? 110} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M8 20c10-12 24-12 37 0s32 12 37 0" opacity={0.7} />
      <path d="M8 28c10-12 24-12 37 0s32 12 37 0" opacity={0.4} />
      <circle cx="45" cy="20" r="3.4" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'minang-gadang': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 70" width={width ?? 90} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M40 6l8 14h-4l6 12h-5l5 12h-5l5 12H20l5-12h-5l5-12h-5l6-12h-4z" opacity={0.65} />
      <path d="M40 6l8 14h-4l6 12h-5l5 12h-5l5 12H20l5-12h-5l5-12h-5l6-12h-4z" opacity={0.3} transform="translate(0 2)" />
      <path d="M16 66h48" />
      <circle cx="40" cy="6" r="2.4" fill="var(--oa-accent)" stroke="none" />
    </Svg>
  ),
  'papua-asmat': ({ width, height, className, style, title, accent }) => (
    <Svg viewBox="0 0 80 60" width={width ?? 100} height={height} className={className} style={style} title={title} accent={accent}>
      <path d="M40 8c10 6 14 18 14 28 0 10-6 16-14 16s-14-6-14-16c0-10 4-22 14-28z" opacity={0.7} />
      <path d="M28 28h24M40 16v32M32 22l16 16M48 22L32 38" opacity={0.45} />
      <circle cx="40" cy="22" r="2.6" fill="var(--oa-accent)" stroke="none" opacity={0.9} />
    </Svg>
  )
};

export function OrnamentArt({ ornament, width, height, className, style, title, accent }: OrnamentSvgProps & { ornament: OrnamentKey }) {
  const Comp = ORNAMENT_COMPONENTS[ornament] ?? ORNAMENT_COMPONENTS.flourish;
  return Comp({ width, height, className, style, title, accent });
}