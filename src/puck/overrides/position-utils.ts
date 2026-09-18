import type { Data } from '@puckeditor/core';
import type { Position } from '@/puck/types';

interface ComponentLike {
  props?: { id?: string; position?: Position; [key: string]: unknown };
  [key: string]: unknown;
}

/**
 * Mengembalikan salinan `Data` dengan `position` komponen `id` di-merge.
 * Imutabel (aman untuk riwayat/undo Puck).
 */
export function setComponentPosition(data: Data, id: string, patch: Partial<Position>): Data {
  const content = (data.content as ComponentLike[]).map((item) => {
    if (item?.props?.id !== id) return item;
    const prev = item.props.position ?? { mode: 'flow', x: 0, y: 0 };
    return { ...item, props: { ...item.props, position: { ...prev, ...patch } } };
  });
  return { ...data, content } as Data;
}

/** Hitung posisi awal saat elemen flow diubah menjadi absolute. */
export function initialAbsoluteFromRect(
  rect: { left: number; top: number; width: number },
  canvas: { left: number; top: number }
): Partial<Position> {
  return {
    mode: 'absolute',
    x: Math.round(rect.left - canvas.left),
    y: Math.round(rect.top - canvas.top),
    width: Math.round(rect.width)
  };
}
