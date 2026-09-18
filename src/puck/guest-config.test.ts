import { describe, expect, it } from 'vitest';
import { buildCoverProps, buildGuestSettings, readHero } from './guest-config';
import { defaultTheme } from '@/puck/theme';
import type { InvitationRootProps } from '@/puck/types';

const theme: InvitationRootProps = { ...defaultTheme, decor: [], guestBookEnabled: 'no', checkinEnabled: 'yes', musicAutoplay: 'no', musicUrl: 'a.mp3' };

describe('readHero', () => {
  it('mengambil nama pasangan dari blok Hero', () => {
    const info = readHero({ content: [{ type: 'Hero', props: { bride: 'Sena', groom: 'Panca', date: '12 Des' } }] });
    expect(info.coupleNames).toBe('Sena & Panca');
    expect(info.date).toBe('12 Des');
    expect(info.caption).toBe('Undangan Pernikahan');
  });

  it('aman saat tidak ada Hero', () => {
    const info = readHero({ content: [] });
    expect(info.coupleNames).toBe('');
    expect(info.bgImage).toBeUndefined();
  });
});

describe('buildGuestSettings', () => {
  it('memetakan toggle root props ke Settings', () => {
    const s = buildGuestSettings(theme) as { guest_book_enabled: boolean; checkin_enabled: boolean; music_autoplay: boolean; music_url: string };
    expect(s.guest_book_enabled).toBe(false);
    expect(s.checkin_enabled).toBe(true);
    expect(s.music_autoplay).toBe(false);
    expect(s.music_url).toBe('a.mp3');
  });
});

describe('buildCoverProps', () => {
  it('mengisi tema + data hero', () => {
    const hero = readHero({ content: [{ type: 'Hero', props: { bride: 'Sena', groom: 'Panca' } }] });
    const props = buildCoverProps(theme, hero, 'Budi');
    expect(props.primary).toBe(theme.primary);
    expect(props.bride).toBe('Sena');
    expect(props.greetingName).toBe('Budi');
  });
});
