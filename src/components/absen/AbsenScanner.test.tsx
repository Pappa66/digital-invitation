import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AbsenScanner, { parseAbsenTokenFromQr } from '@/components/absen/AbsenScanner';

const { verifyCheckinTokenMock, qrStartSpy, qrStopSpy, decodeCallbackRef, startShouldRejectRef } = vi.hoisted(() => ({
  verifyCheckinTokenMock: vi.fn(),
  qrStartSpy: vi.fn(),
  qrStopSpy: vi.fn(),
  decodeCallbackRef: { current: null as null | ((text: string) => void) },
  startShouldRejectRef: { current: false }
}));

vi.mock('@/lib/actions/checkin-actions', () => ({
  verifyCheckinToken: verifyCheckinTokenMock
}));

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: class {
    isScanning = false;
    elementId: string;
    constructor(elementId: string) {
      this.elementId = elementId;
    }
    async start(
      _cfg: unknown,
      _opts: unknown,
      onDecoded: (text: string) => void
    ) {
      if (startShouldRejectRef.current) {
        throw new Error('NotAllowedError: permission denied');
      }
      this.isScanning = true;
      decodeCallbackRef.current = onDecoded;
      // CATATAN: gunakan this.elementId — parameter constructor tidak
      // terlihat di ruang lingkup metode (bug mock, bukan produksi).
      qrStartSpy(this.elementId);
    }
    async stop() {
      this.isScanning = false;
      qrStopSpy();
    }
    clear() {
      /* no-op */
    }
  }
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174001';
const TOKEN = '123e4567-e89b-12d3-a456-426614174099';
const QR_TEXT = `${'https://example.test'}/absen/${PROJECT_ID}?t=${TOKEN}`;

function simulateDecode(text: string) {
  const cb = decodeCallbackRef.current;
  if (!cb) throw new Error('kamera belum dimulai / decode callback belum terpasang');
  cb(text);
}

beforeEach(() => {
  verifyCheckinTokenMock.mockReset();
  qrStartSpy.mockClear();
  qrStopSpy.mockClear();
  decodeCallbackRef.current = null;
  startShouldRejectRef.current = false;
  verifyCheckinTokenMock.mockResolvedValue({
    ok: true,
    name: 'Budi Santoso',
    guest_count: 2
  });
});

describe('parseAbsenTokenFromQr (pure)', () => {
  it('mengambil token dari URL /absen/{projectId}?t={token}', () => {
    expect(parseAbsenTokenFromQr(QR_TEXT)).toBe(TOKEN);
  });

  it('menerima token polos (uuid) tanpa URL', () => {
    expect(parseAbsenTokenFromQr(TOKEN)).toBe(TOKEN);
  });

  it('mengabaikan spasi di sekitar teks', () => {
    expect(parseAbsenTokenFromQr(`  ${TOKEN}  `)).toBe(TOKEN);
  });

  it('menolak teks kosong / null', () => {
    expect(parseAbsenTokenFromQr('')).toBeNull();
    expect(parseAbsenTokenFromQr('   ')).toBeNull();
    expect(parseAbsenTokenFromQr(null as unknown as string)).toBeNull();
  });

  it('menolak URL tanpa parameter t', () => {
    expect(parseAbsenTokenFromQr('https://example.test/absen/x')).toBeNull();
  });

  it('menolak string non-URL yang bukan token (bukan uuid-looking)', () => {
    expect(parseAbsenTokenFromQr('cek!rahasia')).toBeNull();
  });
});

describe('AbsenScanner — komponen scanner /absen', () => {
  it('menampilkan tombol "Nyalakan Kamera" tanpa menyalakan kamera otomatis', async () => {
    render(<AbsenScanner projectId={PROJECT_ID} />);
    expect(screen.getByTestId('absen-scanner')).toBeInTheDocument();
    // Kamera hanya menyala setelah user gesture (wajib di perangkat seluler).
    expect(qrStartSpy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Nyalakan Kamera/i })).toBeInTheDocument();
  });

  it('klik "Nyalakan Kamera" menyalakan Html5Qrcode.start', async () => {
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));
    await waitFor(() => expect(qrStartSpy).toHaveBeenCalled());
  });

  it('scan QR valid => memanggil verifyCheckinToken dengan token & menampilkan nama tamu + jumlah', async () => {
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));
    await waitFor(() => expect(qrStartSpy).toHaveBeenCalled());

    simulateDecode(QR_TEXT);

    await waitFor(() =>
      expect(verifyCheckinTokenMock).toHaveBeenCalledWith(PROJECT_ID, TOKEN)
    );
    expect(await screen.findByText('Check-in berhasil')).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText(/2 tamu/)).toBeInTheDocument();
  });

  it('scan QR tidak dikenal => pesan error + kamera dibuka ulang', async () => {
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));
    await waitFor(() => expect(qrStartSpy).toHaveBeenCalled());

    simulateDecode('cek!rahasia'); // gagal parse token regex => dianggap QR asing

    expect(await screen.findByRole('alert')).toHaveTextContent('Kode QR tidak dikenali');
    expect(verifyCheckinTokenMock).not.toHaveBeenCalled();
  });

  it('token ditolak (mis. non-published / token salah) => error ditampilkan tanpa nama tamu', async () => {
    verifyCheckinTokenMock.mockResolvedValue({
      ok: false,
      error: undefined
    });
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));
    await waitFor(() => expect(qrStartSpy).toHaveBeenCalled());

    simulateDecode(QR_TEXT);

    expect(await screen.findByRole('alert')).toHaveTextContent('Check-in ditolak');
    // SECURITY: jangan ekspos nama tamu saat token ditolak.
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
  });

  it('input token manual => memanggil verifyCheckinToken dengan token manual', async () => {
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));
    await waitFor(() => expect(qrStartSpy).toHaveBeenCalled());

    await user.type(screen.getByLabelText(/Atau masukkan token manual/i), TOKEN);
    await user.click(screen.getByRole('button', { name: /Verifikasi/i }));

    await waitFor(() => expect(verifyCheckinTokenMock).toHaveBeenCalledWith(PROJECT_ID, TOKEN));
    expect(await screen.findByText('Check-in berhasil')).toBeInTheDocument();
  });

  it('kamera ditolak browser (start gagal) => mode error kamera dengan pesan jelas', async () => {
    startShouldRejectRef.current = true;
    const user = userEvent.setup();
    render(<AbsenScanner projectId={PROJECT_ID} />);
    await user.click(screen.getByRole('button', { name: /Nyalakan Kamera/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Kamera tidak dapat dibuka');
    expect(alert).toHaveTextContent(/Akses kamera ditolak/i);
    // Token tidak ikut diverifikasi saat kamera gagal.
    expect(verifyCheckinTokenMock).not.toHaveBeenCalled();
  });
});