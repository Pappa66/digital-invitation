import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlockShell } from '@/blocks/shell';
import Hero from '@/blocks/Hero';
import EventDetail from '@/blocks/EventDetail';
import Gallery from '@/blocks/Gallery';
import type { Position } from '@/puck/types';

const flow: Position = { mode: 'flow', x: 0, y: 0 };
const absolute: Position = { mode: 'absolute', x: 42, y: 24 };

describe('BlockShell', () => {
  it('mode flow tidak melepas dari aliran', () => {
    const { container } = render(
      <BlockShell position={flow}>
        <span>x</span>
      </BlockShell>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.position).not.toBe('absolute');
  });

  it('mode absolute menerapkan koordinat x/y', () => {
    const { container } = render(
      <BlockShell position={absolute}>
        <span>x</span>
      </BlockShell>
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.position).toBe('absolute');
    expect(el.style.left).toBe('42px');
    expect(el.style.top).toBe('24px');
  });
});

describe('Hero', () => {
  it('menampilkan caption dan kedua nama', () => {
    render(<Hero caption="The Wedding of" groom="Panca" bride="Sena" date="12 Des 2026" bgImage="" position={flow} />);
    expect(screen.getByText('Sena')).toBeInTheDocument();
    expect(screen.getByText('Panca')).toBeInTheDocument();
    expect(screen.getByText('The Wedding of')).toBeInTheDocument();
  });
});

describe('EventDetail', () => {
  it('merender setiap acara', () => {
    render(
      <EventDetail
        title="Waktu & Tempat"
        events={[{ label: 'Akad Nikah', date: '12 Des 2026', time: '08.00', place: 'Grand Ballroom' }]}
        position={flow}
      />
    );
    expect(screen.getByText('Akad Nikah')).toBeInTheDocument();
    expect(screen.getByText('Grand Ballroom')).toBeInTheDocument();
  });
});

describe('Gallery', () => {
  it('menampilkan placeholder saat belum ada foto', () => {
    render(<Gallery title="Galeri" images={[]} position={flow} />);
    expect(screen.getByText(/Belum ada foto/i)).toBeInTheDocument();
  });

  it('merender gambar yang diberikan', () => {
    render(<Gallery title="Galeri" images={[{ url: 'https://example.com/a.jpg', caption: 'Foto 1' }]} position={flow} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/a.jpg');
  });
});
