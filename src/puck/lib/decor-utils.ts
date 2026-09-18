import type { DecorItem } from '@/puck/types';

let counter = 0;

/** Buat item dekor baru dengan default wajar. */
export function newDecorItem(partial: Partial<DecorItem> = {}): DecorItem {
  counter += 1;
  return {
    id: `decor-${Date.now().toString(36)}-${counter}`,
    kind: 'image',
    imageUrl: '',
    x: 40,
    y: 40,
    width: 120,
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    zIndex: 1,
    loop: 'none',
    ...partial
  };
}

export function updateDecorItem(list: DecorItem[], id: string, patch: Partial<DecorItem>): DecorItem[] {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function removeDecorItem(list: DecorItem[], id: string): DecorItem[] {
  return list.filter((item) => item.id !== id);
}
