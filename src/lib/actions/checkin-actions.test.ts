import { beforeEach, describe, expect, it, vi } from 'vitest';
import { verifyCheckinToken, getAbsProjectMeta } from '@/lib/actions/checkin-actions';
import {
  demoAddRsvp,
  demoAddCheckin,
  demoListCheckins,
  demoListRsvps
} from '@/lib/demo/demo-store';

// checkin-actions.ts memakai createServerSupabase() dari @/lib/supabase/server
// (bukan client). Mock modul server agar tidak menyentuh cookies/network.
const { createServerSupabaseMock } = vi.hoisted(() => ({
  createServerSupabaseMock: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: createServerSupabaseMock
}));

const PROJECT_ID = '123e4567-e89b-12d3-a456-426614174001';
const TOKEN = '123e4567-e89b-12d3-a456-426614174002';

function mockRpc(resolveValue: unknown) {
  const rpc = vi.fn().mockResolvedValue(resolveValue);
  createServerSupabaseMock.mockResolvedValue({ rpc });
  return rpc;
}

beforeEach(() => {
  createServerSupabaseMock.mockReset();
  localStorage.clear();
});

describe('verifyCheckinToken — RPC record_checkin_from_token', () => {
  it('memanggil RPC dengan argumen benar dan meneruskan hasil sukses', async () => {
    const rpc = mockRpc({
      data: [{ ok: true, error: null, name: 'Budi Santoso', guest_count: 2, created_at: '2026-08-19T00:00:00Z' }],
      error: null
    });

    const result = await verifyCheckinToken(PROJECT_ID, TOKEN);

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('record_checkin_from_token', {
      p_project_id: PROJECT_ID,
      p_token: TOKEN
    });
    expect(result).toEqual({
      ok: true,
      name: 'Budi Santoso',
      guest_count: 2,
      created_at: '2026-08-19T00:00:00Z'
    });
  });

  it('menolak project/token non-uuid SEBELUM menyentuh DB', async () => {
    expect(await verifyCheckinToken('proyek', 'token')).toEqual({
      error: 'ID proyek atau token tidak valid'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('menolak token bukan uuid meskipun project uuid valid', async () => {
    expect(await verifyCheckinToken(PROJECT_ID, 'abc')).toEqual({
      error: 'ID proyek atau token tidak valid'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('meneruskan error RPC (rate-limit/token invalid) ke pemanggil', async () => {
    mockRpc({ data: null, error: { message: 'Terlalu cepat. Silakan tunggu sebentar.' } });

    const result = await verifyCheckinToken(PROJECT_ID, TOKEN);
    expect(result).toEqual({ error: 'Terlalu cepat. Silakan tunggu sebentar.' });
  });

  it('mengembalikan error saat RPC sukses tapi tidak ada baris (data null / [])', async () => {
    mockRpc({ data: null, error: null });
    expect(await verifyCheckinToken(PROJECT_ID, TOKEN)).toEqual({
      error: 'Check-in gagal: tidak ada respons'
    });

    mockRpc({ data: [], error: null });
    expect(await verifyCheckinToken(PROJECT_ID, TOKEN)).toEqual({
      error: 'Check-in gagal: tidak ada respons'
    });
  });

  it('meneruskan error baris (ok=false) mis. proyek belum dipublikasikan', async () => {
    mockRpc({ data: [{ ok: false, error: 'proyek belum dipublikasikan' }], error: null });

    expect(await verifyCheckinToken(PROJECT_ID, TOKEN)).toEqual({
      error: 'proyek belum dipublikasikan'
    });
  });

  it('SECURITY: hasil sukses tidak membocorkan field RSVP lain (message/attendance/menu)', async () => {
    // DB hypothetically mengirim kolom ekstra intim — action harus menyaring.
    mockRpc({
      data: [
        {
          ok: true,
          error: null,
          name: 'Budi',
          guest_count: 2,
          created_at: '2026-08-19T00:00:00Z',
          message: 'rahasia pribadi',
          attendance: 'hadir',
          menu_options: [{ label: 'Kuliner', value: 'Ayam' }]
        }
      ],
      error: null
    });

    const result = await verifyCheckinToken(PROJECT_ID, TOKEN);
    expect(result).not.toHaveProperty('message');
    expect(result).not.toHaveProperty('attendance');
    expect(result).not.toHaveProperty('menu_options');
    expect(Object.keys(result)).toEqual(['ok', 'name', 'guest_count', 'created_at']);
  });
});

describe('getAbsProjectMeta — metadata publik /absen (tanpa login)', () => {
  it('memanggil RPC get_abs_project_meta dan meneruskan id/title/slug', async () => {
    const rpc = mockRpc({
      data: [{ id: PROJECT_ID, title: 'Panca & Sena', slug: 'panca-sena' }],
      error: null
    });

    const result = await getAbsProjectMeta(PROJECT_ID);

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('get_abs_project_meta', {
      p_project_id: PROJECT_ID
    });
    expect(result).toEqual({
      meta: { id: PROJECT_ID, title: 'Panca & Sena', slug: 'panca-sena' }
    });
  });

  it('menolak id non-uuid sebelum akses DB', async () => {
    expect(await getAbsProjectMeta('bukan-uuid')).toEqual({
      error: 'ID proyek tidak valid'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('meneruskan error RPC', async () => {
    mockRpc({ data: null, error: { message: 'db: connection refused' } });
    expect(await getAbsProjectMeta(PROJECT_ID)).toEqual({ error: 'db: connection refused' });
  });

  it('menolak proyek tidak ditemukan / belum published (data kosong)', async () => {
    mockRpc({ data: [], error: null });
    expect(await getAbsProjectMeta(PROJECT_ID)).toEqual({
      error: 'Proyek tidak ditemukan atau belum dipublikasikan'
    });
  });

  it('SECURITY: meta hanya memuat id/title/slug — tanpa canvas/RSVP/checkins walau RPC memuat kolom ekstra', async () => {
    mockRpc({
      data: [
        {
          id: PROJECT_ID,
          title: 'Panca & Sena',
          slug: 'panca-sena',
          canvas_data: { blocks: [] },
          status: 'published',
          rsvp: { name: 'Budi' }
        }
      ],
      error: null
    });

    const result = await getAbsProjectMeta(PROJECT_ID);
    expect(result).toEqual({
      meta: { id: PROJECT_ID, title: 'Panca & Sena', slug: 'panca-sena' }
    });
    expect(Object.keys(result.meta!)).toEqual(['id', 'title', 'slug']);
    // Data intim TIDAK boleh muncul di mana pun pada hasil.
    expect(JSON.stringify(result)).not.toContain('canvas_data');
    expect(JSON.stringify(result)).not.toContain('rsvp');
    expect(JSON.stringify(result)).not.toContain('published');
  });
});

describe('demo path — check-in via token (padanan demo verifyCheckinToken)', () => {
  it('token RSVP valid => check-in tersimpan dengan nama/guest_count dari RSVP', () => {
    demoAddRsvp('demo-p1', { name: 'Budi Santoso', attendance: 'hadir', guest_count: 2, message: '' });
    const token = demoListRsvps('demo-p1')[0].checkin_token!;
    expect(token).toBeTruthy();

    expect(demoAddCheckin('demo-p1', { token })).toEqual({});

    const checkins = demoListCheckins('demo-p1');
    expect(checkins).toHaveLength(1);
    expect(checkins[0]).toMatchObject({ project_id: 'demo-p1', name: 'Budi Santoso', guest_count: 2 });
  });

  it('token acak/salah => ditolak tanpa insert check-in', () => {
    demoAddRsvp('demo-p2', { name: 'Aisyah', attendance: 'hadir', guest_count: 1, message: '' });

    expect(demoAddCheckin('demo-p2', { token: '11111111-1111-1111-1111-111111111111' })).toEqual({
      error: 'token tidak valid'
    });
    expect(demoListCheckins('demo-p2')).toHaveLength(0);
  });

  it('scan berulang (idempoten) => tetap satu check-in, tidak menggandakan', () => {
    demoAddRsvp('demo-p3', { name: 'Budi', attendance: 'hadir', guest_count: 2, message: '' });
    const token = demoListRsvps('demo-p3')[0].checkin_token!;

    expect(demoAddCheckin('demo-p3', { token })).toEqual({});
    expect(demoAddCheckin('demo-p3', { token })).toEqual({});

    expect(demoListCheckins('demo-p3')).toHaveLength(1);
  });
});