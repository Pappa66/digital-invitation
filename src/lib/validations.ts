import { z } from 'zod';

/**
 * Skema validasi kanvas undangan — SUMBER KEBENARAN: src/lib/types/index.ts.
 *
 * Kebijakan strictness:
 *  - STRUKTUR TOP-LEVEL (theme/settings/block/canvas): strict, karena
 *    hanya mengenali blok & field resmi. Data di luar itu = data korup.
 *  - props / style / decoration: PERMISSIVE (tidak .strict()), karena isi
 *    konten blok terus berkembang dan tidak boleh memblokir render sah.
 */

// ---------------------------------------------------------------
// THEME — sinkron dgn interface Theme (types/index.ts)
// ---------------------------------------------------------------
export const ThemeSchema = z.object({
  primary: z.string().max(20),
  secondary: z.string().max(20),
  background: z.string().max(20),
  text: z.string().max(20),
  font_heading: z.string().max(100),
  font_body: z.string().max(100),
  layout: z.enum(['center', 'left', 'right']).default('center'),
  hero_style: z.enum(['image', 'solid', 'gradient']).default('image'),
  frame: z.string().max(20).optional(),
  card_style: z.boolean().optional(),
  card_variant: z.string().max(30).optional(),
  card_entrance: z.string().max(20).optional(),
  ornament: z.string().max(50).optional()
}).strict();

// ---------------------------------------------------------------
// SETTINGS — sinkron dgn interface Settings (types/index.ts)
// ---------------------------------------------------------------
export const SettingsSchema = z.object({
  music_url: z.string().max(500).default(''),
  guest_book_enabled: z.boolean().default(true),
  checkin_enabled: z.boolean().optional(),
  religion: z.string().max(20).optional(),
  music_autoplay: z.boolean().optional(),
  music_offset_sec: z.number().min(0).max(3600).optional(),
  music_on_section: z.string().max(30).optional(),
  show_seat_info: z.boolean().optional(),
  table_label: z.string().max(80).optional(),
  seat_label: z.string().max(80).optional(),
  show_cover: z.boolean().optional(),
  cover_greeting: z.string().max(100).optional(),
  cover_button_text: z.string().max(100).optional(),
  cover_bg_image: z.string().max(1000).optional(),
  base_price: z.number().min(0).optional(),
  discount_percent: z.number().min(0).max(100).optional(),
  promo_code: z.string().max(50).optional(),
  promo_expires_at: z.string().max(30).optional(),
  show_pricing: z.boolean().optional()
}).strict();

// ---------------------------------------------------------------
// BANK ACCOUNT — sinkron dgn interface BankAccount
// ---------------------------------------------------------------
export const BankAccountSchema = z.object({
  bank_name: z.string().max(50),
  account_number: z.string().max(30),
  account_holder: z.string().max(80)
}).strict();

// ---------------------------------------------------------------
// BLOCK PROPS — PERMISSIVE (index signature seperti BlockProps)
// ---------------------------------------------------------------
// Policy dokumen: props adalah konten yang terus berkembang, TIDAK boleh
// memblokir render data sah. Nilai apa pun yang aman untuk dirender React
// (React-escape penuh, tidak ada dangerouslySetInnerHTML) diterima:
// string/number/boolean/null/array (string | number | object) / object.
const PropString = z.string().max(5000);
const PropNumber = z.number();
const PropBoolean = z.boolean();
const PropAnyArray = z.array(z.unknown()).max(200);
const PropObject = z.record(z.string(), z.unknown());
const BlockPropsSchema = z.record(
  z.string(),
  z.union([PropString, PropNumber, PropBoolean, z.null(), PropAnyArray, PropObject, z.undefined()])
);

// ---------------------------------------------------------------
// BLOCK LAYOUT — struktur tetap
// ---------------------------------------------------------------
export const BlockLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().min(100).max(2000)
}).strict();

