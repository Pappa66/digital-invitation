import { describe, expect, it } from 'vitest';
import { guestLink, guestMessage } from './guest-links';

describe('guestLink', () => {
  it('membuat link personal dengan nama ter-encode', () => {
    expect(guestLink('https://x.com', 'sena-panca', 'Budi Santoso')).toBe('https://x.com/sena-panca?to=Budi%20Santoso');
  });

  it('slug kosong tetap valid', () => {
    expect(guestLink('https://x.com', undefined, 'A')).toBe('https://x.com/?to=A');
  });
});

describe('guestMessage', () => {
  it('mengganti placeholder {nama} dan {link}', () => {
    expect(guestMessage('Hai {nama}, buka {link}', 'Budi', 'https://x/1')).toBe('Hai Budi, buka https://x/1');
  });

  it('pakai template default bila kosong', () => {
    const msg = guestMessage(undefined, 'Budi', 'https://x/1');
    expect(msg).toContain('Budi');
    expect(msg).toContain('https://x/1');
  });
});
