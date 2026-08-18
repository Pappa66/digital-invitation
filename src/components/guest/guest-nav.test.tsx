import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuestNav, { buildNavItems, buildNavSlots } from './guest-nav';

function block(type: string) {
  return { id: type, type: type as never, props: {} } as never;
}

/** Enam jenis blok PENTING yang boleh tampil di bottom nav. */
const IMPORTANT = ['Couple', 'Gallery', 'Story', 'EventDetail', 'RSVP', 'Maps'];

describe('buildNavItems — hanya blok penting (dedup + filter + urutan kanvas)', () => {
  it('mengikuti urutan blok asli di kanvas', () => {
    const items = buildNavItems([block('Gallery'), block('Couple'), block('RSVP')]);
    expect(items.map((i) => i.type)).toEqual(['Gallery', 'Couple', 'RSVP']);
  });

  it('menghilangkan duplikat jenis blok', () => {
    const items = buildNavItems([block('Couple'), block('Gallery'), block('Gallery'), block('Couple')]);
    expect(items.map((i) => i.type)).toEqual(['Couple', 'Gallery']);
  });

  it('mengabaikan jenis blok non-penting (Hero, Divider, CopyText, Popup, Quote, Music, Photo, Countdown...)', () => {
    const items = buildNavItems([
      block('Hero'), block('Divider'), block('Gallery'), block('CopyText'),
      block('Popup'), block('Quote'), block('Music'), block('Photo'),
      block('Countdown'), block('Envelope'), block('GiftList'), block('Thanks')
    ]);
    expect(items.map((i) => i.type)).toEqual(['Gallery']);
  });

  it('mengembalikan array kosong bila tidak ada blok penting', () => {
    expect(buildNavItems([block('Hero'), block('Divider'), block('CopyText')])).toEqual([]);
  });

  it('tidak pernah menyertakan jenis di luar 6 blok penting', () => {
    const all = [
      'Hero', 'Music', 'Photo', 'Quote', 'Countdown', 'Envelope', 'GiftList', 'Thanks',
      'Couple', 'Gallery', 'Story', 'EventDetail', 'RSVP', 'Maps'
    ].map(block);
    for (const item of buildNavItems(all)) {
      expect(IMPORTANT).toContain(item.type);
    }
  });
});

describe('buildNavSlots — maksimal 6 pill, tanpa menu "Lebih"', () => {
  it('menampilkan semua blok penting yang ada, urutan kanvas, tanpa "Lebih"', () => {
    const blocks = ['Story', 'Couple', 'EventDetail', 'RSVP', 'Gallery', 'Maps'].map(block);
    const slots = buildNavSlots(blocks);
    expect(slots.visible.map((i) => i.type)).toEqual(['Story', 'Couple', 'EventDetail', 'RSVP', 'Gallery', 'Maps']);
    expect(slots.visible.length).toBe(6);
    expect(slots.more).toEqual([]);
  });

  it('bila blok penting tidak ada, item menyesuaikan (4-5 pill, tidak diisi jenis lain)', () => {
    const slots = buildNavSlots(['Couple', 'EventDetail', 'Gallery', 'RSVP', 'Maps'].map(block));
    expect(slots.visible.map((i) => i.type)).toEqual(['Couple', 'EventDetail', 'Gallery', 'RSVP', 'Maps']);
    expect(slots.visible.length).toBe(5);
    expect(slots.more).toEqual([]);
  });

  it('tidak pernah memproduksi menu "Lebih" walau kanvas penuh dengan blok lain', () => {
    const all = [
      'Hero', 'Music', 'Photo', 'Quote', 'Countdown', 'Envelope', 'GiftList', 'Thanks',
      'Couple', 'Gallery', 'Story', 'EventDetail', 'RSVP', 'Maps'
    ].map(block);
    const slots = buildNavSlots(all);
    expect(slots.more).toEqual([]);
    expect(slots.visible.length).toBeLessThanOrEqual(6);
    for (const item of slots.visible) {
      expect(IMPORTANT).toContain(item.type);
    }
  });

  it('hasil akhir menjaga urutan kanvas & dedup tanpa kehilangan blok penting', () => {
    const all = [
      block('Music'), block('Couple'), block('Couple'), block('EventDetail'), block('Gallery'),
      block('Maps'), block('RSVP'), block('Envelope'), block('Photo')
    ];
    const slots = buildNavSlots(all);
    const visibleTypes = slots.visible.map((i) => i.type);
    const unique = [...new Set(visibleTypes)];
    expect(unique).toEqual(visibleTypes);
    const canvasOrder = ['Couple', 'EventDetail', 'Gallery', 'Maps', 'RSVP'];
    expect(visibleTypes).toEqual(canvasOrder);
  });
});

describe('GuestNav — render bottom nav tanpa menu "Lebih"', () => {
  it('merender semua pill penting yang ada (label kanonik, urutan kanvas) dan TIDAK ada "Lainnya"', () => {
    render(<GuestNav blocks={['Story', 'Couple', 'EventDetail', 'Gallery', 'RSVP', 'Maps'].map(block)} />);

    for (const label of ['Kisah', 'Mempelai', 'Acara', 'Galeri', 'RSVP', 'Lokasi']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
    }
    // Tidak pernah ada tombol "Lebih"/"Lainnya" (MoreHorizontal dihapus).
    expect(screen.queryByRole('button', { name: /Lainnya|Lebih|More|Lainnya/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Navigasi lainnya')).not.toBeInTheDocument();
  });

  it('menyaring blok non-penting dari DOM (Hero/Musik tidak muncul sebagai pill)', () => {
    render(<GuestNav blocks={[block('Hero'), block('Music'), block('Couple')]} />);

    expect(screen.getByRole('button', { name: 'Mempelai' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Awal' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Musik' })).not.toBeInTheDocument();
  });

  it('tidak merender nav sama sekali bila tidak ada blok penting', () => {
    const { container } = render(<GuestNav blocks={[block('Hero'), block('Divider'), block('CopyText')]} />);
    expect(container.innerHTML).toBe('');
  });
});