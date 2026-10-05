import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RSVPForm, { parseMenuConfig } from '@/components/guest/rsvp';

const { insertMock, selectMock, rpcMock, demoModeMock } = vi.hoisted(() => ({
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  rpcMock: vi.fn(),
  demoModeMock: vi.fn(() => false)
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: () => ({ insert: insertMock }),
    rpc: rpcMock
  }
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoModeMock
}));

const PROJECT_ID = 'proj-123';
const CHECKIN_TOKEN = '123e4567-e89b-12d3-a456-426614174099';

/** RESPONSE default: Supabase .insert(...).select('checkin_token') mengembalikan token. */
function mockInsertOk(data: unknown = [{ checkin_token: CHECKIN_TOKEN }]) {
  insertMock.mockImplementation(() => ({
    select: selectMock.mockResolvedValue({ data, error: null })
  }));
}

beforeEach(() => {
  insertMock.mockReset();
  selectMock.mockReset();
  rpcMock.mockReset();
  rpcMock.mockResolvedValue({ data: [{ ok: true, error: null }], error: null });
  demoModeMock.mockReset();
  demoModeMock.mockReturnValue(false);
  mockInsertOk();
  localStorage.clear();
});

describe('parseMenuConfig', () => {
  it('mengurai menu multi-baris "Label: A, B, C"', () => {
    const groups = parseMenuConfig('Kuliner: Nasi Kotak, Ayam Geprek\nMinuman: Es Teh, Jus');
    expect(groups).toEqual([
      { label: 'Kuliner', options: ['Nasi Kotak', 'Ayam Geprek'] },
      { label: 'Minuman', options: ['Es Teh', 'Jus'] }
    ]);
  });

  it('mengabaikan baris kosong dan baris tanpa label', () => {
    expect(parseMenuConfig('\n\nKuliner: A, B\n\ncedera\n')).toEqual([{ label: 'Kuliner', options: ['A', 'B'] }]);
  });

  it('mempertahankan tanda titik dua di dalam opsi (nilai URL)', () => {
    expect(parseMenuConfig('Link: https://a.co/x:y')).toEqual([
      { label: 'Link', options: ['https://a.co/x:y'] }
    ]);
  });

  it('mengembalikan array kosong untuk input kosong', () => {
    expect(parseMenuConfig('')).toEqual([]);
    expect(parseMenuConfig('   ')).toEqual([]);
  });
});

describe('RSVPForm — submit & validasi', () => {
  it('mengirim konfirmasi berhasil ke tabel rsvps', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{ title: 'Konfirmasi Kehadiran', success_message: 'Terima kasih!' }} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    const payload = insertMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      project_id: PROJECT_ID,
      name: 'Budi Santoso',
      attendance: 'hadir',
      guest_count: 1
    });
    // Token di-generate client-side dan ikut di-insert.
    expect(typeof payload.checkin_token).toBe('string');
    expect(payload.checkin_token).toMatch(/^[0-9a-f-]{36}$/);
    expect(await screen.findByText('Terima kasih!')).toBeInTheDocument();
  });

  it('menolak nama < 2 karakter dan tidak mengirim', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'A');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Nama terlalu pendek.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('menolak guest_count di luar rentang 1..10', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    // fireEvent (bukan userEvent) agar bisa menyuntik nilai di luar opsi 1..5.
    fireEvent.change(screen.getByLabelText('Jumlah tamu'), { target: { value: '11' } });
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Jumlah tamu tidak valid.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('menolak guest_count 0 (di bawah batas bawah)', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    fireEvent.change(screen.getByLabelText('Jumlah tamu'), { target: { value: '0' } });
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Jumlah tamu tidak valid.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('blokir submit kedua dalam jendela throttle 30 detik', async () => {
    localStorage.setItem(`di_rsvp_last_${PROJECT_ID}`, String(Date.now() - 5_000));
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Terlalu cepat. Silakan tunggu sebentar lalu coba lagi.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('menyimpan timestamp throttle setelah submit berhasil', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalled());
    expect(Number(localStorage.getItem(`di_rsvp_last_${PROJECT_ID}`) ?? 0)).toBeGreaterThan(0);
  });

  it('blok menu (menu_config): menampilkan pilihan per kategori', () => {
    render(
      <RSVPForm
        projectId={PROJECT_ID}
        blockProps={{ menu_config: 'Kuliner: Nasi Kotak, Ayam Geprek\nMinuman: Es Teh, Jus' }}
      />
    );
    expect(screen.getByRole('combobox', { name: /Kuliner/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Nasi Kotak' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ayam Geprek' })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Minuman/ })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Es Teh' })).toBeInTheDocument();
  });

  it('blok menu (menu_config): menyimpan meal_choice & menu_options bersama RSVP (AC PM)', async () => {
    const user = userEvent.setup();
    render(
      <RSVPForm
        projectId={PROJECT_ID}
        blockProps={{ menu_config: 'Kuliner: Nasi Kotak, Ayam Geprek' }}
      />
    );

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.selectOptions(screen.getByRole('combobox', { name: /Kuliner/ }), 'Ayam Geprek');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    const payload = insertMock.mock.calls[0][0];
    expect(payload).toMatchObject({
      project_id: PROJECT_ID,
      name: 'Budi Santoso'
    });
    // AC: pilihan menu harus ikut tersimpan saat insert RSVP.
    expect(payload.meal_choice).toBe('Ayam Geprek');
    expect(payload.menu_options).toEqual([{ label: 'Kuliner', value: 'Ayam Geprek' }]);
  });
});

