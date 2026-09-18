import { describe, expect, it } from 'vitest';
import { emptyPuckData, extractCoupleTitle, isPuckData } from './puck-format';

describe('isPuckData', () => {
  it('true untuk struktur Puck { root, content }', () => {
    expect(isPuckData({ root: { props: {} }, content: [] })).toBe(true);
  });

  it('false untuk format lama CanvasData { blocks, theme }', () => {
    expect(isPuckData({ theme: {}, settings: {}, blocks: [] })).toBe(false);
  });

  it('false untuk nilai tidak valid', () => {
    expect(isPuckData(null)).toBe(false);
    expect(isPuckData(undefined)).toBe(false);
    expect(isPuckData('x')).toBe(false);
    expect(isPuckData({ content: 'nope', root: {} })).toBe(false);
  });
});

describe('emptyPuckData', () => {
  it('root memuat tema default + decor kosong', () => {
    const d = emptyPuckData();
    expect(d.content).toEqual([]);
    expect(d.root.props).toMatchObject({ primary: expect.any(String), fontHeading: expect.any(String) });
    expect(d.root.props?.decor).toEqual([]);
  });
});

describe('extractCoupleTitle', () => {
  it('menggabungkan bride & groom dari blok Hero', () => {
    const d = emptyPuckData();
    d.content = [
      { type: 'Hero', props: { id: 'h', bride: 'Sena', groom: 'Panca', position: { mode: 'flow', x: 0, y: 0 } } }
    ] as typeof d.content;
    expect(extractCoupleTitle(d)).toBe('Sena & Panca');
  });

  it('string kosong bila tidak ada Hero', () => {
    expect(extractCoupleTitle(emptyPuckData())).toBe('');
  });
});
