import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GuestRenderer from '@/components/guest/GuestRenderer';
import { emptyCanvas } from '@/lib/templates';
import type { Block, CanvasData } from '@/lib/types';

const { rpcMock, demoModeMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

// Hindari Supabase/network: read-receipt & RSVP harus hening di mode preview.
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: rpcMock,
    from: () => ({ insert: vi.fn() })
  }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

function mkBlock(type: Block['type'], id: string, props: Block['props']): Block {
  return { id, type, props };
}

/**
 * Canvas minimal yang mewakili undangan lama: Hero + Couple + RSVP.
 * Cover/musik/guestbook/checkin dimatikan agar render murni tanpa network.
 */
function minimalCanvas(): CanvasData {
  const base = emptyCanvas();
  return {
    ...base,
    settings: {
      ...base.settings,
      show_cover: false,
      guest_book_enabled: false,
      checkin_enabled: false,
      music_url: ''
    },
    blocks: [
      mkBlock('Hero', 'hero-1', {
        caption: 'The Wedding of',
        groom: 'Raka',
        bride: 'Sinta',
        date: '12 Desember 2026'
      }),
      mkBlock('Couple', 'couple-1', {
        introduction: 'Dengan memohon rahmat dan ridha-Nya',
        groom: 'Raka Pratama',
        bride: 'Sinta Dewi'
      }),
      mkBlock('RSVP', 'rsvp-1', {
        title: 'Konfirmasi Kehadiran',
        note: 'Mohon konfirmasi kehadiran Anda'
      })
    ]
  };
}

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: true, error: null });
  demoModeMock.mockReset();
  demoModeMock.mockReturnValue(false);
  localStorage.clear();
});

describe('GuestRenderer — guard-rail rendering undangan lama (Hero + Couple + RSVP)', () => {
  it('merender tanpa melempar error dan menampilkan caption Hero serta nama mempelai', async () => {
    const { container } = render(<GuestRenderer canvas={minimalCanvas()} preview />);

    // Struktur dasar ter-render.
    expect(container.querySelector('.guest-root')).not.toBeNull();

    // Caption Hero.
    expect(await screen.findByText('The Wedding of')).toBeInTheDocument();

    // Nama mempelai (hero + couple).
    expect(await screen.findByText('Sinta Dewi')).toBeInTheDocument();
    expect((await screen.findAllByText(/Raka/)).length).toBeGreaterThan(0);

    // Section RSVP ikut ter-render.
    expect(await screen.findByText('Konfirmasi Kehadiran')).toBeInTheDocument();
  });

  it('tidak menembak network read-receipt saat preview', async () => {
    render(<GuestRenderer canvas={minimalCanvas()} preview />);
    expect(await screen.findByText('The Wedding of')).toBeInTheDocument();
    await waitFor(() => expect(rpcMock).not.toHaveBeenCalled());
  });
});
