import { describe, expect, it } from 'vitest';
import { toEmbedUrl } from './embed';

describe('toEmbedUrl', () => {
  it('YouTube watch → embed', () => {
    expect(toEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube.com/embed/abc123');
  });
  it('youtu.be → embed', () => {
    expect(toEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123');
  });
  it('Vimeo → player', () => {
    expect(toEmbedUrl('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345');
  });
  it('URL embed/Google Maps dikembalikan apa adanya', () => {
    expect(toEmbedUrl('https://www.google.com/maps/embed?pb=x')).toBe('https://www.google.com/maps/embed?pb=x');
  });
  it('kosong/invalid → null', () => {
    expect(toEmbedUrl('')).toBeNull();
    expect(toEmbedUrl('bukan url')).toBeNull();
  });
});
