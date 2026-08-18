import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTemplateDemos, demoByTemplateId, upsertTemplateDemoClient } from '@/lib/api/template-demo-client';

const { supabaseMock, demoIsDemoModeMock } = vi.hoisted(() => ({
  supabaseMock: { from: vi.fn() },
  demoIsDemoModeMock: vi.fn().mockReturnValue(false)
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: supabaseMock
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoIsDemoModeMock
}));

const VALID_INPUT = {
  template_id: 'elegant-gold',
  demo_image: 'https://cdn.example.com/demos/elegant-gold.png',
  demo_link: 'https://demo.example.com/elegant-gold'
};

function mockUpsert(error: { message: string } | null) {
  const upsert = vi.fn<
    (payload: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  >(async () => ({ error }));
  supabaseMock.from.mockReturnValue({ upsert });
  return upsert;
}

beforeEach(() => {
  supabaseMock.from.mockReset();
  demoIsDemoModeMock.mockReset();
  demoIsDemoModeMock.mockReturnValue(false);
});

describe('listTemplateDemos — baca demo metadata untuk katalog landing (RLS select anon)', () => {
  function mockSelect(data: unknown, error: { message: string } | null) {
    const select = vi.fn(async () => ({ data, error }));
    supabaseMock.from.mockReturnValue({ select });
    return select;
  }

  it('memetakan baris menjadi array TemplateDemo', async () => {
    const select = mockSelect(
      [
        { template_id: 'elegant-gold', demo_image: 'https://cdn/a.png', demo_link: 'https://demo/a' },
        { template_id: 'boho-earth', demo_image: null, demo_link: null }
      ],
      null
    );

    const result = await listTemplateDemos();

    expect(supabaseMock.from).toHaveBeenCalledWith('template_demos');
    expect(select).toHaveBeenCalledWith('template_id, demo_image, demo_link');
    expect(result).toEqual([
      { template_id: 'elegant-gold', demo_image: 'https://cdn/a.png', demo_link: 'https://demo/a' },
      { template_id: 'boho-earth', demo_image: null, demo_link: null }
    ]);
  });

  it('mengembalikan [] saat query gagal (katalog tetap hidup tanpa metadata)', async () => {
    mockSelect(null, { message: 'db: down' });
    expect(await listTemplateDemos()).toEqual([]);
  });

  it('mengembalikan [] saat daftar kosong', async () => {
    mockSelect([], null);
    expect(await listTemplateDemos()).toEqual([]);
  });

  it('mengembalikan [] di demo mode (NEXT_PUBLIC_DEMO_MODE=true) tanpa menyentuh supabase', async () => {
    demoIsDemoModeMock.mockReturnValue(true);
    expect(await listTemplateDemos()).toEqual([]);
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });
});

describe('demoByTemplateId — helper lookup template', () => {
  it('mengembalikan demo yang cocok dengan template_id', () => {
    const demos = [
      { template_id: 'elegant-gold', demo_image: 'https://cdn/a.png', demo_link: null },
      { template_id: 'boho-earth', demo_image: null, demo_link: 'https://demo/b' }
    ];
    expect(demoByTemplateId(demos, 'boho-earth')).toEqual(demos[1]);
  });

  it('mengembalikan null bila tidak ada baris template itu', () => {
    expect(demoByTemplateId([{ template_id: 'a', demo_image: null, demo_link: null }], 'missing')).toBeNull();
    expect(demoByTemplateId([], 'elegant-gold')).toBeNull();
  });
});

/**
 * Klien anon/non-operator TIDAK boleh bisa menulis: RLS INSERT/UPDATE
 * template_demos (migrasi 0014) hanya mengizinkan public.is_internal().
 * Fungsi ini aman diekspos ke client HANYA karena database memfilter,
 * bukan karena percaya pada client.
 */
describe('upsertTemplateDemoClient — jalur supabase client (RLS is_internal)', () => {
  it('sukses upsert via supabase client dengan updated_at', async () => {
    const upsert = mockUpsert(null);
    const before = Date.now();

    const result = await upsertTemplateDemoClient(VALID_INPUT);

    expect(result).toEqual({});
    expect(supabaseMock.from).toHaveBeenCalledWith('template_demos');

    const payload = upsert.mock.calls[0][0];
    expect(payload).toMatchObject(VALID_INPUT);
    expect(typeof payload.updated_at).toBe('string');
    expect(new Date(String(payload.updated_at)).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });

  it('menolak template_id bukan slug', async () => {
    expect(await upsertTemplateDemoClient({ ...VALID_INPUT, template_id: 'Not A Slug!' })).toEqual({
      error: 'ID template harus berupa slug (huruf kecil, angka, dan tanda hubung)'
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('menolak URL tidak valid pada demo_image', async () => {
    expect(await upsertTemplateDemoClient({ ...VALID_INPUT, demo_image: 'bukan-url' })).toEqual({
      error: 'Gambar demo harus URL valid'
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('SECURITY: menolak skema URL berbahaya (javascript:/file:/data:)', async () => {
    expect(await upsertTemplateDemoClient({ ...VALID_INPUT, demo_image: 'file:///etc/passwd' })).toEqual({
      error: 'Gambar demo harus URL http:// atau https://'
    });
    expect(await upsertTemplateDemoClient({ ...VALID_INPUT, demo_link: 'javascript:alert(1)' })).toEqual({
      error: 'Link demo harus URL http:// atau https://'
    });
    expect(await upsertTemplateDemoClient({ ...VALID_INPUT, demo_link: 'data:text/html,x' })).toEqual({
      error: 'Link demo harus URL http:// atau https://'
    });
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it('men-trim input dan mengubah string kosong menjadi null', async () => {
    const upsert = mockUpsert(null);
    await upsertTemplateDemoClient({
      template_id: ' boho-earth ',
      demo_image: '',
      demo_link: ' https://demo.example.com/boho '
    });

    const payload = upsert.mock.calls[0][0];
    expect(payload).toMatchObject({
      template_id: 'boho-earth',
      demo_image: null,
      demo_link: 'https://demo.example.com/boho'
    });
  });

  it('meneruskan error RLS (non-operator / RLS denied)', async () => {
    mockUpsert({ message: 'new row violates row-level security policy' });
    expect(await upsertTemplateDemoClient(VALID_INPUT)).toEqual({
      error: 'new row violates row-level security policy'
    });
  });

  it('menangkap exception tak terduga dari client supabase', async () => {
    supabaseMock.from.mockImplementation(() => {
      throw new Error('network: blocked');
    });
    expect(await upsertTemplateDemoClient(VALID_INPUT)).toEqual({ error: 'network: blocked' });
  });
});