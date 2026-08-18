import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listTemplateDemos, upsertTemplateDemo } from '@/lib/actions/template-demo-actions';

const { requireInternalUserMock, createServerSupabaseMock, revalidatePathMock } = vi.hoisted(() => ({
  requireInternalUserMock: vi.fn(),
  createServerSupabaseMock: vi.fn(),
  revalidatePathMock: vi.fn()
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabase: createServerSupabaseMock,
  requireInternalUser: requireInternalUserMock
}));

vi.mock('next/cache', () => ({
  revalidatePath: revalidatePathMock
}));

const OPERATOR = { id: 'u1', email: 'digitalprasha@gmail.com' };
const VALID_INPUT = {
  template_id: 'elegant-gold',
  demo_image: 'https://cdn.example.com/demos/elegant-gold.png',
  demo_link: 'https://demo.example.com/elegant-gold'
};

function mockSupabaseSelect(data: unknown, error: { message: string } | null) {
  const select = vi.fn(async () => ({ data, error }));
  createServerSupabaseMock.mockResolvedValue({
    from: vi.fn(() => ({ select }))
  });
  return select;
}

function mockSupabaseUpsert(error: { message: string } | null) {
  const upsert = vi.fn<
    (payload: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
  >(async () => ({ error }));
  createServerSupabaseMock.mockReturnValue({
    from: vi.fn(() => ({ upsert }))
  });
  return upsert;
}

beforeEach(() => {
  requireInternalUserMock.mockReset();
  createServerSupabaseMock.mockReset();
  revalidatePathMock.mockReset();
  requireInternalUserMock.mockResolvedValue(OPERATOR);
});

describe('listTemplateDemos — baca publik (RLS SELECT anon)', () => {
  it('memetakan baris menjadi Record keyed by template_id', async () => {
    mockSupabaseSelect(
      [
        { template_id: 'elegant-gold', demo_image: 'https://cdn/a.png', demo_link: 'https://demo/a' },
        { template_id: 'boho-earth', demo_image: null, demo_link: null }
      ],
      null
    );

    const result = await listTemplateDemos();

    expect(result).toEqual({
      'elegant-gold': { template_id: 'elegant-gold', demo_image: 'https://cdn/a.png', demo_link: 'https://demo/a' },
      'boho-earth': { template_id: 'boho-earth', demo_image: null, demo_link: null }
    });
  });

  it('return {} saat query gagal (landing tidak boleh ikut crash)', async () => {
    mockSupabaseSelect(null, { message: 'db: down' });
    expect(await listTemplateDemos()).toEqual({});
  });

  it('mengembalikan {} untuk daftar kosong', async () => {
    mockSupabaseSelect([], null);
    expect(await listTemplateDemos()).toEqual({});
  });

  it('SECURITY: hanya field demo metadata yang diteruskan, kolom ekstra DB dibuang', async () => {
    // DB hypothetically mengirim kolom tambahan (updated_at/dll) — action
    // hanya boleh mengekspos template_id, demo_image, demo_link.
    mockSupabaseSelect(
      [
        {
          template_id: 'elegant-gold',
          demo_image: 'https://cdn/a.png',
          demo_link: 'https://demo/a',
          updated_at: '2026-08-19T00:00:00Z',
          is_internal: true
        }
      ],
      null
    );

    const result = await listTemplateDemos();
    expect(result['elegant-gold']).toEqual({
      template_id: 'elegant-gold',
      demo_image: 'https://cdn/a.png',
      demo_link: 'https://demo/a'
    });
    expect(Object.keys(result['elegant-gold'])).toEqual(['template_id', 'demo_image', 'demo_link']);
    expect(JSON.stringify(result)).not.toContain('updated_at');
    expect(JSON.stringify(result)).not.toContain('is_internal');
  });
});

describe('upsertTemplateDemo — server action internal (gate operator)', () => {
  it('menolak tanpa user internal SEBELUM menyentuh DB', async () => {
    requireInternalUserMock.mockResolvedValue(null);
    expect(await upsertTemplateDemo(VALID_INPUT)).toEqual({ error: 'Unauthorized' });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('menolak template_id bukan slug', async () => {
    expect(await upsertTemplateDemo({ ...VALID_INPUT, template_id: 'Elegant Gold!' })).toEqual({
      error: 'ID template harus berupa slug (huruf kecil, angka, dan tanda hubung)'
    });
    expect(await upsertTemplateDemo({ ...VALID_INPUT, template_id: '' })).toEqual({
      error: 'ID template wajib diisi'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('menolak demo_image / demo_link yang bukan URL valid', async () => {
    expect(await upsertTemplateDemo({ ...VALID_INPUT, demo_image: 'bukan-url' })).toEqual({
      error: 'Gambar demo harus URL valid'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('SECURITY: menolak skema URL berbahaya (javascript:/file:) walau URL valid', async () => {
    expect(await upsertTemplateDemo({ ...VALID_INPUT, demo_link: 'javascript:alert(1)' })).toEqual({
      error: 'Link demo harus URL http:// atau https://'
    });
    expect(await upsertTemplateDemo({ ...VALID_INPUT, demo_image: 'file:///etc/passwd' })).toEqual({
      error: 'Gambar demo harus URL http:// atau https://'
    });
    expect(await upsertTemplateDemo({ ...VALID_INPUT, demo_link: 'data:text/html,x' })).toEqual({
      error: 'Link demo harus URL http:// atau https://'
    });
    expect(createServerSupabaseMock).not.toHaveBeenCalled();
  });

  it('menerima null untuk demo_image dan demo_link', async () => {
    const upsert = mockSupabaseUpsert(null);
    const result = await upsertTemplateDemo({
      template_id: 'elegant-gold',
      demo_image: null,
      demo_link: null
    });
    expect(result).toEqual({});
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it('men-trim string dan mengubah string kosong menjadi null', async () => {
    const upsert = mockSupabaseUpsert(null);
    await upsertTemplateDemo({
      template_id: '  elegant-gold  ',
      demo_image: '  https://cdn.example.com/demo.png  ',
      demo_link: '   '
    });

    const payload = upsert.mock.calls[0][0];
    expect(payload).toMatchObject({
      template_id: 'elegant-gold',
      demo_image: 'https://cdn.example.com/demo.png',
      demo_link: null
    });
  });

  it('sukses upsert dengan updated_at + revalidate landing', async () => {
    const upsert = mockSupabaseUpsert(null);
    const before = Date.now();

    const result = await upsertTemplateDemo(VALID_INPUT);

    expect(result).toEqual({});
    const fromMock = createServerSupabaseMock.mock.results[0].value.from;
    expect(fromMock).toHaveBeenCalledWith('template_demos');

    const payload = upsert.mock.calls[0][0];
    expect(payload).toMatchObject(VALID_INPUT);
    expect(typeof payload.updated_at).toBe('string');
    expect(new Date(String(payload.updated_at)).getTime()).toBeGreaterThanOrEqual(before - 1000);

    expect(revalidatePathMock).toHaveBeenCalledWith('/');
  });

  it('meneruskan error dari Supabase', async () => {
    mockSupabaseUpsert({ message: 'db: RLS denied' });
    expect(await upsertTemplateDemo(VALID_INPUT)).toEqual({ error: 'db: RLS denied' });
  });
});
