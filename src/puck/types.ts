/**
 * Kontrak data undangan (engine Puck, model ala Elementor).
 * Setiap blok punya `position`: default flow (vertikal), opsi absolute per elemen.
 */

export type PositionMode = 'flow' | 'absolute';

/** Animasi masuk saat section terlihat (guest). 'none' = tanpa animasi. */
export type EntranceKind = 'none' | 'fade' | 'slide' | 'zoom' | 'slideUp' | 'slideDown' | 'flip';

export interface Position {
  mode: PositionMode;
  x: number;
  y: number;
  width?: number | 'auto';
  rotation?: number;
  zIndex?: number;
}

export interface BaseBlockProps {
  position: Position;
  entrance?: EntranceKind;
  /** Override warna per-bagian (menurun sebagai CSS var ke elemen anak). */
  blockStyle?: BlockStyleLite;
}

/** Override warna per-bagian: teks, aksen (primary), latar. */
export interface BlockStyleLite {
  textColor?: string;
  accentColor?: string;
  bgColor?: string;
}

export interface HeroProps extends BaseBlockProps {
  caption: string;
  groom: string;
  bride: string;
  date: string;
  place?: string;
  bgImage?: string;
}

export interface CoupleProps extends BaseBlockProps {
  title: string;
  groom: string;
  groomParents?: string;
  groomPhoto?: string;
  bride: string;
  brideParents?: string;
  bridePhoto?: string;
}

export interface RsvpProps extends BaseBlockProps {
  title: string;
  note?: string;
  buttonText?: string;
}

/** Item acara (Akad/Resepsi/dll). */
export interface EventItem {
  label: string;
  date: string;
  time: string;
  place: string;
}

/** Satu gambar galeri. */
export interface GalleryImage {
  url: string;
  caption?: string;
}

export interface CountdownProps extends BaseBlockProps {
  title: string;
  targetDate: string;
}

export interface EventDetailProps extends BaseBlockProps {
  title: string;
  events: EventItem[];
}

export interface GalleryProps extends BaseBlockProps {
  title: string;
  images: GalleryImage[];
  /** Gaya tampilan galeri. */
  variant?: 'grid' | 'carousel' | 'masonry' | 'polaroid' | 'mosaic';
}

export interface StoryItem {
  year: string;
  title: string;
  description: string;
}

export interface StoryProps extends BaseBlockProps {
  title: string;
  items: StoryItem[];
}

export interface QuoteProps extends BaseBlockProps {
  text: string;
  source?: string;
}

export interface ThanksProps extends BaseBlockProps {
  title: string;
  message: string;
}

export interface MapsProps extends BaseBlockProps {
  title: string;
  address: string;
  embedUrl?: string;
}

/** Rekening/e-wallet untuk amplop online. */
export interface GiftAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface GiftListProps extends BaseBlockProps {
  title: string;
  accounts: GiftAccount[];
  address?: string;
}

export type DividerVariant = 'line' | 'dots' | 'diamond' | 'hearts' | 'leaves';

export interface DividerProps extends BaseBlockProps {
  variant: DividerVariant;
}

export interface EnvelopeProps extends BaseBlockProps {
  title: string;
  note?: string;
  accounts: GiftAccount[];
}

export interface RunningTextProps extends BaseBlockProps {
  text: string;
  speed?: number;
  separator?: string;
}

export interface TextProps extends BaseBlockProps {
  title?: string;
  body: string;
  align?: 'left' | 'center' | 'right';
}

export interface PhotoProps extends BaseBlockProps {
  image: string;
  caption?: string;
  shape?: 'square' | 'rounded' | 'circle' | 'tilt';
}

export interface LiveStreamingProps extends BaseBlockProps {
  title: string;
  embedUrl: string;
  note?: string;
}

export interface CopyTextProps extends BaseBlockProps {
  title: string;
  label: string;
  value: string;
}

export interface WatermarkProps extends BaseBlockProps {
  text: string;
  opacity?: number;
}

/** Props root (tema) — disimpan di `Data.root.props`. */
export interface InvitationTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  fontHeading: string;
  fontBody: string;
}

/** Animasi loop untuk dekor. */
export type DecorLoop = 'none' | 'float' | 'pulse' | 'spin';

/** Elemen dekor bebas posisi di kanvas undangan. */
export interface DecorItem {
  id: string;
  /** 'image' (PNG/SVG) atau 'lottie' (JSON animasi). */
  kind?: 'image' | 'lottie';
  /** URL gambar atau URL JSON Lottie. */
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  rotation?: number;
  /** Balik horizontal. */
  flipX?: boolean;
  /** Balik vertikal. */
  flipY?: boolean;
  opacity?: number;
  zIndex?: number;
  loop?: DecorLoop;
}

/** Props root lengkap: tema + dekor kanvas + pengaturan tamu. */
export interface InvitationRootProps extends InvitationTheme {
  decor: DecorItem[];
  /** Tampilkan cover "Buka Undangan" (default 'yes'). */
  showCover?: 'yes' | 'no';
  coverGreeting?: string;
  coverButtonText?: string;
  coverBgImage?: string;
  coverStyle?: 'floral' | 'book' | 'filmroll' | 'oldtv' | 'newspaper';
  /** URL musik latar (opsional). */
  musicUrl?: string;
  musicAutoplay?: 'yes' | 'no';
  musicOffsetSec?: number;
  /** Tampilkan buku tamu (ucapan). */
  guestBookEnabled?: 'yes' | 'no';
  guestBookTitle?: string;
  /** Tampilkan bagian absensi (QR check-in). */
  checkinEnabled?: 'yes' | 'no';
  /** Agama untuk preset ucapan (mempengaruhi wording di kelola tamu). */
  religion?: string;
}

/** Peta nama komponen → tipe props. Dipakai sebagai generic `Config<Props>`. */
export interface InvitationProps {
  Hero: HeroProps;
  Couple: CoupleProps;
  Rsvp: RsvpProps;
  Countdown: CountdownProps;
  EventDetail: EventDetailProps;
  Gallery: GalleryProps;
  Story: StoryProps;
  Quote: QuoteProps;
  Thanks: ThanksProps;
  Maps: MapsProps;
  GiftList: GiftListProps;
  Divider: DividerProps;
  Envelope: EnvelopeProps;
  RunningText: RunningTextProps;
  Text: TextProps;
  Photo: PhotoProps;
  LiveStreaming: LiveStreamingProps;
  CopyText: CopyTextProps;
  Watermark: WatermarkProps;
}
