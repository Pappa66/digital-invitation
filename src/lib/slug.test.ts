import { describe, expect, it } from 'vitest';
import { slugify, sanitizeTitle } from '@/lib/slug';

describe('slugify', () => {
  it('creates lowercase hyphenated slugs', () => {
    expect(slugify('Perkawinan Panca & Sena')).toBe('perkawinan-panca-sena');
  });

  it('strips script / injection attempts', () => {
    expect(slugify('<script>alert(1)</script>')).toBe('scriptalert1script');
    // '.', ';' dan spasi di-'sanitize'; tidak ada karakter berbahaya tersisa
    const out = slugify('foo.sql; DROP TABLE projects--');
    expect(out).not.toMatch(/[.;'"]/);
    expect(out).toContain('foo');
    expect(out).toContain('projects');
    expect(out).not.toMatch(/^foo-sql$/);
  });

  it('removes path traversal characters', () => {
    expect(slugify('../../etc/passwd')).toBe('etcpasswd');
    expect(slugify('..\\..\\win\\system32')).toBe('winsystem32');
  });

  it('rejects spaces-only input with fallback', () => {
    expect(slugify('   ')).toBe('undangan');
    expect(slugify('!!!')).toBe('undangan');
  });

  it('caps length at 60 chars', () => {
    expect(slugify('a'.repeat(200)).length).toBeLessThanOrEqual(60);
  });

  it('one slug per title is deterministic', () => {
    expect(slugify('Undangan Dinda')).toBe(slugify('Undangan Dinda'));
  });
});

describe('sanitizeTitle', () => {
  it('removes control characters', () => {
    expect(sanitizeTitle('A\x00\x1fB')).toBe('AB');
  });

  it('store-safe length cap', () => {
    expect(sanitizeTitle('x'.repeat(1000)).length).toBeLessThanOrEqual(200);
  });

  it('defaults to Tanpa Judul for blank', () => {
    expect(sanitizeTitle('   ')).toBe('Tanpa Judul');
  });

  it('keeps normal text intact', () => {
    expect(sanitizeTitle('Raka & Sena')).toBe('Raka & Sena');
  });
});