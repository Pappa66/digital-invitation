export type BlockType =
  | 'Hero'
  | 'Couple'
  | 'Countdown'
  | 'EventDetail'
  | 'Story'
  | 'Gallery'
  | 'RSVP'
  | 'Maps'
  | 'Thanks'
  | 'Divider'
  | 'Text'
  | 'Photo';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  font_heading: string;
  font_body: string;
  layout: 'center' | 'left' | 'right';
  hero_style: 'image' | 'solid' | 'gradient';
}

export interface Settings {
  music_url: string;
  guest_book_enabled: boolean;
  /** Agama undangan (untuk templating ucapan & wording). Default: 'islam'. */
  religion?: string;
  /** Putar otomatis saat halaman terbuka / section trigger tampil. Default: true. */
  music_autoplay?: boolean;
  /** Mulai musik dari detik ke-N (offset, detik). Default: 0. */
  music_offset_sec?: number;
  /** Mulai musik saat pengunjung masuk section tertentu (nilai BlockType). Kosong = mulai di awal. */
  music_on_section?: string;
}

/** Rekening bank / e-wallet untuk amplop online. */
export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

export interface BlockProps {
  [key: string]: string | number | boolean | string[] | BankAccount[] | undefined;
}

/** Posisi bebas blok pada kanvas (mode free positioning). Unit px. */
export interface BlockLayout {
  x: number;
  y: number;
  width: number;
}

/** Override tampilan per-section (teks, background warna/gambar). */
export interface BlockStyle {
  textColor?: string;
  /** Ukuran font override per elemen teks. Kunci = `${prop}` atau `${prop}.${index}`. Value = CSS fontSize (mis. "2rem"). */
  textSizes?: Record<string, string>;
  bgColor?: string;
  bgImage?: string;
  /** Cara menyesuaikan gambar latar. Default: 'cover'. */
  bgFit?: 'cover' | 'contain';
  /** Posisi gambar latar (sumbu utama). Default: 'center'. */
  bgPosition?: string;
}

/** Bentuk dekor support shape. */
export type DecorShapeKind = 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'leaf' | 'diamond' | 'ring';
/** Bentuk tampilan foto di asset gambar. */
export type PhotoDecorShape = 'square' | 'circle' | 'rounded' | 'tilt';

/**
 * Elemen dekor tambahan DI DALAM blok (special layer).
 * Posisi x/y relatif kiri-atas blok (px skala kanvas 420).
 * Ditaruh di atas/berlapis di atas konten bawaan blok.
 */
export interface DecorAsset {
  id: string;
  kind: 'shape' | 'text' | 'image';
  x: number;
  y: number;
  opacity?: number;
  rotation?: number;
  /** 0 = di belakang konten bawaan, 1+ = di depan. Default 0. */
  layer?: number;
  // shape
  shape?: DecorShapeKind;
  color?: string;
  size?: number;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  underline?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  // image
  imageUrl?: string;
  photoShape?: PhotoDecorShape;
  width?: number;
}

export interface Block {
  id: string;
  type: BlockType;
  props: BlockProps;
  /** Ada (diisi) hanya saat mode free positioning. */
  layout?: BlockLayout;
  /** Override warna/gambar untuk section ini. */
  style?: BlockStyle;
  /**
   * Posisi sub-elemen DI DALAM blok (offset px relatif ke kiri-atas blok).
   * Kunci = nama elemen (mis. `title`, `photo_left`). Diisi hanya saat
   * mode free positioning + elemen sudah digeser pengguna.
   */
  inner?: Record<string, { x: number; y: number }> | null;
  /** Layer dekor tambahan (shape/teks/gambar) di dalam blok. */
  decor?: DecorAsset[];
}

export interface CanvasData {
  theme: Theme;
  settings: Settings;
  blocks: Block[];
  /** Penataan kanvas: stack (vertikal) atau free (posisi bebas). Default: 'stack'. */
  flow?: 'stack' | 'free';
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectDesign {
  id: string;
  project_id: string;
  canvas_data: CanvasData;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDesign extends Project {
  design: ProjectDesign | null;
}

export interface Rsvp {
  id: string;
  project_id: string;
  name: string;
  attendance: 'hadir' | 'tidak' | 'ragu';
  guest_count: number;
  message: string | null;
  created_at: string;
}

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string;
  secondary: string;
}
