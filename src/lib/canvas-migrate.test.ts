import { describe, expect, it } from 'vitest';
import { migrateCanvas, CANVAS_SCHEMA_VERSION } from '@/lib/canvas-migrate';

function legacyCanvas() {
  return {
    theme: { primary: '#D4AF37' },
    settings: { music_url: '' },
    blocks: [{ id: 'b1', type: 'Hero', props: { bride: 'A' } }],
    // Key lama yang belum tentu dikenal skema — harus dipertahankan.
    legacy_key: 'keep-me'
  } as Record<string, unknown>;
}

describe('migrateCanvas', () => {
  it('mengisi schema_version saat absen tanpa membuang data/key asing', () => {
    const out = migrateCanvas(legacyCanvas());
    expect(out.schema_version).toBe(CANVAS_SCHEMA_VERSION);
    expect((out as unknown as Record<string, unknown>).legacy_key).toBe('keep-me');
    expect(out.blocks).toHaveLength(1);
    expect(out.blocks[0].type).toBe('Hero');
  });

  it('idempoten: menjalankan dua kali menghasilkan hasil sama', () => {
    const once = migrateCanvas(legacyCanvas());
    const twice = migrateCanvas(once);
    expect(twice).toEqual(once);
    expect(twice.schema_version).toBe(CANVAS_SCHEMA_VERSION);
  });

  it('tidak memutasi input asli', () => {
    const input = legacyCanvas();
    migrateCanvas(input);
    expect(input.schema_version).toBeUndefined();
  });

  it('tidak menurunkan schema_version yang lebih baru dari aplikasi', () => {
    const out = migrateCanvas({ ...legacyCanvas(), schema_version: 99 });
    expect(out.schema_version).toBe(99);
  });

  it('meneruskan data non-objek apa adanya (biar gate validasi yang menolak)', () => {
    expect(migrateCanvas(null)).toBeNull();
    expect(migrateCanvas('canvas')).toBe('canvas');
    expect(migrateCanvas(42)).toBe(42);
  });
});
