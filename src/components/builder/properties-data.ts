import type { BlockProps, BlockStyle, BlockType, Theme } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* DATA & FUNGSI MURNI PANEL PROPERTI                                  */
/* Diekstrak dari properties-panel.tsx tanpa perubahan perilaku.       */
/* Hanya konstanta/array/fungsi murni — tanpa komponen/state/JSX.      */
/* ------------------------------------------------------------------ */

/** Grid 9-titik untuk atur posisi foto (object-position) — efisien & konsisten di semua blok foto. */
export const POSITION_POINTS = [
  'top left', 'top center', 'top right',
  'center left', 'center', 'center right',
  'bottom left', 'bottom center', 'bottom right'
] as const;

export function normalizePosition(v: string): string {
  const s = (v || '').toLowerCase();
  if (s.includes('top') && s.includes('left')) return 'top left';
  if (s.includes('top') && s.includes('right')) return 'top right';
  if (s.includes('bottom') && s.includes('left')) return 'bottom left';
  if (s.includes('bottom') && s.includes('right')) return 'bottom right';
  if (s.includes('top')) return 'top center';
  if (s.includes('bottom')) return 'bottom center';
  if (s.includes('left')) return 'center left';
  if (s.includes('right')) return 'center right';
  return 'center';
}

export function positionToPerc(pos: string): { x: number; y: number } {
  const s = (pos || '').toLowerCase();
  if (s.includes('top') && s.includes('left')) return { x: 0, y: 0 };
  if (s.includes('top') && s.includes('right')) return { x: 100, y: 0 };
  if (s.includes('bottom') && s.includes('left')) return { x: 0, y: 100 };
  if (s.includes('bottom') && s.includes('right')) return { x: 100, y: 100 };
  if (s.includes('top')) return { x: 50, y: 0 };
  if (s.includes('bottom')) return { x: 50, y: 100 };
  if (s.includes('left')) return { x: 0, y: 50 };
  if (s.includes('right')) return { x: 100, y: 50 };
  // Try percentage parsing
  const nums = s.match(/[\d.]+/g);
  if (nums && nums.length >= 2) return { x: parseFloat(nums[0]), y: parseFloat(nums[1]) };
  return { x: 50, y: 50 };
}

export function percToPosition(px: number, py: number): string {
  const snap = 15;
  if (Math.abs(px - 50) <= snap && Math.abs(py - 50) <= snap) return 'center';
  if (Math.abs(px - 50) <= snap && py <= snap) return 'top center';
  if (Math.abs(px - 50) <= snap && py >= 100 - snap) return 'bottom center';
  if (px <= snap && Math.abs(py - 50) <= snap) return 'center left';
  if (px >= 100 - snap && Math.abs(py - 50) <= snap) return 'center right';
  if (px <= snap && py <= snap) return 'top left';
  if (px >= 100 - snap && py <= snap) return 'top right';
  if (px <= snap && py >= 100 - snap) return 'bottom left';
  if (px >= 100 - snap && py >= 100 - snap) return 'bottom right';
  return `${Math.round(px)}% ${Math.round(py)}%`;
}

export const FONTS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Montserrat',
  'Quicksand',
  'Cinzel',
  'Marcellus',
  'Great Vibes',
  'Lora',
  'Jost',
  'Poppins',
  'Nunito Sans',
  'Inter',
  'Lato',
  'Karla',
  'Dancing Script',
  'Caveat',
  'Pacifico',
  'Raleway',
  'DM Serif Display',
  'EB Garamond',
  'Alex Brush',
  'Parisienne',
  'Allura',
  'Tangerine',
  'Satisfy',
  'Cookie',
  'Bad Script',
  'Pinyon Script',
  'Sacramento',
  'Amatic SC',
  'Bebas Neue',
  'Oswald',
  'Roboto Condensed',
  'Work Sans',
  'Source Serif 4',
  'Libre Baskerville',
  'Merriweather',
  'Bodoni Moda',
  'Prata',
  'Playfair Display SC',
  'Josefin Sans',
  'Cormorant Infant',
  'Cormorant Upright',
  'Tenor Sans',
  'Spectral',
  'Fraunces',
  'Yeseva One',
  'Cardo'
];

