import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CanvasData } from '@/lib/types';
import { TEMPLATE_LIST, getTemplate } from '@/lib/templates';
import { migrateCanvas } from '@/lib/canvas-migrate';
import { validateCanvasData } from '@/lib/validations';

/**
 * GUARD-RAIL undangan lama (Sprint 6, versi aman).
 *
 * Setiap canvas dari DB melewati pipeline `migrateCanvas()` → `validateCanvasData()`
 * sebelum dirender. Test ini mengunci pipeline tersebut untuk SEMUA template seed
 * agar perubahan skema/migrasi di masa depan tidak diam-diam membuat undangan yang
 * sudah aktif gagal render (blank) atau ditolak gate validasi.
 */
describe('seed template — guard pipeline migrateCanvas → validateCanvasData', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    // validateCanvasData mencetak ringkasan error ke console.error saat GAGAL.
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('semua template seed TEMPLATE_LIST lulus migrateCanvas lalu validateCanvasData', () => {
    expect(TEMPLATE_LIST.length).toBeGreaterThan(0);
    const failing: string[] = [];
    for (const meta of TEMPLATE_LIST) {
      const migrated = migrateCanvas(getTemplate(meta.id));
      if (validateCanvasData(migrated) === null) failing.push(meta.id);
    }
    expect(failing, `template gagal pipeline migrasi+validasi: ${failing.join(', ')}`).toEqual([]);
  });

  it('hasil migrasi tidak mengosongkan blok (undangan lama tidak jadi blank)', () => {
    for (const meta of TEMPLATE_LIST) {
      const validated = validateCanvasData(migrateCanvas(getTemplate(meta.id)));
      expect(validated, `${meta.id}: ditolak gate validasi`).not.toBeNull();
      expect(validated!.blocks.length, `${meta.id}: canvas menjadi blank`).toBeGreaterThan(0);
    }
  });

  it('idempoten: migrasi dua kali tetap lolos validasi untuk semua template', () => {
    for (const meta of TEMPLATE_LIST) {
      const once = migrateCanvas(getTemplate(meta.id));
      const twice = migrateCanvas(once);
      expect(validateCanvasData(twice), `${meta.id}: migrasi ganda merusak`).not.toBeNull();
    }
  });
});

describe('CanvasData forward-compatible — key asing tetap lolos', () => {
  it('key top-level & key blok yang belum dikenal dipertahankan dan tetap valid', () => {
    const base = getTemplate('elegant-gold') as CanvasData | null;
    expect(base).not.toBeNull();

    const withForeign = {
      ...(base as CanvasData),
      future_canvas_field: { hello: 'world' },
      blocks: (base as CanvasData).blocks.map((b) => ({ ...b, future_block_field: true }))
    } as unknown as Record<string, unknown>;

    const migrated = migrateCanvas(withForeign) as unknown as Record<string, unknown>;

    // Migrasi tidak boleh membuang key asing (forward-compatible).
    expect(migrated.future_canvas_field).toEqual({ hello: 'world' });
    expect((migrated.blocks as Array<Record<string, unknown>>)[0].future_block_field).toBe(true);
    // Gate validasi tetap meloloskannya (schema passthrough).
    expect(validateCanvasData(migrated)).not.toBeNull();
  });
});