describe('RSVP — QR personal di layar sukses (US-2 / FE-1)', () => {
  it('insert diikuti select("checkin_token") dan QR personal dirender saat token ada', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RSVPForm projectId={PROJECT_ID} blockProps={{ success_message: 'Terima kasih!' }} />
    );

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    // AC FE-1: setelah insert, meminta checkin_token hasil insert.
    expect(selectMock).toHaveBeenCalledWith('checkin_token');

    await screen.findByText('Terima kasih!');
    // QR dirender sebagai SVG react-qr-code.
    const qr = container.querySelector('svg');
    expect(qr).not.toBeNull();
    // Teks petunjuk panitia tampil.
    expect(screen.getByText(/Pindai QR ini oleh panitia/i)).toBeInTheDocument();
  });

  it('QR memuat URL /absen/{projectId}?t={token} (format rute publik)', async () => {
    const user = userEvent.setup();
    const { container } = render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await screen.findByText('Terima kasih atas konfirmasinya.');
    const svgTitle = container.querySelector('svg title');
    expect(svgTitle).toBeTruthy();
    expect(svgTitle?.textContent).toContain(`/absen/${PROJECT_ID}?t=${CHECKIN_TOKEN}`);
  });

  it('menampilkan token manual di bawah QR + tombol salin (fallback kamera panitia)', async () => {
    const user = userEvent.setup();
    const writeTextSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await screen.findByText('Terima kasih atas konfirmasinya.');
    // Token UUID penuh tampil sebagai teks (bisa dibacakan ke panitia).
    expect(screen.getByText(CHECKIN_TOKEN)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Salin/i }));
    expect(writeTextSpy).toHaveBeenCalledWith(CHECKIN_TOKEN);
    writeTextSpy.mockRestore();
  });

  it('layar sukses tetap merender QR menggunakan token client-side bila DB mengembalikan null', async () => {
    mockInsertOk([{ checkin_token: null }]);
    const user = userEvent.setup();
    const { container } = render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    // Default attendance = hadir → QR harus muncul
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await screen.findByText('Terima kasih atas konfirmasinya.');
    // Token client-side dijadikan fallback — QR tetap muncul untuk hadir.
    expect(container.querySelector('svg')).not.toBeNull();
    expect(screen.getByText(/Pindai QR ini oleh panitia/i)).toBeInTheDocument();
  });

  it('layar sukses TIDAK menampilkan QR untuk attendance tidak hadir', async () => {
    mockInsertOk([{ checkin_token: 'some-token' }]);
    const user = userEvent.setup();
    const { container } = render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    // Pilih "Tidak Hadir"
    await user.click(screen.getByRole('radio', { name: /Tidak/i }));
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));

    await screen.findByText('Terima kasih atas konfirmasinya.');
    // QR dan token tidak ditampilkan untuk yang tidak hadir.
    expect(container.querySelector('svg')).toBeNull();
    expect(screen.queryByText(/Pindai QR ini oleh panitia/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Token manual/i)).not.toBeInTheDocument();
  });

  it('tidak memanggil select/submit DB saat readonly (preview builder)', async () => {
    const user = userEvent.setup();
    const { container } = render(<RSVPForm projectId="" blockProps={{}} readonly />);
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));
    expect(insertMock).not.toHaveBeenCalled();
    expect(container.querySelector('svg')).toBeNull();
  });
});