export const TITLE_PROPS: Record<string, { label: string; multiline?: boolean; url?: boolean; labelText?: string }[]> = {
  Hero: [
    { label: 'caption' },
    { label: 'groom' },
    { label: 'bride' },
    { label: 'date' },
    { label: 'place' },
    { label: 'bg_image' }
  ],
  Couple: [
    { label: 'introduction', multiline: true },
    { label: 'bismillah', multiline: true },
    { label: 'groom' },
    { label: 'groom_parents' },
    { label: 'bride' },
    { label: 'bride_parents' },
    { label: 'quote', multiline: true }
  ],
  Countdown: [{ label: 'title' }, { label: 'target_date' }],
  Story: [{ label: 'title' }, { label: 'subtitle' }],
  EventDetail: [
    { label: 'title' },
    { label: 'date' },
    { label: 'time' },
    { label: 'location' },
    { label: 'address', multiline: true },
    { label: 'maps_url', url: true, labelText: 'Link Google Maps' },
    { label: 'live_url', url: true, labelText: 'Link Siaran Langsung' }
  ],
  Gallery: [{ label: 'title' }],
  RSVP: [
    { label: 'title' },
    { label: 'note', multiline: true },
    { label: 'button_text' },
    { label: 'success_message', multiline: true }
  ],
  Envelope: [{ label: 'title' }, { label: 'note', multiline: true }],
  GiftList: [{ label: 'title' }, { label: 'note', multiline: true }],
  Maps: [{ label: 'title' }, { label: 'address' }, { label: 'embed_url', url: true, labelText: 'Link Google Maps' }],
  Thanks: [
    { label: 'title' },
    { label: 'message', multiline: true },
    { label: 'closing' },
    { label: 'names' }
  ],
  Divider: [],
  Text: [{ label: 'text', multiline: true }],
  Photo: [{ label: 'image' }, { label: 'caption' }],
  Quote: [
    { label: 'religion', labelText: 'Agama (untuk preset kutipan)' },
    { label: 'original', multiline: true, labelText: 'Teks Asli / Ayat' },
    { label: 'latin', multiline: true, labelText: 'Latin / Bacaan' },
    { label: 'translation', multiline: true, labelText: 'Terjemahan' },
    { label: 'reference', labelText: 'Referensi' }
  ],
  LiveStreaming: [{ label: 'title' }, { label: 'stream_url', url: true, labelText: 'Link YouTube/Vimeo' }, { label: 'note', multiline: true }],
  Watermark: [{ label: 'text', labelText: 'Teks Awal' }, { label: 'brand', labelText: 'Nama Brand' }, { label: 'url', url: true, labelText: 'URL (klik)' }],
  Popup: [
    { label: 'button_text', labelText: 'Teks Tombol' },
    { label: 'title', labelText: 'Judul Popup' },
    { label: 'mode', labelText: 'Mode: content | image | link' },
    { label: 'content', multiline: true, labelText: 'Isi Teks' },
    { label: 'image', labelText: 'URL Gambar (mode image)' },
    { label: 'link_url', url: true, labelText: 'URL Tautan (mode link)' }
  ],
  CopyText: [
    { label: 'title', labelText: 'Judul' },
    { label: 'note', multiline: true, labelText: 'Catatan' },
    { label: 'text_to_copy', multiline: true, labelText: 'Teks yang Disalin' },
    { label: 'button_text', labelText: 'Teks Tombol' }
  ],
  Empty: []
};

