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
  | 'birds';

export const ORNAMENT_CATEGORIES: Record<string, { label: string; keys: OrnamentKey[] }> = {
  classic: { label: 'Klasik & Mewah', keys: ['flourish', 'corner-flourish', 'laurel', 'flourish-double', 'paisley'] },
  outdoor: { label: 'Outdoor & Natural', keys: ['eucalyptus', 'wildflower', 'lotus', 'birds'] },
  romance: { label: 'Romantis', keys: ['rose-branch', 'heart-swirl', 'celestial', 'paisley'] },
  modern: { label: 'Modern & Minimal', keys: ['arch-geometric', 'diamond-lines', 'celestial', 'flourish'] }
};

export const ORNAMENTS: { key: OrnamentKey; label: string; category: string }[] = [
  { key: 'flourish', label: 'Kembang Mekar', category: 'classic' },
  { key: 'corner-flourish', label: 'Sudut Mewah', category: 'classic' },
  { key: 'laurel', label: 'Laurel / Dahan', category: 'classic' },
  { key: 'flourish-double', label: 'Mekar Ganda', category: 'classic' },
  { key: 'paisley', label: 'Paisley', category: 'classic' },
  { key: 'eucalyptus', label: 'Daun Eucalyptus', category: 'outdoor' },
  { key: 'wildflower', label: 'Bunga Liar', category: 'outdoor' },
  { key: 'lotus', label: 'Teratai', category: 'outdoor' },
  { key: 'birds', label: 'Burung & Dahan', category: 'outdoor' },
  { key: 'rose-branch', label: 'Tangkai Mawar', category: 'romance' },
  { key: 'heart-swirl', label: 'Hati Berpilin', category: 'romance' },
  { key: 'celestial', label: 'Bintang & Bulan', category: 'romance' },
  { key: 'arch-geometric', label: 'Lengkung Modern', category: 'modern' },
  { key: 'diamond-lines', label: 'Belah Ketupat', category: 'modern' }
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
}

/** Ornamen dipakai sebagai pembagi / pengisi antar section. */
type Comp = (p: OrnamentSvgProps) => React.ReactNode;

function Svg({ viewBox, width = 24, height, className, style, title, children }: OrnamentSvgProps & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg
      width={width}
      height={height ?? width}
      viewBox={viewBox}
      className={className}
      style={style}
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
  )
};

export function OrnamentArt({ ornament, width, height, className, style, title }: OrnamentSvgProps & { ornament: OrnamentKey }) {
  const Comp = ORNAMENT_COMPONENTS[ornament] ?? ORNAMENT_COMPONENTS.flourish;
  return Comp({ width, height, className, style, title });
}