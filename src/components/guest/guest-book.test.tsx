import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GuestBookWall from '@/components/guest/guest-book';

const { rpcMock, selectMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  selectMock: vi.fn()
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    rpc: rpcMock,
    from: () => ({ select: selectMock })
  }
}));

const PROJECT_ID = 'proj-gb-1';

function message(id: string, name: string, text: string | null) {
  return { id, project_id: PROJECT_ID, name, attendance: 'hadir', guest_count: 1, message: text, created_at: `2025-0${id}-01` };
}

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: [], error: null });
  selectMock.mockReset();
  selectMock.mockResolvedValue({ data: [], error: null });
});

describe('GuestBookWall — buku tamu aman via RPC', () => {
  it('merender pesan tamu dari RPC get_guest_book_messages (nama + ucapan)', async () => {
    rpcMock.mockResolvedValue({
      data: [
        message('1', 'Budi', 'Selamat menempuh hidup baru!'),
        message('2', 'Siti', 'Barakallah, semoga sakinah.')
      ],
      error: null
    });
    render(<GuestBookWall projectId={PROJECT_ID} />);

    expect(await screen.findByText('Selamat menempuh hidup baru!')).toBeInTheDocument();
    expect(screen.getByText('Barakallah, semoga sakinah.')).toBeInTheDocument();
    expect(screen.getByText('Budi')).toBeInTheDocument();
  });

  it('memanggil RPC yang benar, bukan SELECT langsung ke tabel rsvps (data intim tetap terlindungi)', async () => {
    render(<GuestBookWall projectId={PROJECT_ID} />);
    await waitFor(() => expect(rpcMock).toHaveBeenCalled());
    expect(rpcMock).toHaveBeenCalledWith('get_guest_book_messages', { p_project_id: PROJECT_ID });
    expect(selectMock).not.toHaveBeenCalled();
  });

  it('membatasi tampilan 8 pesan terbaru walau RPC mengembalikan 24 (slice 0..8)', async () => {
    const many = Array.from({ length: 24 }, (_, i) => message(String(i + 1), `Tamu ${i + 1}`, `Ucapan nomor ${i + 1}`));
    rpcMock.mockResolvedValue({ data: many, error: null });
    render(<GuestBookWall projectId={PROJECT_ID} />);

    // Tunggu render selesai: pesan ke-1 tampil...
    expect(await screen.findByText('Ucapan nomor 1')).toBeInTheDocument();
    // ...dan pesan ke-9 (indeks 8) TIDAK tampil karena di-slice.
    await waitFor(() => expect(screen.queryByText('Ucapan nomor 9')).not.toBeInTheDocument());
    expect(screen.queryByText('Ucapan nomor 24')).not.toBeInTheDocument();
  });

  it('menyaring RSVP tanpa isi pesan (message kosong / whitespace)', async () => {
    rpcMock.mockResolvedValue({
      data: [
        message('1', 'Budi', 'Terima kasih!'),
        message('2', 'Tanpa', '   '),
        message('3', 'Kosong', ''),
        message('4', 'Siti', null)
      ],
      error: null
    });
    render(<GuestBookWall projectId={PROJECT_ID} />);

    expect(await screen.findByText('Terima kasih!')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Kosong')).not.toBeInTheDocument());
    expect(screen.queryByText('Tanpa')).not.toBeInTheDocument();
    expect(screen.queryByText('Siti')).not.toBeInTheDocument();
  });

  it('menampilkan empty-state bila belum ada ucapan', async () => {
    render(<GuestBookWall projectId={PROJECT_ID} />);
    expect(await screen.findByText(/Belum ada ucapan/)).toBeInTheDocument();
  });

  it('tanpa projectId: tidak memanggil RPC dan menampilkan empty-state', async () => {
    render(<GuestBookWall />);
    expect(await screen.findByText(/Belum ada ucapan/)).toBeInTheDocument();
    expect(rpcMock).not.toHaveBeenCalled();
  });
});