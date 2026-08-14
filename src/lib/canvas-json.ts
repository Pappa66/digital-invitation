import type { Json } from '@/lib/types/supabase';
import type { CanvasData } from '@/lib/types';

/** Konversi CanvasData (yang memakai BlockProps unknown) menjadi Json aman untuk Supabase. */
export function canvasToJson(canvas: CanvasData): Json {
  return structuredClone(canvas) as unknown as Json;
}

/** Balikkan Json (dari DB) menjadi CanvasData. */
export function jsonToCanvas(json: Json | undefined | null): CanvasData | null {
  if (!json || typeof json !== 'object') return null;
  return json as unknown as CanvasData;
}
