import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsDialog from '@/components/dashboard/stats-dialog';

const { rpcMock, demoModeMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { rpc: rpcMock }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174000';
const STATS = { rsvp_total: 12, rsvp_hadir: 8, checkin_total: 5, views_total: 42 };

beforeEach(() => {
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: [STATS], error: null });
  demoModeMock.mockReset();
  demoModeMock.mockReturnValue(false);
});

describe('StatsDialog — panel statistik host per undangan', () => {
  it('memuat statistik lazily saat dibuka lalu menampilkan angkanya', async () => {
    render(<StatsDialog open projectId={PROJECT_ID} title="Raka & Salma" onClose={() => {}} />);

    expect(await screen.findByText('Total RSVP')).toBeInTheDocument();
    await waitFor(() =>
      expect(rpcMock).toHaveBeenCalledWith('get_project_stats', { p_project_id: PROJECT_ID })
    );
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('menampilkan state loading sebelum data tiba', async () => {
    let resolveFn!: (value: { data: unknown; error: unknown }) => void;
    rpcMock.mockImplementation(
      () => new Promise((resolve) => {
        resolveFn = resolve;
      })
    );
    render(<StatsDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    expect(screen.getByText('Memuat statistik…')).toBeInTheDocument();
    resolveFn({ data: [STATS], error: null });
    expect(await screen.findByText('Total RSVP')).toBeInTheDocument();
  });

  it('tidak memuat apa pun saat open=false (hemat, tidak untuk semua kartu)', () => {
    render(<StatsDialog open={false} projectId={PROJECT_ID} onClose={() => {}} />);
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it('menampilkan error ramah dan tombol coba lagi memicu ulang pemuatan', async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { message: 'boom' } });
    rpcMock.mockResolvedValueOnce({ data: [STATS], error: null });
    const user = userEvent.setup();
    render(<StatsDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memuat statistik');
    await user.click(screen.getByRole('button', { name: /Coba lagi/i }));

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('Total RSVP')).toBeInTheDocument();
  });

  it('mode demo: angka kosong tanpa memanggil RPC', async () => {
    demoModeMock.mockReturnValue(true);
    render(<StatsDialog open projectId={PROJECT_ID} onClose={() => {}} />);

    expect(await screen.findByText('Total RSVP')).toBeInTheDocument();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('menutup dialog memanggil onClose', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<StatsDialog open projectId={PROJECT_ID} onClose={onClose} />);

    await user.click(await screen.findByRole('button', { name: /Close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
