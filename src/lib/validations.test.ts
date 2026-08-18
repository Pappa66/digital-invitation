import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { validateCanvasData, BLOCK_TYPES } from '@/lib/validations';
import type { BlockType } from '@/lib/types';

// validateCanvasData logs ringkasan error ke console.error saat gagal.
// Bungkam agar output test bersih; status sukses/gagal dibuktikan lewat return.
let errorSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  errorSpy.mockRestore();
});

function baseCanvas() {
  return {
    theme: {
      primary: '#D4AF37',
      secondary: '#8A6D2F',
      background: '#FAF6EF',
      text: '#4A443C',
      font_heading: 'Playfair Display',
      font_body: 'Montserrat',
      layout: 'center',
      hero_style: 'image'
    } as Record<string, unknown>,
    settings: { music_url: '', guest_book_enabled: true } as Record<string, unknown>,
    blocks: [] as Record<string, unknown>[],
    flow: 'stack'
  };
}

function block(type: BlockType, props: Record<string, unknown> = {}): Record<string, unknown> {
  return { id: `b-${type.toLowerCase()}`, type, props };
}

describe('validateCanvasData — 20 block type + field yang disinkronkan BE', () => {
  it('meloloskan kanvas dengan SEMUA 20 block type resmi', () => {
    const canvas = baseCanvas();
    canvas.blocks = BLOCK_TYPES.map((t, i) => ({
      id: `b${i}`,
      type: t,
      props: t === 'Story'
        ? { ev_title: ['A'], ev_date: ['2020'], ev_desc: ['Kisah'] }
        : t === 'Envelope'
          ? { accounts: [{ bank_name: 'BCA', account_number: '123', account_holder: 'A' }] }
          : t === 'Quote'
            ? { original: 'x', latin: 'y', translation: 'z', reference: 'r' }
            : {}
    }));
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.blocks).toHaveLength(20);
    expect(result!.blocks.map((b) => b.type)).toEqual([...BLOCK_TYPES]);
  });

  it('meloloskan tiap block type satu per satu (termasuk Popup, LiveStreaming, CopyText, Watermark, Empty)', () => {
    for (const type of BLOCK_TYPES) {
      const canvas = baseCanvas();
      canvas.blocks = [block(type)];
      const result = validateCanvasData(canvas);
      expect(result, `type ${type} harus lolos`).not.toBeNull();
      expect(result!.blocks[0].type).toBe(type);
    }
  });

  it('meloloskan style.border (field baru yang disync BE)', () => {
    const canvas = baseCanvas();
    canvas.blocks = [block('Hero', { bride: 'A' }), { id: 'b2', type: 'Story', props: {}, style: { border: '2px solid #c9a45c', borderRadius: '24px' } }];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.blocks[1].style?.border).toBe('2px solid #c9a45c');
    expect(result!.blocks[1].style?.borderRadius).toBe('24px');
  });

  it('meloloskan decor.flipX dan decor.flipY', () => {
    const canvas = baseCanvas();
    canvas.blocks = [block('Hero', {}), {
      id: 'b2',
      type: 'Empty',
      props: {},
      decor: [
        { id: 'd1', kind: 'shape', shape: 'heart', x: 10, y: 20, opacity: 0.8, rotation: 90, flipX: true },
        { id: 'd2', kind: 'text', text: 'halo', x: 0, y: 0, flipX: true, flipY: true, align: 'center' }
      ]
    }];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.blocks[1].decor?.[0].flipX).toBe(true);
    expect(result!.blocks[1].decor?.[1].flipY).toBe(true);
  });

  it('meloloskan settings.cover_bg_image dan settings.base_price', () => {
    const canvas = baseCanvas();
    canvas.settings = {
      ...canvas.settings,
      cover_bg_image: 'https://supabase.co/storage/v1/object/public/invitation-assets/u/cover.jpg',
      base_price: 2500000,
      discount_percent: 20,
      promo_code: 'WEDDING20'
    };
    canvas.blocks = [block('Hero', {})];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.settings.cover_bg_image).toBe(
      'https://supabase.co/storage/v1/object/public/invitation-assets/u/cover.jpg'
    );
    expect(result!.settings.base_price).toBe(2500000);
  });

  it('meloloskan theme.card_variant dan theme.card_style', () => {
    const canvas = baseCanvas();
    canvas.theme = { ...canvas.theme, card_style: true, card_variant: 'glass', card_entrance: 'fade' };
    canvas.blocks = [block('Hero', {})];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.theme.card_variant).toBe('glass');
    expect(result!.theme.card_style).toBe(true);
  });

  it('menerapkan default z.fill: guest_book_enabled default true saat tidak diisi', () => {
    const canvas = baseCanvas();
    canvas.settings = { music_url: 'https://x/m.mp3' };
    canvas.blocks = [];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.settings.guest_book_enabled).toBe(true);
    expect(result!.settings.music_url).toBe('https://x/m.mp3');
  });

  it('meloloskan props berisi array BankAccount ketika bentuknya benar', () => {
    const canvas = baseCanvas();
    canvas.blocks = [{
      id: 'env',
      type: 'Envelope',
      props: {
        accounts: [
          { bank_name: 'BCA', account_number: '1234567890', account_holder: 'Aya' },
          { bank_name: 'DANA', account_number: '0812', account_holder: 'Aya' }
        ]
      }
    }];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.blocks[0].props.accounts).toHaveLength(2);
  });

  it('membiarkan flow "free" dan layout valid', () => {
    const canvas = baseCanvas();
    canvas.flow = 'free';
    canvas.blocks = [{ id: 'h', type: 'Hero', props: {}, layout: { x: 12, y: 40, width: 420 } }];
    const result = validateCanvasData(canvas);
    expect(result).not.toBeNull();
    expect(result!.flow).toBe('free');
  });
});