// ---------------------------------------------------------------
// BLOCK STYLE — PERMISSIVE, sinkron dgn interface BlockStyle
// ---------------------------------------------------------------
export const BlockStyleSchema = z.object({
  textColor: z.string().max(20).optional(),
  textSizes: z.record(z.string(), z.string().max(20)).optional(),
  textFonts: z.record(z.string(), z.string().max(100)).optional(),
  bgColor: z.string().max(20).optional(),
  bgGradient: z.string().max(200).optional(),
  bgImage: z.string().max(1000).optional(),
  bgFit: z.enum(['cover', 'contain']).optional(),
  bgPosition: z.string().max(50).optional(),
  borderRadius: z.string().max(50).optional(),
  border: z.string().max(100).optional(),
  boxShadow: z.string().max(200).optional(),
  padding: z.string().max(100).optional(),
  opacity: z.number().min(0).max(1).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  entrance: z.enum(['fade', 'slide', 'zoom', 'blur', 'rise', 'none']).optional(),
  entranceDelay: z.number().min(0).max(10000).optional(),
  hideOn: z.array(z.enum(['mobile', 'tablet', 'desktop'])).optional()
});

// ---------------------------------------------------------------
// DECOR ASSET — PERMISSIVE, sinkron dgn interface DecorAsset
// ---------------------------------------------------------------
export const DecorAssetSchema = z.object({
  id: z.string().max(50),
  kind: z.enum(['shape', 'text', 'image', 'ornament']),
  x: z.number(),
  y: z.number(),
  opacity: z.number().min(0).max(1).optional(),
  rotation: z.number().min(-360).max(360).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  layer: z.number().min(0).max(10).optional(),
  shape: z.enum(['circle', 'square', 'triangle', 'star', 'heart', 'leaf', 'diamond', 'ring']).optional(),
  color: z.string().max(20).optional(),
  size: z.number().min(1).max(500).optional(),
  text: z.string().max(200).optional(),
  fontSize: z.number().min(8).max(200).optional(),
  fontWeight: z.enum(['normal', 'bold']).optional(),
  underline: z.boolean().optional(),
  italic: z.boolean().optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  imageUrl: z.string().max(1000).optional(),
  photoShape: z.enum(['square', 'circle', 'rounded', 'tilt']).optional(),
  width: z.number().min(1).max(2000).optional(),
  ornament: z.string().max(50).optional()
});

// ---------------------------------------------------------------
// BLOCK — struktur top-level strict, 20 tipe resmi
// ---------------------------------------------------------------
export const BLOCK_TYPES = [
  'Hero', 'Couple', 'Countdown', 'EventDetail', 'Story', 'Gallery',
  'RSVP', 'Envelope', 'Maps', 'Thanks', 'Divider', 'Text', 'Photo',
  'GiftList', 'Quote', 'LiveStreaming', 'Watermark', 'Popup', 'CopyText', 'Empty'
] as const;

export const BlockSchema = z.object({
  id: z.string().max(50),
  type: z.enum(BLOCK_TYPES),
  props: BlockPropsSchema,
  layout: BlockLayoutSchema.optional(),
  style: BlockStyleSchema.optional(),
  inner: z.record(z.string(), z.object({ x: z.number(), y: z.number() })).nullable().optional(),
  decor: z.array(DecorAssetSchema).max(50).optional()
}).strict();

// ---------------------------------------------------------------
// CANVAS DATA — struktur top-level strict
// ---------------------------------------------------------------
export const CanvasDataSchema = z.object({
  theme: ThemeSchema,
  settings: SettingsSchema,
  blocks: z.array(BlockSchema).max(50),
  flow: z.enum(['stack', 'free']).optional()
}).strict();

export type ValidatedCanvasData = z.infer<typeof CanvasDataSchema>;

/**
 * Validasi canvas data dari database/client. Mengembalikan data valid
 * ATAU null. Ini GATE nyata: data yang gagal validasi struktural TIDAK
 * boleh dirender mentah (GuestView menampilkan placeholder error).
 */
export function validateCanvasData(data: unknown): ValidatedCanvasData | null {
  const result = CanvasDataSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  // Ringkas log error agar mudah didiagnosis tanpa membocorkan isi data.
  console.error('[CanvasValidation]', result.error.issues.map((i) => i.path.join('.')).join(', '));
  return null;
}
