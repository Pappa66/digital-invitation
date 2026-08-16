import { describe, it, expect } from 'vitest';
import { buildNavItems } from './guest-nav';

function block(type: string) {
  return { id: type, type: type as never, props: {} } as never;
}

describe('buildNavItems', () => {
  it('mengikuti urutan blok asli di kanvas', () => {
    const items = buildNavItems([block('Gallery'), block('Hero'), block('Couple'), block('RSVP')]);
    expect(items.map((i) => i.type)).toEqual(['Gallery', 'Hero', 'Couple', 'RSVP']);
  });

  it('menghilangkan duplikat jenis blok', () => {
    const items = buildNavItems([block('Hero'), block('Gallery'), block('Gallery'), block('Hero')]);
    expect(items.map((i) => i.type)).toEqual(['Hero', 'Gallery']);
  });

  it('mengabaikan jenis blok non-section', () => {
    const items = buildNavItems([block('Hero'), block('Divider'), block('Gallery'), block('CopyText'), block('Popup'), block('Quote')]);
    expect(items.map((i) => i.type)).toEqual(['Hero', 'Gallery', 'Quote']);
  });

  it('mengembalikan array kosong bila tidak ada blok section', () => {
    expect(buildNavItems([block('Divider'), block('CopyText')])).toEqual([]);
  });
});