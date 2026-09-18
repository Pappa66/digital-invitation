import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRCode from 'react-qr-code';
import CheckIn from '@/components/guest/check-in';

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: () => false
}));

const PROJECT_ID = 'proj-checkin-1';

function setQuery(qs: string) {
  window.history.replaceState({}, '', `/${PROJECT_ID}${qs}`);
}

beforeEach(() => {
  localStorage.clear();
  setQuery('');
});

describe('CheckIn — QR panitia (tanpa form manual)', () => {
  it('preview mode: tidak merender apa pun', () => {
    const { container } = render(<CheckIn projectId={PROJECT_ID} preview />);
    expect(container.innerHTML).toBe('');
  });

  it('menampilkan tombol toggle QR panitia, bukan form check-in manual', () => {
    render(<CheckIn projectId={PROJECT_ID} />);
    expect(screen.getByRole('button', { name: /Tampilkan QR Panitia/i })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Nama Anda')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Check-in$/i })).not.toBeInTheDocument();
  });

  it('QR panitia mengarah ke rute publik /absen/{projectId}', async () => {
    const expectedUrl = `${window.location.origin}/absen/${PROJECT_ID}`;
    const ref = render(<QRCode value={expectedUrl} size={140} />);
    const refD = ref.container.querySelector<SVGSVGElement>('svg[width="140"]')?.querySelector('path')?.getAttribute('d');
    expect(refD).toBeTruthy();
    ref.unmount();

    const user = userEvent.setup();
    render(<CheckIn projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Tampilkan QR Panitia/i }));

    await waitFor(() => {
      const qrSvg = document.querySelector<SVGSVGElement>('svg[width="140"]');
      expect(qrSvg).toBeTruthy();
      expect(qrSvg?.querySelector('path')?.getAttribute('d')).toBe(refD);
    });
  });

  it('mode ?absen=1 tidak lagi menampilkan form manual', () => {
    setQuery('?absen=1');
    render(<CheckIn projectId={PROJECT_ID} />);
    expect(screen.queryByPlaceholderText('Nama Anda')).not.toBeInTheDocument();
    expect(screen.getByText(/Absensi Kehadiran/i)).toBeInTheDocument();
  });
});
