import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuestNav, { buildNavItems, buildNavSlots } from './guest-nav';

function block(type: string, id?: string, props: Record<string, string> = {}) {
  return { id: id ?? type, type: type as never, props } as never;
}

/** Enam jenis blok PENTING yang boleh tampil di bottom nav. */
const IMPORTANT = ['Couple', 'Gallery', 'Story', 'EventDetail', 'RSVP', 'Maps'];

describe('buildNavItems — per blok (bukan dedup tipe)', () => {
  it('mengikuti urutan blok asli di kanvas', () => {
    const items = buildNavItems([block('Gallery', 'g1'), block('Couple', 'c1'), block('RSVP', 'r1')]);
    expect(items.map((i) => i.blockId)).toEqual(['g1', 'c1', 'r1']);
  });

  it('menampilkan dua EventDetail terpisah (Akad & Resepsi)', () => {
    const items = buildNavItems([
      block('EventDetail', 'akad', { title: 'Akad Nikah' }),
      block('EventDetail', 'resepsi', { title: 'Resepsi' })
    ]);
    expect(items).toHaveLength(2);
    expect(items[0].label).toBe('Akad Nikah');
    expect(items[1].label).toBe('Resepsi');
  });

  it('mengabaikan jenis blok non-penting', () => {
    const items = buildNavItems([
      block('Hero'), block('Divider'), block('Gallery', 'g1'), block('CopyText'),
      block('Popup'), block('Quote'), block('Music'), block('Photo'),
      block('Countdown'), block('Envelope'), block('GiftList'), block('Thanks')
    ]);
    expect(items.map((i) => i.type)).toEqual(['Gallery']);
  });

  it('mengembalikan array kosong bila tidak ada blok penting', () => {
    expect(buildNavItems([block('Hero'), block('Divider'), block('CopyText')])).toEqual([]);
  });

  it('memotong maksimal 6 item', () => {
    const blocks = IMPORTANT.map((t, i) => block(t, `${t}-${i}`));
    const extra = [block('Couple', 'extra-couple')];
    expect(buildNavItems([...blocks, ...extra])).toHaveLength(6);
  });
});

describe('buildNavSlots — maksimal 6 pill, tanpa menu "Lebih"', () => {
  it('menampilkan semua blok penting yang ada, urutan kanvas', () => {
    const blocks = ['Story', 'Couple', 'EventDetail', 'RSVP', 'Gallery', 'Maps'].map((t, i) => block(t, `${t}-${i}`));
    const slots = buildNavSlots(blocks);
    expect(slots.visible).toHaveLength(6);
    expect(slots.more).toEqual([]);
  });

  it('tidak pernah memproduksi menu "Lebih"', () => {
    const all = [
      'Hero', 'Music', 'Photo', 'Quote', 'Countdown', 'Envelope', 'GiftList', 'Thanks',
      'Couple', 'Gallery', 'Story', 'EventDetail', 'RSVP', 'Maps'
    ].map((t, i) => block(t, `${t}-${i}`));
    const slots = buildNavSlots(all);
    expect(slots.more).toEqual([]);
    expect(slots.visible.length).toBeLessThanOrEqual(6);
  });
});

describe('GuestNav — render bottom nav', () => {
  it('merender pill per blok penting (title custom) tanpa menu "Lebih"', () => {
    render(
      <GuestNav
        blocks={[
          block('Story', 's1', { title: 'Kisah Kami' }),
          block('Couple', 'c1'),
          block('EventDetail', 'e1', { title: 'Akad' }),
          block('Gallery', 'g1'),
          block('RSVP', 'r1'),
          block('Maps', 'm1')
        ]}
      />
    );

    expect(screen.getByRole('button', { name: 'Kisah Kami' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mempelai' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Akad' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Lainnya|Lebih/i })).not.toBeInTheDocument();
  });

  it('menyaring blok non-penting dari DOM', () => {
    render(<GuestNav blocks={[block('Hero'), block('Music'), block('Couple', 'c1')]} />);
    expect(screen.getByRole('button', { name: 'Mempelai' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Musik' })).not.toBeInTheDocument();
  });

  it('tidak merender nav bila tidak ada blok penting', () => {
    const { container } = render(<GuestNav blocks={[block('Hero'), block('Divider')]} />);
    expect(container.innerHTML).toBe('');
  });
});