describe('RSVP — ubah konfirmasi via token (Sprint 4)', () => {
  const TOKEN = '123e4567-e89b-12d3-a456-426614174000';
  const SAVED_KEY = `di_rsvp_saved_${PROJECT_ID}`;

  function seedSaved(overrides: Record<string, unknown> = {}) {
    localStorage.setItem(
      SAVED_KEY,
      JSON.stringify({
        token: TOKEN,
        name: 'Budi Santoso',
        attendance: 'hadir',
        guest_count: 2,
        message: 'Semoga lancar',
        meal_choice: null,
        menu_options: null,
        ...overrides
      })
    );
  }

  it('menyimpan data konfirmasi ke localStorage setelah insert sukses', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{ success_message: 'Terima kasih!' }} />);

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));
    await screen.findByText('Terima kasih!');

    const raw = localStorage.getItem(SAVED_KEY);
    expect(raw).toBeTruthy();
    expect(JSON.parse(raw!)).toMatchObject({
      token: CHECKIN_TOKEN,
      name: 'Budi Santoso',
      attendance: 'hadir',
      guest_count: 1,
      message: ''
    });
  });

  it('menampilkan "Ubah konfirmasi", mengisi ulang form, lalu memanggil RPC update (bukan insert)', async () => {
    seedSaved();
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{ success_message: 'Terima kasih!' }} />);

    const editBtn = await screen.findByRole('button', { name: /Ubah konfirmasi/i });
    await user.click(editBtn);

    // Form terisi ulang dari data tersimpan.
    expect(screen.getByLabelText('Nama Anda')).toHaveValue('Budi Santoso');
    expect(screen.getByLabelText('Jumlah tamu')).toHaveValue('2');
    expect(screen.getByLabelText('Doa & Ucapan')).toHaveValue('Semoga lancar');

    await user.click(screen.getByRole('button', { name: /Perbarui Konfirmasi/i }));

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(1));
    expect(rpcMock).toHaveBeenCalledWith(
      'update_rsvp_by_token',
      expect.objectContaining({
        p_token: TOKEN,
        p_attendance: 'hadir',
        p_guest_count: 2,
        p_message: 'Semoga lancar'
      })
    );
    expect(insertMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Terima kasih!')).toBeInTheDocument();

    // Data tersimpan ikut diperbarui dan melewati throttle.
    expect(JSON.parse(localStorage.getItem(SAVED_KEY)!)).toMatchObject({ token: TOKEN, guest_count: 2 });
  });

  it('menampilkan pesan error bila RPC update mengembalikan ok=false tanpa menyentuh insert', async () => {
    seedSaved();
    rpcMock.mockResolvedValue({ data: [{ ok: false, error: 'Kehadiran tidak valid' }], error: null });
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);

    await user.click(await screen.findByRole('button', { name: /Ubah konfirmasi/i }));
    await user.click(screen.getByRole('button', { name: /Perbarui Konfirmasi/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Gagal memperbarui. Silakan coba lagi.');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('mode demo: update hanya di state lokal, tanpa RPC/insert', async () => {
    demoModeMock.mockReturnValue(true);
    seedSaved();
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{ success_message: 'OK!' }} />);

    await user.click(await screen.findByRole('button', { name: /Ubah konfirmasi/i }));
    await user.click(screen.getByRole('button', { name: /Perbarui Konfirmasi/i }));

    expect(await screen.findByText('OK!')).toBeInTheDocument();
    expect(rpcMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('tanpa data tersimpan: perilaku insert tetap seperti semula', async () => {
    const user = userEvent.setup();
    render(<RSVPForm projectId={PROJECT_ID} blockProps={{}} />);
    expect(screen.queryByRole('button', { name: /Ubah konfirmasi/i })).toBeNull();

    await user.type(screen.getByLabelText('Nama Anda'), 'Budi Santoso');
    await user.click(screen.getByRole('button', { name: /Kirim Konfirmasi/i }));
    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(rpcMock).not.toHaveBeenCalled();
  });
});