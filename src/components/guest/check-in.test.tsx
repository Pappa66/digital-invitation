import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CheckIn from '@/components/guest/check-in';

const { insertMock } = vi.hoisted(() => ({
  insertMock: vi.fn()
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({ insert: insertMock })
  }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: () => false
}));

const PROJECT_ID = 'proj-checkin-1';

function setQuery(qs: string) {
  window.history.replaceState({}, '', `/${PROJECT_ID}${qs}`);
}

beforeEach(() => {
  insertMock.mockReset();
  insertMock.mockResolvedValue({ error: null });
  localStorage.clear();
  setQuery('');
});

describe('CheckIn — jalur QR absen (?absen=1)', () => {
  it('preview mode: tidak merender apa pun', () => {
    const { container } = render(<CheckIn projectId={PROJECT_ID} preview />);
    expect(container.innerHTML).toBe('');
  });

  it('mode normal (tanpa ?absen=1): hanya menampilkan tombol toggle QR, bukan form check-in', () => {
    render(<CheckIn projectId={PROJECT_ID} />);
    expect(screen.getByRole('button', { name: /Tampilkan QR Absen/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Nama Anda')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Check-in/i })).not.toBeInTheDocument();
  });

  it('mode ?absen=1: menampilkan form dan check-in berhasil tersimpan', async () => {
    setQuery('?absen=1');
    const user = userEvent.setup();
    render(<CheckIn projectId={PROJECT_ID} />);

    // Form tampil otomatis di mode absen (tanpa perlu buka QR).
    expect(await screen.findByPlaceholderText('Nama Anda')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Nama Anda'), 'Siti Aminah');
    await user.selectOptions(screen.getByRole('combobox'), '2');
    await user.click(screen.getByRole('button', { name: /Check-in/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(insertMock.mock.calls[0][0]).toMatchObject({
      project_id: PROJECT_ID,
      name: 'Siti Aminah',
      guest_count: 2
    });

    expect(await screen.findByText('Check-in berhasil')).toBeInTheDocument();
  });

  it('nama < 2 karakter: check-in tidak dikirim', async () => {
    setQuery('?absen=1');
    const user = userEvent.setup();
    render(<CheckIn projectId={PROJECT_ID} />);

    await user.type(await screen.findByPlaceholderText('Nama Anda'), 'A');
    await user.click(screen.getByRole('button', { name: /Check-in/i }));

    // Validasi gagal diam-diam (return), tidak ada insert & tidak ada status done.
    expect(insertMock).not.toHaveBeenCalled();
    expect(screen.queryByText('Check-in berhasil')).not.toBeInTheDocument();
  });

  it('THROTTLE 60s: duplicate submit dalam window ditolak DI SEMUA MODE (termasuk absen)', async () => {
    localStorage.setItem(`di_checkin_${PROJECT_ID}`, String(Date.now() - 5_000));
    setQuery('?absen=1');
    const user = userEvent.setup();
    render(<CheckIn projectId={PROJECT_ID} />);

    await user.type(await screen.findByPlaceholderText('Nama Anda'), 'Siti Aminah');
    await user.click(screen.getByRole('button', { name: /Check-in/i }));

    // AC throttle fix: submit kedua dalam window 60s TIDAK masuk DB.
    expect(insertMock).not.toHaveBeenCalled();
    // Umpan balik jelas ke pengguna.
    expect(await screen.findByRole('alert')).toHaveTextContent('Tunggu sebentar sebelum check-in lagi');
  });

  it('mode ?absen=1 tetap jalan untuk pengguna baru (belum pernah check-in)', async () => {
    setQuery('?absen=1');
    const user = userEvent.setup();
    render(<CheckIn projectId={PROJECT_ID} />);

    await user.type(await screen.findByPlaceholderText('Nama Anda'), 'Dewi Lestari');
    await user.click(screen.getByRole('button', { name: /Check-in/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(insertMock.mock.calls[0][0]).toMatchObject({ name: 'Dewi Lestari' });
  });

  it('mode non-absen: tidak ada form => tidak ada jalur submit ke tabel checkins', async () => {
    localStorage.setItem(`di_checkin_${PROJECT_ID}`, String(Date.now() - 1_000));
    render(<CheckIn projectId={PROJECT_ID} />);
    expect(screen.queryByPlaceholderText('Nama Anda')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Check-in/i })).not.toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });
});