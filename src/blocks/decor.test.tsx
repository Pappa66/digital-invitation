import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import DecorLayer from '@/blocks/DecorLayer';
import { newDecorItem, removeDecorItem, updateDecorItem } from '@/puck/lib/decor-utils';
import type { DecorItem } from '@/puck/types';

describe('decor-utils', () => {
  it('newDecorItem punya default lengkap', () => {
    const item = newDecorItem();
    expect(item.id).toMatch(/^decor-/);
    expect(item).toMatchObject({ imageUrl: '', width: 120, loop: 'none', opacity: 1 });
  });

  it('updateDecorItem hanya mengubah item target', () => {
    const a = newDecorItem({ imageUrl: 'a.png' });
    const b = newDecorItem({ imageUrl: 'b.png' });
    const next = updateDecorItem([a, b], a.id, { x: 99 });
    expect(next.find((d) => d.id === a.id)?.x).toBe(99);
    expect(next.find((d) => d.id === b.id)?.x).toBe(40);
  });

  it('removeDecorItem menghapus berdasarkan id', () => {
    const a = newDecorItem();
    const b = newDecorItem();
    const next = removeDecorItem([a, b], a.id);
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe(b.id);
  });
});

describe('DecorLayer', () => {
  const decor: DecorItem[] = [
    { id: 'd1', imageUrl: '/stickers/rose-left.svg', x: 10, y: 20, width: 80, rotation: -5, loop: 'float' },
    { id: 'd2', imageUrl: '', x: 0, y: 0, width: 50 }
  ];

  it('tidak merender apa pun bila tidak ada gambar', () => {
    const { container } = render(<DecorLayer decor={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('merender gambar dekor (mengabaikan yang kosong)', () => {
    const { container } = render(<DecorLayer decor={decor} />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(1);
    expect(imgs[0]).toHaveAttribute('src', '/stickers/rose-left.svg');
  });
});