export const VARIANTS: Partial<Record<string, { key: string; options: string[] }>> = {
  Hero: { key: 'variant', options: ['center', 'left'] },
  Couple: { key: 'variant', options: ['vertical', 'side', 'card', 'elegant', 'minimal'] },
  Countdown: { key: 'variant', options: ['circles', 'cards', 'line'] },
  EventDetail: { key: 'variant', options: ['card', 'band'] },
  Divider: { key: 'variant', options: ['line', 'dots', 'diamond', 'hearts', 'leaves'] },
  Thanks: { key: 'variant', options: ['center', 'elegant', 'minimal'] },
  Quote: { key: 'variant', options: ['center', 'card'] },
  Text: { key: 'variant', options: ['plain', 'card', 'accent'] },
  Story: { key: 'variant', options: ['timeline', 'cards', 'minimal'] },
  Maps: { key: 'variant', options: ['full', 'card'] },
  LiveStreaming: { key: 'variant', options: ['full', 'minimal'] },
  RSVP: { key: 'variant', options: ['centered', 'card', 'minimal'] },
  Envelope: { key: 'variant', options: ['standard', 'minimal'] },
  GiftList: { key: 'variant', options: ['grid', 'list'] },
};

export const GALLERY_LAYOUTS: { key: string; label: string; desc: string }[] = [
  { key: 'grid', label: 'Grid', desc: 'Susunan kolom 2 dengan foto besar' },
  { key: 'grid3', label: 'Grid 3 Kolom', desc: 'Kolom 3 dengan foto persegi rapi' },
  { key: 'masonry', label: 'Masonry', desc: 'Kolom menurun dengan tinggi beragam' },
  { key: 'mosaic', label: 'Kolase', desc: 'Kuadran mosaik dengan foto besar pertama' },
  { key: 'polaroid', label: 'Polaroid', desc: 'Foto dengan bingkai seperti foto kenangan' },
  { key: 'arch', label: 'Lengkung (Arch)', desc: 'Foto utama lengkung atas — ikonik undangan Indonesia' },
  { key: 'column', label: 'Ke Bawah', desc: 'Foto tersusun menurun penuh lebar' },
  { key: 'bento', label: 'Bento Grid', desc: 'Grid bervariasi seperti Apple Photo layout' },
  { key: 'hero-grid', label: 'Hero + Grid', desc: 'Foto pertama hero, sisanya grid' },
  { key: 'carousel', label: 'Carousel Otomatis', desc: 'Slide otomatis satu per satu dengan efek animasi' },
  { key: 'filmstrip', label: 'Filmstrip', desc: 'Foto tersusun horizontal seperti gulungan film' },
  { key: 'stack', label: 'Tumpuk', desc: 'Foto bertumpuk dengan efek kedalaman' }
];

export const GALLERY_ANIMATIONS = [
  ['fade', 'Fade'],
  ['zoom', 'Zoom In'],
  ['zoom-out', 'Zoom Out'],
  ['slide-left', 'Slide Kiri'],
  ['slide-right', 'Slide Kanan'],
  ['slide-up', 'Slide Atas'],
  ['slide-down', 'Slide Bawah'],
  ['flip', 'Flip 3D'],
  ['flip-x', 'Flip Vertikal'],
  ['blur', 'Blur'],
  ['rise', 'Muncul Naik'],
  ['swing', 'Ayun'],
  ['pop', 'Pop'],
  ['ken-burns', 'Ken Burns'],
  ['drop', 'Drop'],
  ['reveal', 'Reveal Kanan'],
  ['reveal-up', 'Reveal Atas'],
  ['rotate', 'Rotate'],
  ['shrink', 'Shrink'],
  ['blur-up', 'Blur + Naik']
] as const;

export const GRADIENTS: { name: string; value: string }[] = [
  { name: 'Emerald Khaki', value: 'linear-gradient(160deg, #046A38 0%, #B5A27C 60%, #F7F5EF 130%)' },
  { name: 'Emerald Muda', value: 'linear-gradient(160deg, #7C9885 0%, #A9B7A6 55%, #F7F6F2 130%)' },
  { name: 'Gold Muda', value: 'linear-gradient(160deg, #D4AF37 0%, #FAF6EF 70%, #F7F5EF 130%)' },
  { name: 'Biru Malam', value: 'linear-gradient(160deg, #1F3A5F 0%, #C9A227 120%)' },
  { name: 'Sage Hijau', value: 'linear-gradient(160deg, #324F43 0%, #A9C5B4 100%)' },
  { name: 'Bali Tropis', value: 'linear-gradient(160deg, #2F5D50 0%, #C77B4E 100%)' },
  { name: 'Terracotta', value: 'linear-gradient(160deg, #B0413E 0%, #F6D365 120%)' },
  { name: 'Olive', value: 'linear-gradient(160deg, #606C38 0%, #DDA15E 120%)' }
];

