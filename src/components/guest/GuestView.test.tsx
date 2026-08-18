import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GuestView from '@/components/guest/GuestView';

// Mock renderer agar tes fokus pada GATE validasi, bukan isi halaman tamu.
const { rendererMock } = vi.hoisted(() => ({
  rendererMock: vi.fn()
}));

vi.mock('@/components/guest/GuestRenderer', () => ({
  default: (props: Record<string, unknown>) => {
    rendererMock(props);
    return <div data-testid="guest-renderer" />;
  }
}));

let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  rendererMock.mockReset();
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => errorSpy.mockRestore());

function validCanvas() {
  return {
    theme: {
      primary: '#D4AF37',
      secondary: '#8A6D2F',
      background: '#FAF6EF',
      text: '#4A443C',
      font_heading: 'Playfair Display',
      font_body: 'Montserrat',
      layout: 'center',
      hero_style: 'image'
    },
    settings: { music_url: '', guest_book_enabled: true },
    blocks: [{ id: 'b1', type: 'Hero', props: { bride: 'Sena', groom: 'Panca' } }],
    flow: 'stack'
  };
}

describe('GuestView — gate validasi struktural kanvas', () => {
  it('menampilkan placeholder error yang aman saat data kanvas GAGAL validasi', () => {
    render(<GuestView projectId="p1" canvas={{ blocks: [], theme: {}, settings: {} }} />);
    expect(screen.getByText('Undangan tidak dapat ditampilkan')).toBeInTheDocument();
    expect(screen.getByText(/Terjadi kesalahan struktur data undangan/)).toBeInTheDocument();
    // Tidak ada data pengguna yang bocor ke placeholder.
    expect(rendererMock).not.toHaveBeenCalled();
  });

  it('menolak data null/tidak valid tanpa crash', () => {
    render(<GuestView projectId="p1" canvas={null as unknown as Record<string, unknown>} />);
    expect(screen.getByText('Undangan tidak dapat ditampilkan')).toBeInTheDocument();
    expect(rendererMock).not.toHaveBeenCalled();
  });

  it('tidak merender data yang mencurigakan (flow invalid → gate) ', () => {
    const bad = validCanvas() as unknown as Record<string, unknown>;
    (bad as { flow: string }).flow = 'diagonal';
    render(<GuestView projectId="p1" canvas={bad} />);
    expect(screen.getByText('Undangan tidak dapat ditampilkan')).toBeInTheDocument();
    expect(rendererMock).not.toHaveBeenCalled();
  });

  it('meneruskan data VALID (hasil validasi +default) ke GuestRenderer', () => {
    render(<GuestView projectId="p1" canvas={validCanvas() as unknown as Record<string, unknown>} to="Budi" />);
    expect(rendererMock).toHaveBeenCalledTimes(1);
    const props = rendererMock.mock.calls[0][0];
    expect(props.projectId).toBe('p1');
    expect(props.greetingName).toBe('Budi');
    expect(props.canvas.blocks).toHaveLength(1);
    expect(props.canvas.blocks[0].type).toBe('Hero');
  });
});