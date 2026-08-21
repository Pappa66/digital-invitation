export type BlockType =
  | 'Hero'
  | 'Couple'
  | 'Countdown'
  | 'EventDetail'
  | 'Story'
  | 'Gallery'
  | 'RSVP'
  | 'Envelope'
  | 'Maps'
  | 'Thanks'
  | 'Divider'
  | 'Text'
  | 'Photo'
  | 'GiftList'
  | 'Quote'
  | 'LiveStreaming'
  | 'Watermark'
  | 'Popup'
  | 'CopyText'
  | 'Empty';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  font_heading: string;
  font_body: string;
  layout: 'center' | 'left' | 'right';
  hero_style: 'image' | 'solid' | 'gradient';
  /**
   * Bingkai dekoratif mengelilingi undangan (mode stack).
   * 'none' | 'classic' | 'double' | 'corner' | 'arch' | 'floral' | 'thick' | 'dashed' | 'ornate'.
   */
  frame?: string;
  /**
   * Tampilkan tiap section sebagai kartu berdampingan (gaya card-template,
   * seperti webvitation Simple Rustic). Hero tetap penuh layar.
   */
  card_style?: boolean;
  /**
   * Gaya visual kartu: 'shadow' | 'outline' | 'glass' | 'minimal' | 'elevated' | 'flat'
   */
  card_variant?: string;
  /**
   * Animasi masuk kartu: 'fade' | 'slide' | 'zoom' | 'blur' | 'rise'
   */
  card_entrance?: string;
  /**
   * Ornamen dekoratif (SVG library) untuk section pengantar/sepanjang undangan.
   * Nilai: kunci di ornaments.tsx (mis. 'flourish', 'eucalyptus', 'rose-branch').
   * Kosong (default) = ornamen klasik hati-lama dipakai.
   */
  ornament?: string;
}

export interface Settings {
  music_url: string;
  guest_book_enabled: boolean;
  /** Tampilkan bagian Absensi Kehadiran (QR check-in) pada undangan. */
  checkin_enabled?: boolean;
  /** Agama undangan (untuk templating ucapan & wording). Default: 'islam'. */
  religion?: string;
  /** Putar otomatis saat halaman terbuka / section trigger tampil. Default: true. */
  music_autoplay?: boolean;
  /** Mulai musik dari detik ke-N (offset, detik). Default: 0. */
  music_offset_sec?: number;
  /** Mulai musik saat pengunjung masuk section tertentu (nilai BlockType). Kosong = mulai di awal. */
  music_on_section?: string;
  /** Tampilkan info meja & kursi setelah check-in. */
  show_seat_info?: boolean;
  /** Label meja untuk info seat. */
  table_label?: string;
  /** Label kursi untuk info seat. */
  seat_label?: string;
  /** Tampilkan cover fullscreen "Buka Undangan" sebelum konten. Default: true. */
  show_cover?: boolean;
  /** Teks sapaan di cover (misal: "Kepada Yth."). */
  cover_greeting?: string;
  /** Teks tombol "Buka Undangan". */
  cover_button_text?: string;
  /** Background image cover (terpisah dari Hero bg_image). */
  cover_bg_image?: string;
  /** Harga dasar undangan (Rp). */
  base_price?: number;
  /** Diskon persen (0-100). */
  discount_percent?: number;
  /** Kode promo aktif. */
  promo_code?: string;
  /** Masa berlaku promo (ISO date string). */
  promo_expires_at?: string;
  /** Tampilkan area pricing di landing page. */
  show_pricing?: boolean;
}

/** Rekening bank / e-wallet untuk amplop online. */
export interface BankAccount {
  bank_name: string;
  account_number: string;
  account_holder: string;
}

/** Nilai prop blok. PERMISSIVE: konten blok terus berkembang, nilai apa pun
 * yang aman dirender React diterima (string/number/boolean/null/array/object).
 * Validator (src/lib/validations.ts) menerima union yang sama. */
export interface BlockProps {
  [key: string]:
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | BankAccount[]
    | Record<string, unknown>
    | unknown[]
    | null
    | undefined;
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
  /** Font override per elemen teks. Kunci = `${prop}` atau `${prop}.${index}`. Value = nama font (Google Fonts). */
  textFonts?: Record<string, string>;
  bgColor?: string;
  /** Gradien latar section (CSS background, mis. "linear-gradient(160deg, #046A38, #B5A27C)"). Didahulukan dari bgColor. */
  bgGradient?: string;
  bgImage?: string;
  /** Cara menyesuaikan gambar latar. Default: 'cover'. */
  bgFit?: 'cover' | 'contain';
  /** Posisi gambar latar (sumbu utama). Default: 'center'. */
  bgPosition?: string;
  /** Radius sudut section (CSS, mis. "24px"). */
  borderRadius?: string;
  /** Border sekeliling section (CSS, mis. "2px solid #c9a45c"). */
  border?: string;
  /** Bayangan section (CSS box-shadow). */
  boxShadow?: string;
  /** Padding dalam section (CSS shorthand, mis. "48px 24px"). */
  padding?: string;
  /** Opacity section 0–1. */
  opacity?: number;
  /** Perataan teks section. */
  textAlign?: 'left' | 'center' | 'right';
  /** Animasi masuk section ini (override theme.card_entrance). 'none' = tanpa animasi. */
  entrance?: 'fade' | 'slide' | 'zoom' | 'blur' | 'rise' | 'flip3d' | 'parallax' | 'stagger' | 'float' | 'none';
  /** Tunda animasi masuk (ms). */
  entranceDelay?: number;
  /** Sembunyikan blok pada perangkat tertentu (responsive). Array device hsl. */
  hideOn?: ('mobile' | 'tablet' | 'desktop')[];
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
  kind: 'shape' | 'text' | 'image' | 'ornament';
  x: number;
  y: number;
  opacity?: number;
  rotation?: number;
  /** Balik horizontal (scaleX -1). */
  flipX?: boolean;
  /** Balik vertikal (scaleY -1). */
  flipY?: boolean;
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
  // ornament (SVG library)
  ornament?: string;
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
  /** Pilihan menu tamu (mis. kuliner utamanya). */
  meal_choice?: string | null;
  /** Detail pilihan menu per kursi/kolom jika memakai menu multi-bagian. */
  menu_options?: { label: string; value: string }[] | null;
  /** Token personal untuk QR absen (check-in hari-H tanpa login). */
  checkin_token?: string | null;
}

/** Check-in kehadiran hari-H dari QR absensi. */
export interface Checkin {
  id: string;
  project_id: string;
  name: string;
  guest_count: number;
  created_at: string;
}

export interface TemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  primary: string;
  secondary: string;
  show_as_demo?: boolean;
  demo_order?: number;
}

/** Metadata demo template yang diatur admin (gambar + link per template). */
export interface TemplateDemo {
  template_id: string;
  demo_image: string | null;
  demo_link: string | null;
  /** Nomor urut tampilan kartu (01, 02, ...). NULL = fallback urutan katalog. */
  demo_number?: number | null;
  /** Nama tampil pada kartu. NULL = nama resmi template (index.json). */
  demo_name?: string | null;
}

/** Status pengerjaan client (management dashboard). */
export type ClientStatus = 'aktual' | 'proses' | 'selesai';

/** Data client persisten (tabel `clients`, milik satu owner). */
export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  project_id: string | null;
  design_name: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
}

/** Client lengkap dengan info project terkait (untuk tampilan dashboard). */
export interface ClientWithProject extends Client {
  project_title: string;
  project_slug: string;
  invitation_link: string;
}