describe('validateCanvasData — kasus GAGAL (harus null)', () => {
  it('menolak null / undefined / non-object', () => {
    expect(validateCanvasData(null)).toBeNull();
    expect(validateCanvasData(undefined)).toBeNull();
    expect(validateCanvasData(42)).toBeNull();
    expect(validateCanvasData('canvas')).toBeNull();
  });

  it('menolak data tanpa theme/settings/blocks (objek kosong)', () => {
    expect(validateCanvasData({})).toBeNull();
  });

  it('menolak lebih dari 50 blok', () => {
    const canvas = baseCanvas();
    canvas.blocks = Array.from({ length: 51 }, (_, i) => ({ id: `b${i}`, type: 'Empty', props: {} }));
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menoleransi tepat 50 blok', () => {
    const canvas = baseCanvas();
    canvas.blocks = Array.from({ length: 50 }, (_, i) => ({ id: `b${i}`, type: 'Empty', props: {} }));
    expect(validateCanvasData(canvas)).not.toBeNull();
  });

  it('menolak props string > 5000 karakter', () => {
    const canvas = baseCanvas();
    canvas.blocks = [block('Text', { text: 'a'.repeat(5001) })];
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menoleransi props string tepat 5000 karakter', () => {
    const canvas = baseCanvas();
    canvas.blocks = [block('Text', { text: 'a'.repeat(5000) })];
    expect(validateCanvasData(canvas)).not.toBeNull();
  });

  it('menolak flow invalid (di luar stack/free)', () => {
    const canvas = baseCanvas();
    canvas.flow = 'diagonal';
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak block type yang tidak dikenal', () => {
    const canvas = baseCanvas();
    canvas.blocks = [{ id: 'x', type: 'Spacer', props: {} }];
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak kunci top-level ekstra (skema strict)', () => {
    const canvas = baseCanvas();
    (canvas as unknown as Record<string, unknown>).extra_key = 'boo';
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak kunci theme ekstra (skema strict)', () => {
    const canvas = baseCanvas();
    (canvas.theme as unknown as Record<string, unknown>).hacked = 'yes';
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak layout width < 100', () => {
    const canvas = baseCanvas();
    canvas.blocks = [{ id: 'h', type: 'Hero', props: {}, layout: { x: 0, y: 0, width: 99 } }];
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak decor.flipX bertipe salah (string, bukan boolean)', () => {
    const canvas = baseCanvas();
    canvas.blocks = [{ id: 'h', type: 'Hero', props: {}, decor: [{ id: 'd', kind: 'shape', x: 0, y: 0, flipX: 'yes' }] }];
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak bank account yang tidak lengkap di props', () => {
    const canvas = baseCanvas();
    canvas.blocks = [{
      id: 'env',
      type: 'Envelope',
      props: { accounts: [{ bank_name: 'BCA' }] }
    }];
    expect(validateCanvasData(canvas)).toBeNull();
  });

  it('menolak nilai settings ilegal (discount_percent > 100 atau music_url > 500)', () => {
    const badPct = baseCanvas();
    badPct.settings = { ...badPct.settings, discount_percent: 101 };
    expect(validateCanvasData(badPct)).toBeNull();

    const badUrl = baseCanvas();
    badUrl.settings = { ...badUrl.settings, music_url: `https://x/${'a'.repeat(501)}` };
    expect(validateCanvasData(badUrl)).toBeNull();
  });

  it('menolak props bernilai null (di luar union BlockProps)', () => {
    const canvas = baseCanvas();
    canvas.blocks = [block('Text', { text: null })];
    expect(validateCanvasData(canvas)).toBeNull();
  });
});