/** Generate gradient presets based on theme colors */
export function makeThemeGradients(primary: string, secondary: string, background: string): { name: string; value: string }[] {
  return [
    { name: 'Primer → Sekunder', value: `linear-gradient(160deg, ${primary} 0%, ${secondary} 100%)` },
    { name: 'Primer → Latar', value: `linear-gradient(160deg, ${primary} 0%, ${background} 120%)` },
    { name: 'Sekunder → Latar', value: `linear-gradient(160deg, ${secondary} 0%, ${background} 100%)` },
    { name: 'Latar → Primer', value: `linear-gradient(160deg, ${background} 0%, ${primary} 120%)` },
    { name: 'Primer solid', value: `linear-gradient(160deg, ${primary} 0%, ${primary} 100%)` },
    { name: 'Sekunder solid', value: `linear-gradient(160deg, ${secondary} 0%, ${secondary} 100%)` },
  ];
}


/* ------------------------------------------------------------------ */
/* BLOCK QUICK STYLES — preset look cepat per jenis blok.              */
/* Hanya memakai keys `BlockStyle` (bgColor/bgGradient/border/radius/  */
/* boxShadow/padding/textAlign/textColor) + props.variant bila perlu.  */
/* ------------------------------------------------------------------ */
export interface QuickStylePreset {
  label: string;
  desc: string;
  /** Warna untuk chip preview (gambaran visual preset). */
  swatch: string[];
  /** Override style section (keys BlockStyle yang sudah ada). */
  style: Partial<BlockStyle>;
  /** Override layout/variant blok bila preset ikut mengubah varian. */
  props?: Partial<BlockProps>;
}

