import { describe, it, expect } from 'vitest';
import { WEDDING_QUOTES, getQuotesByReligion, getQuoteById, RELIGION_LABELS } from '@/lib/quotes';
import { RELIGIONS } from '@/lib/religions';

describe('WEDDING_QUOTES', () => {
  it('menyediakan kutipan untuk semua agama yang dikelola aplikasi', () => {
    for (const religion of RELIGIONS) {
      const quotes = getQuotesByReligion(religion.key);
      expect(quotes.length, `${religion.key} harus punya kutipan`).toBeGreaterThan(0);
    }
  });

  it('setiap kutipan punya konten lengkap dan referensi unik', () => {
    const refs = new Set<string>();
    for (const q of WEDDING_QUOTES) {
      expect(q.original.trim()).toBeTruthy();
      expect(q.translation.trim()).toBeTruthy();
      expect(q.reference.trim()).toBeTruthy();
      expect(refs.has(q.reference), `duplikat referensi: ${q.reference}`).toBe(false);
      refs.add(q.reference);
    }
  });

  it('kutipan islam menyertakan transliterasi latin', () => {
    for (const q of getQuotesByReligion('islam')) {
      expect(q.latin).toBeTruthy();
    }
  });

  it('getQuoteById mengembalikan kutipan yang tepat', () => {
    const first = WEDDING_QUOTES[0];
    expect(getQuoteById(first.id)).toEqual(first);
    expect(getQuoteById('tidak-ada')).toBeUndefined();
  });

  it('label agama lengkap untuk 6 agama', () => {
    expect(RELIGION_LABELS.islam).toBe('Islam');
    expect(RELIGION_LABELS.katholik).toBe('Katolik');
    expect(RELIGION_LABELS.konghucu).toBe('Konghucu');
  });
});