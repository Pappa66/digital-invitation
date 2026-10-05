import { beforeEach, describe, expect, it, vi } from 'vitest';
import { emptyCanvas } from '@/lib/templates';
import { DEMO_TEMPLATES } from '@/lib/templates';
import {
  listPublicTemplates,
  getTemplateById,
  normalizeCustomTemplate,
  listSeedTemplates,
  getSeedTemplateById
} from '@/lib/templates/repository';
import type { CustomTemplate } from '@/lib/api/custom-templates';

const { listVisibleTemplatesMock, demoIsDemoModeMock } = vi.hoisted(() => ({
  listVisibleTemplatesMock: vi.fn(),
  demoIsDemoModeMock: vi.fn().mockReturnValue(false)
}));

vi.mock('@/lib/api/custom-templates', () => ({
  listVisibleTemplates: listVisibleTemplatesMock
}));

vi.mock('@/lib/env', () => ({
  demoIsDemoMode: demoIsDemoModeMock
}));

function customRow(overrides: Partial<CustomTemplate> = {}): CustomTemplate {
  const canvas = emptyCanvas();
  canvas.theme.primary = '#112233';
  canvas.theme.secondary = '#445566';
  return {
    id: 'custom-1',
    name: 'Undangan Kustom',
    category: 'romance',
    canvas_data: canvas,
    visible: true,
    sort_order: 3,
    created_at: '2026-01-02T00:00:00.000Z',
    ...overrides
  };
}

beforeEach(() => {
  listVisibleTemplatesMock.mockReset();
  demoIsDemoModeMock.mockReset();
  demoIsDemoModeMock.mockReturnValue(false);
  listVisibleTemplatesMock.mockResolvedValue([]);
});

describe('repository template — registry gabungan seed + kustom', () => {
  it('listSeedTemplates mengembalikan semua template seed beserta canvas', () => {
    const seed = listSeedTemplates();
    expect(seed.length).toBe(DEMO_TEMPLATES.length);
    expect(seed.every((t) => t.source === 'seed')).toBe(true);
    expect(seed.every((t) => t.canvas && t.canvas.theme)).toBe(true);
  });

  it('listPublicTemplates = seed lalu kustom DB', async () => {
    listVisibleTemplatesMock.mockResolvedValue([customRow()]);
    const items = await listPublicTemplates();
    expect(items.length).toBe(DEMO_TEMPLATES.length + 1);
    const custom = items[items.length - 1];
    expect(custom.id).toBe('custom-1');
    expect(custom.source).toBe('custom');
    expect(custom.meta.isCustom).toBe(true);
    expect(custom.primary).toBe('#112233');
    expect(custom.secondary).toBe('#445566');
  });

  it('gagal query DB → tetap mengembalikan seed (fallback aman)', async () => {
    listVisibleTemplatesMock.mockRejectedValue(new Error('db down'));
    const items = await listPublicTemplates();
    expect(items.length).toBe(DEMO_TEMPLATES.length);
    expect(items.every((t) => t.source === 'seed')).toBe(true);
  });

  it('demo mode → seed saja, tidak menyentuh DB', async () => {
    demoIsDemoModeMock.mockReturnValue(true);
    const items = await listPublicTemplates();
    expect(items.length).toBe(DEMO_TEMPLATES.length);
    expect(listVisibleTemplatesMock).not.toHaveBeenCalled();
  });

  it('normalizeCustomTemplate memberi fallback warna saat theme kosong', () => {
    const row = customRow({ canvas_data: { ...emptyCanvas(), theme: { ...emptyCanvas().theme, primary: '', secondary: '' } } });
    const item = normalizeCustomTemplate(row);
    expect(item.primary).toBeTruthy();
    expect(item.secondary).toBeTruthy();
    expect(item.meta.isCustom).toBe(true);
  });
});

describe('getTemplateById', () => {
  it('menemukan template seed tanpa menyentuh DB', async () => {
    const item = await getTemplateById('elegant-gold');
    expect(item?.source).toBe('seed');
    expect(item?.canvas).toBeTruthy();
    expect(listVisibleTemplatesMock).not.toHaveBeenCalled();
  });

  it('menemukan template kustom dari DB', async () => {
    listVisibleTemplatesMock.mockResolvedValue([customRow({ id: 'custom-xyz' })]);
    const item = await getTemplateById('custom-xyz');
    expect(item?.source).toBe('custom');
    expect(item?.id).toBe('custom-xyz');
  });

  it('mengembalikan null untuk id tak dikenal', async () => {
    expect(await getTemplateById('tidak-ada')).toBeNull();
  });

  it('mengembalikan null saat DB gagal (tidak melempar)', async () => {
    listVisibleTemplatesMock.mockRejectedValue(new Error('db down'));
    expect(await getTemplateById('custom-xyz')).toBeNull();
  });

  it('getSeedTemplateById null untuk id kustom', () => {
    expect(getSeedTemplateById('custom-xyz')).toBeNull();
  });
});
