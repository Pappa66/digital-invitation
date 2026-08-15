import { z } from 'zod';

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
  ornament: z.string().max(50).optional()
}).strict();

export const SettingsSchema = z.object({
  music_url: z.string().max(500).default(''),
  guest_book_enabled: z.boolean().default(true),
  checkin_enabled: z.boolean().optional(),
  religion: z.string().max(20).optional(),
  music_autoplay: z.boolean().optional(),
  music_offset_sec: z.number().min(0).max(3600).optional(),
  music_on_section: z.string().max(30).optional()
}).strict();

export const BankAccountSchema = z.object({
  bank_name: z.string().max(50),
  account_number: z.string().max(30),
  account_holder: z.string().max(80)
}).strict();

export const BlockPropsSchema = z.record(
  z.string(),
  z.union([
    z.string().max(5000),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.array(BankAccountSchema),
    z.undefined()
  ])
);

export const BlockLayoutSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().min(100).max(2000)
}).strict();

export const BlockStyleSchema = z.object({
  textColor: z.string().max(20).optional(),
  textSizes: z.record(z.string(), z.string().max(20)).optional(),
  textFonts: z.record(z.string(), z.string().max(100)).optional(),
  bgColor: z.string().max(20).optional(),
  bgGradient: z.string().max(200).optional(),
  bgImage: z.string().max(1000).optional(),
  bgFit: z.enum(['cover', 'contain']).optional(),
  bgPosition: z.string().max(50).optional()
}).strict();

export const DecorAssetSchema = z.object({
  id: z.string().max(50),
  kind: z.enum(['shape', 'text', 'image']),
  x: z.number(),
  y: z.number(),
  opacity: z.number().min(0).max(1).optional(),
  rotation: z.number().min(-360).max(360).optional(),
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
  width: z.number().min(1).max(2000).optional()
}).strict();

export const BlockSchema = z.object({
  id: z.string().max(50),
  type: z.enum([
    'Hero', 'Couple', 'Countdown', 'EventDetail', 'Story', 'Gallery',
    'RSVP', 'Envelope', 'Maps', 'Thanks', 'Divider', 'Text', 'Photo',
    'GiftList', 'Quote'
  ]),
  props: BlockPropsSchema,
  layout: BlockLayoutSchema.optional(),
  style: BlockStyleSchema.optional(),
  inner: z.record(z.string(), z.object({ x: z.number(), y: z.number() })).nullable().optional(),
  decor: z.array(DecorAssetSchema).max(50).optional()
}).strict();

export const CanvasDataSchema = z.object({
  theme: ThemeSchema,
  settings: SettingsSchema,
  blocks: z.array(BlockSchema).max(50),
  flow: z.enum(['stack', 'free']).optional()
}).strict();

export type ValidatedCanvasData = z.infer<typeof CanvasDataSchema>;

/**
 * Validate canvas data from database/client. Returns validated data or null if invalid.
 * Logs validation errors for debugging.
 */
export function validateCanvasData(data: unknown): ValidatedCanvasData | null {
  const result = CanvasDataSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  console.error('[CanvasValidation]', result.error.flatten().fieldErrors);
  return null;
}
