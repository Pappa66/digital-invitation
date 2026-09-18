import { describe, expect, it } from 'vitest';
import type { Data } from '@puckeditor/core';
import { initialAbsoluteFromRect, setComponentPosition } from './position-utils';
import type { Position } from '@/puck/types';

function makeData(): Data {
  return {
    root: { props: {} },
    content: [
      { type: 'Hero', props: { id: 'h1', position: { mode: 'flow', x: 0, y: 0 } } },
      { type: 'Couple', props: { id: 'c1', position: { mode: 'flow', x: 0, y: 0 } } }
    ]
  } as unknown as Data;
}

function posOf(data: Data, id: string): Position {
  const item = (data.content as { props: { id: string; position: Position } }[]).find((i) => i.props.id === id);
  return item!.props.position;
}

describe('setComponentPosition', () => {
  it('hanya mengubah komponen dengan id yang cocok', () => {
    const next = setComponentPosition(makeData(), 'c1', { mode: 'absolute', x: 12, y: 34 });
    expect(posOf(next, 'h1').mode).toBe('flow');
    expect(posOf(next, 'c1')).toMatchObject({ mode: 'absolute', x: 12, y: 34 });
  });

  it('merge patch, bukan menimpa seluruh position', () => {
    const base = makeData();
    const withWidth = setComponentPosition(base, 'h1', { mode: 'absolute', x: 5, y: 6, width: 300 });
    const next = setComponentPosition(withWidth, 'h1', { x: 50 });
    expect(posOf(next, 'h1')).toMatchObject({ mode: 'absolute', x: 50, y: 6, width: 300 });
  });

  it('tidak memutasi data asli', () => {
    const base = makeData();
    const next = setComponentPosition(base, 'h1', { x: 99 });
    expect(posOf(base, 'h1').x).toBe(0);
    expect(posOf(next, 'h1').x).toBe(99);
  });

  it('id tak ditemukan mengembalikan konten setara', () => {
    const base = makeData();
    const next = setComponentPosition(base, 'nope', { x: 1 });
    expect(next.content).toHaveLength(base.content.length);
  });
});

describe('initialAbsoluteFromRect', () => {
  it('menghitung koordinat relatif kanvas + lebar', () => {
    const patch = initialAbsoluteFromRect({ left: 140, top: 260, width: 320 }, { left: 100, top: 200 });
    expect(patch).toEqual({ mode: 'absolute', x: 40, y: 60, width: 320 });
  });
});
