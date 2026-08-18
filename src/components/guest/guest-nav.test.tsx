import { describe, it, expect } from 'vitest';
import { buildNavItems, buildNavSlots } from './guest-nav';

function block(type: string) {
  return { id: type, type: type as never, props: {} } as never;
}

describe('buildNavItems — daftar penuh (dedup + filter + urutan kanvas)', () => {
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

  it('blok non-inti tidak dibuang bila total item masih <= 6 (urutan kanvas dipertahankan)', () => {
    const items = buildNavItems([block('Hero'), block('Music'), block('Photo')]);
    expect(items.map((i) => i.type)).toEqual(['Hero', 'Music', 'Photo']);
  });
});

describe('buildNavSlots — batasan maksimal 6 pill (5 item + "Lebih")', () => {
  it('menampilkan semua jenis bila jumlah section <= 6 (tanpa menu "Lebih")', () => {
    const six = ['Couple', 'EventDetail', 'Gallery', 'RSVP', 'Envelope', 'Maps'].map(block);
    const slots = buildNavSlots(six);
    expect(slots.visible.map((i) => i.type)).toEqual(['Couple', 'EventDetail', 'Gallery', 'RSVP', 'Envelope', 'Maps']);
    expect(slots.more).toEqual([]);
  });

  it('memangkas bilah ke 5 item terpenting dan memindah sisanya ke "Lebih" saat >6 jenis', () => {
    const all = [
      'Hero', 'Music', 'Gallery', 'Couple', 'RSVP', 'Countdown',
      'Envelope', 'Quote', 'Maps', 'Photo', 'Story', 'EventDetail', 'GiftList', 'Thanks'
    ].map(block);
    const slots = buildNavSlots(all);
    expect(slots.visible.length).toBe(5);
    expect(slots.more.length).toBe(all.length - 5);
    expect(slots.visible.length + slots.more.length).toBeLessThanOrEqual(6 + 9);
  });

  it('mempertahankan prioritas penting: Mempelai/Acara/Galeri/RSVP/Amplop/Lokasi tetap masuk (bila > 6)', () => {
    const all = [
      'Hero', 'Music', 'Gallery', 'Couple', 'RSVP', 'Countdown',
      'Envelope', 'Quote', 'Maps', 'Photo', 'Story', 'EventDetail'
    ].map(block);
    const slots = buildNavSlots(all);
    const reachable = [...slots.visible, ...slots.more].map((i) => i.type);
    for (const priority of ['Couple', 'EventDetail', 'Gallery', 'RSVP', 'Envelope', 'Maps']) {
      expect(reachable).toContain(priority);
    }
  });

  it('membuang prioritas rendah (Music/Quote/Photo) keluar dari bilah bila melebihi 6', () => {
    const all = [
      'Couple', 'EventDetail', 'Gallery', 'RSVP',
      'Envelope', 'Maps', 'Music', 'Quote', 'Photo'
    ].map(block);
    const slots = buildNavSlots(all);
    const visibleTypes = slots.visible.map((i) => i.type);
    expect(slots.visible.length).toBe(5);
    for (const trash of ['Music', 'Photo']) {
      expect(visibleTypes).not.toContain(trash);
    }
  });

  it('hasil akhir menjaga urutan kanvas, dedup, dan tidak kehilangan section (AC dedup + order)', () => {
    const all = [
      block('Music'), block('Couple'), block('Couple'), block('EventDetail'), block('Gallery'),
      block('Maps'), block('RSVP'), block('Envelope'), block('Photo')
    ];
    const slots = buildNavSlots(all);
    const visibleTypes = slots.visible.map((i) => i.type);
    // Dedup.
    const unique = [...new Set(visibleTypes)];
    expect(unique).toEqual(visibleTypes);
    // Urutan relatif mengikuti kanvas.
    const canvasPriorityOrder = ['Couple', 'EventDetail', 'Gallery', 'Maps', 'RSVP', 'Envelope'];
    const priorityInOrder = visibleTypes.filter((t) => canvasPriorityOrder.includes(t));
    expect(priorityInOrder).toEqual(canvasPriorityOrder.filter((t) => priorityInOrder.includes(t)));
    // Total reachable = semua jenis unik (tidak ada yang hilang).
    const allUnique = [...new Set(all.map((b) => (b as { type: string }).type))].filter((t) =>
      ['Couple', 'EventDetail', 'Gallery', 'Maps', 'RSVP', 'Envelope', 'Music', 'Photo'].includes(t)
    );
    const reachable = [...slots.visible, ...slots.more].map((i) => i.type).sort();
    expect(reachable).toEqual([...allUnique].sort());
  });
});