/** Buka opacity 12% dari warna hex (#RRGGBB → #RRGGBB1F). */
export function tint(hex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}1F` : hex;
}

/** Preset "Gaya" default untuk semua section (Lembut / Bold / Mewah / Ruang). */
export function generalQuickStyles(theme: Theme): QuickStylePreset[] {
  const { primary, secondary } = theme;
  return [
    {
      label: 'Lembut',
      desc: 'Radius & bayangan lembut',
      swatch: ['#f7f2e9', '#c9a45c'],
      style: {
        bgColor: '#f7f2e9',
        borderRadius: '24px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.07)',
        padding: '48px 24px',
        textAlign: 'center'
      }
    },
    {
      label: 'Bold',
      desc: 'Tegas dengan warna utama',
      swatch: [primary, '#ffffff'],
      style: {
        bgColor: primary,
        textColor: '#ffffff',
        borderRadius: '16px',
        padding: '56px 24px',
        textAlign: 'center'
      }
    },
    {
      label: 'Mewah',
      desc: 'Gradien emas & bingkai elegan',
      swatch: [primary, secondary, '#c9a45c'],
      style: {
        bgGradient: `linear-gradient(160deg, ${primary} 0%, ${secondary} 100%)`,
        border: '2px solid #c9a45c',
        borderRadius: '0px',
        padding: '64px 28px',
        textColor: '#ffffff',
        boxShadow: '0 18px 44px rgba(0,0,0,0.18)'
      }
    },
    {
      label: 'Ruang',
      desc: 'Legak, lapang & bersih',
      swatch: ['#ffffff', '#8a7a66'],
      style: {
        bgColor: '#ffffff',
        borderRadius: '28px',
        padding: '96px 28px',
        boxShadow: '0 16px 48px rgba(0,0,0,0.05)',
        textAlign: 'center'
      }
    }
  ];
}

/**
 * Daftar preset "Gaya" untuk blok terpilih. Countdown & EventDetail ikut
 * mengubah varian layout (lingkaran/kotak/garis & kartu/pita), sisanya memakai
 * presets umum section.
 */
export function blockQuickStyles(type: BlockType, theme: Theme): QuickStylePreset[] {
  const { primary, secondary } = theme;
  if (type === 'Countdown') {
    return [
      {
        label: 'Lingkaran',
        desc: 'Varian lingkaran, latar tinted',
        swatch: [tint(primary), primary],
        props: { variant: 'circles' },
        style: { padding: '48px 24px', borderRadius: '28px', bgColor: tint(primary), textAlign: 'center' }
      },
      {
        label: 'Kotak',
        desc: 'Varian kartu/kotak tegas',
        swatch: [secondary, primary],
        props: { variant: 'cards' },
        style: { padding: '40px 20px', borderRadius: '20px', bgColor: secondary, textAlign: 'center' }
      },
      {
        label: 'Garis',
        desc: 'Varian garis tipis minimalis',
        swatch: ['#faf7f2', primary],
        props: { variant: 'line' },
        style: { padding: '32px 16px', borderRadius: '0px', textAlign: 'center' }
      }
    ];
  }
  if (type === 'EventDetail') {
    return [
      {
        label: 'Kartu',
        desc: 'Varian kartu dengan bingkai emas',
        swatch: ['#ffffff', '#c9a45c'],
        props: { variant: 'card' },
        style: { bgColor: '#ffffff', border: '2px solid #c9a45c', borderRadius: '20px', padding: '40px 24px', textAlign: 'center' }
      },
      {
        label: 'Pita',
        desc: 'Varian pita gradien penuh',
        swatch: [primary, secondary, '#ffffff'],
        props: { variant: 'band' },
        style: {
          bgGradient: `linear-gradient(160deg, ${primary} 0%, ${secondary} 120%)`,
          textColor: '#ffffff',
          borderRadius: '0px',
          padding: '56px 24px',
          textAlign: 'center'
        }
      },
      {
        label: 'Ruang',
        desc: 'Legak & lapang untuk detail',
        swatch: ['#ffffff', '#8a7a66'],
        style: { bgColor: '#ffffff', borderRadius: '28px', padding: '88px 28px', boxShadow: '0 16px 48px rgba(0,0,0,0.05)', textAlign: 'center' }
      }
    ];
  }
  return generalQuickStyles(theme);
}

/** Apakah preset sama dengan style+props blok saat ini (untuk indikasi aktif). */
export function isQuickPresetActive(preset: QuickStylePreset, style: BlockStyle | undefined, props: BlockProps | undefined): boolean {
  const current = style ?? {};
  for (const key of Object.keys(preset.style) as (keyof BlockStyle)[]) {
    if (current[key] !== preset.style[key]) return false;
  }
  for (const key of Object.keys(preset.props ?? {}) as (keyof BlockProps)[]) {
    if (props?.[key] !== preset.props?.[key]) return false;
  }
  return true;
}

export const SECTION_TRIGGERS: { value: string; label: string }[] = [
  { value: '', label: 'Mulai di awal halaman' },
  { value: 'Hero', label: 'Saat masuk Hero' },
  { value: 'Couple', label: 'Saat masuk Mempelai' },
  { value: 'EventDetail', label: 'Saat masuk Detail Acara' },
  { value: 'Story', label: 'Saat masuk Our Story' },
  { value: 'Gallery', label: 'Saat masuk Galeri' },
  { value: 'Maps', label: 'Saat masuk Maps' },
  { value: 'Thanks', label: 'Saat masuk Penutup' }
];

export const DECOR_SHAPES: { key: string; label: string }[] = [
  { key: 'circle', label: 'Bulat' },
  { key: 'square', label: 'Kotak' },
  { key: 'triangle', label: 'Segitiga' },
  { key: 'star', label: 'Bintang' },
  { key: 'heart', label: 'Hati' },
  { key: 'leaf', label: 'Daun' },
  { key: 'diamond', label: 'Ketupat' },
  { key: 'ring', label: 'Cincin' }
];

export const DECOR_PHOTO_SHAPES = [
  { key: 'square', label: 'Persegi' },
  { key: 'rounded', label: 'Sudut Bulat' },
  { key: 'circle', label: 'Bulat' },
  { key: 'miring', label: 'Miring' }
];

export function humanize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parsePx(v?: string) {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}
