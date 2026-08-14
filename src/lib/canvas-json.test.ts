import { describe, expect, it } from 'vitest';
import { canvasToJson, jsonToCanvas } from '@/lib/canvas-json';
import type { CanvasData } from '@/lib/types';

function sample(): CanvasData {
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
    },
    settings: { music_url: 'https://example.com/a.mp3', guest_book_enabled: true },
    blocks: [
      { id: 'b-1', type: 'Hero', props: { groom: 'Raka', bride: 'Sena', bg_image: '' } },
      { id: 'b-2', type: 'Gallery', props: { images: ['https://a/x.jpg', 'https://b/y.jpg'] } }
    ]
  };
}

describe('canvas-json roundtrip', () => {
  it('serializes to Json and back without data loss', () => {
    const orig = sample();
    const json = canvasToJson(orig);
    expect(json).toBeInstanceOf(Object);
    const restored = jsonToCanvas(json)!;
    expect(restored).toEqual(orig);
  });

  it('handles null / undefined input gracefully', () => {
    expect(jsonToCanvas(null)).toBeNull();
    expect(jsonToCanvas(undefined)).toBeNull();
    expect(jsonToCanvas('not-an-object')).toBeNull();
  });

  it('rejects functions in the payload (cannot be smuggled via JSON)', () => {
    const orig = sample();
    // cast sengaja agar bisa menyuntik fungsi (pengujian kasus buruk)
    (orig as unknown as Record<string, unknown>).evil = () => 'xss';
    // structuredClone throws DataCloneError for functions, so the JSON
    // payload can never carry executable code.
    expect(() => canvasToJson(orig)).toThrow();
  });

  it('stays well under the 4.5MB Vercel payload budget for a full template', () => {
    const json = JSON.stringify(canvasToJson(sample()));
    const bytes = Buffer.byteLength(json, 'utf8');
    expect(bytes).toBeLessThan(4.5 * 1024 * 1024);
  });
});