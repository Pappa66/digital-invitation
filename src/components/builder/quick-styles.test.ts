import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateCanvasData, BlockStyleSchema } from '@/lib/validations';
import type { Block, CanvasData } from '@/lib/types';
import { getTemplate } from '@/lib/templates';

/**
 * GATE QUICK STYLES — preset "Gaya" cepat di builder (`properties-panel.tsx`)
 * harus tetap menghasilkan `block.style` yang SAH menurut BlockStyleSchema,
 * sehingga menekan tombol preset tidak pernah menggugurkan validateCanvasData
 * (gagal simpan/tidak bisa dirender tamu).
 *
 * Dua lapis:
 *  1. STATIC: kunci `style:`/`props:` yang dipakai preset Quick Styles dibaca
 *     dari sumber produksi (`properties-panel.tsx`) dan dibandingkan dengan
 *     skema validasi. Ini mencegah preset memperkenalkan kunci style baru yang
 *     belum disinkronkan ke schema.
 *  2. FUNCTIONAL: menerapkan preset bernilai konkret (hasil runtime tema) ke
 *     template asli, lalu menegaskan validateCanvasData tetap lulus.
 */

const SOURCE = readFileSync('src/components/builder/properties-panel.tsx', 'utf8');
const QUICK_SECTION = SOURCE.slice(
  SOURCE.indexOf('BLOCK QUICK STYLES'),
  SOURCE.indexOf('function isQuickPresetActive')
);

/** Ekstrak kunci yang dipakai dalam objek `{ marker: { k1: ..., k2: ... } }`. */
function keysUsedInObjects(marker: 'style' | 'props'): string[] {
  const keys = new Set<string>();
  const re = new RegExp(`\\b${marker}:\\s*\\{\\s*([^}]*)\\}`, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(QUICK_SECTION)) !== null) {
    const body = m[1];
    for (const k of body.matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*):/gm)) {
      keys.add(k[1]);
    }
  }
  return [...keys];
}

const RESERVED_BLOCK_FIELDS = ['id', 'type', 'props', 'layout', 'style', 'inner', 'decor'];

/** Ambil blok bertipe tertentu dari template; fallback blok pertama. */
function pickBlock(canvas: CanvasData, type: string): Block {
  return canvas.blocks.find((b) => b.type === type) ?? canvas.blocks[0];
}

describe('BLOCK QUICK STYLES — tidak menggugurkan validasi', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('STATIC: semua kunci `style:` preset Quick Styles adalah kunci resmi BlockStyleSchema', () => {
    const styleKeys = keysUsedInObjects('style');
    expect(styleKeys.length).toBeGreaterThan(0);
    const validKeys = new Set(Object.keys(BlockStyleSchema.shape));
    const unknown = styleKeys.filter((k) => !validKeys.has(k));
    expect(unknown, `kunci style tak dikenal di Quick Styles: ${unknown.join(', ')}`).toEqual([]);
  });

  it('STATIC: semua kunci `props:` preset Quick Styles bukan field struktural blok', () => {
    const propsKeys = keysUsedInObjects('props');
    expect(propsKeys.length).toBeGreaterThan(0);
    const misuse = propsKeys.filter((k) => RESERVED_BLOCK_FIELDS.includes(k));
    expect(misuse, `props Quick Styles menabrak field struktural blok: ${misuse.join(', ')}`).toEqual([]);
  });

  it('FUNCTIONAL: preset Countdown "Lingkaran" (props.variant + style tinted) tetap lolos', () => {
    const tpl = getTemplate('elegant-gold')!;
    const target = pickBlock(tpl, 'Countdown');
    target.props = { ...target.props, variant: 'circles' };
    target.style = {
      padding: '48px 24px',
      borderRadius: '28px',
      bgColor: '#D4AF371F', // tint(primary) — hex 6 + alpha 2 digit
      textAlign: 'center'
    };
    expect(validateCanvasData(tpl)).not.toBeNull();
  });

  it('FUNCTIONAL: preset EventDetail "Pita" (bgGradient + textColor putih) tetap lolos', () => {
    const tpl = getTemplate('elegant-gold')!;
    const target = pickBlock(tpl, 'EventDetail');
    target.props = { ...target.props, variant: 'band' };
    target.style = {
      bgGradient: 'linear-gradient(160deg, #D4AF37 0%, #8A6D2F 120%)',
      textColor: '#ffffff',
      borderRadius: '0px',
      padding: '56px 24px',
      textAlign: 'center'
    };
    expect(validateCanvasData(tpl)).not.toBeNull();
  });

  it('FUNCTIONAL: preset umum "Mewah" (border/bgGradient/boxShadow) valid untuk section biasa', () => {
    const tpl = getTemplate('elegant-gold')!;
    for (const block of tpl.blocks.slice(0, 3)) {
      block.style = {
        bgGradient: 'linear-gradient(160deg, #D4AF37 0%, #8A6D2F 100%)',
        border: '2px solid #c9a45c',
        borderRadius: '0px',
        padding: '64px 28px',
        textColor: '#ffffff',
        boxShadow: '0 18px 44px rgba(0,0,0,0.18)'
      };
    }
    expect(validateCanvasData(tpl)).not.toBeNull();
  });

  it('FUNCTIONAL: seluruh template tetap valid meski style Quick Styles dipasang ke blok-blok utamanya', () => {
    // Sampel: terapkan preset "Bold" (textColor putih) ke blok pertama tiap template.
    for (const id of ['elegant-gold', 'emerald-khaki', 'bali-tropical', 'obsidian-noir']) {
      const tpl = getTemplate(id)!;
      for (const b of tpl.blocks.slice(0, 4)) {
        b.style = { bgColor: '#053730', textColor: '#ffffff', borderRadius: '16px', padding: '56px 24px', textAlign: 'center' };
      }
      expect(validateCanvasData(tpl), `${id}: quick style merusak validasi`).not.toBeNull();
    }
  });
});