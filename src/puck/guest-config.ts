import type { InvitationRootProps } from '@/puck/types';
import type { Settings } from '@/lib/types';

export interface HeroInfo {
  caption: string;
  bride: string;
  groom: string;
  date: string;
  place: string;
  bgImage?: string;
  coupleNames: string;
}

const asString = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

/** Ambil info Hero dari data Puck (dipakai cover & share). */
export function readHero(canvas: { content: { type: string; props?: unknown }[] }): HeroInfo {
  const hero = canvas.content.find((c) => c.type === 'Hero') as { props?: Record<string, unknown> } | undefined;
  const p = hero?.props ?? {};
  const bride = asString(p.bride);
  const groom = asString(p.groom);
  return {
    caption: asString(p.caption, 'Undangan Pernikahan'),
    bride,
    groom,
    date: asString(p.date),
    place: asString(p.place),
    bgImage: asString(p.bg_image) || undefined,
    coupleNames: [bride, groom].filter(Boolean).join(' & ')
  };
}

/** Bangun objek Settings (kontrak komponen guest lama) dari root props Puck. */
export function buildGuestSettings(theme: InvitationRootProps): Settings {
  return {
    music_url: theme.musicUrl ?? '',
    guest_book_enabled: theme.guestBookEnabled !== 'no',
    checkin_enabled: theme.checkinEnabled !== 'no',
    music_autoplay: theme.musicAutoplay !== 'no',
    music_offset_sec: theme.musicOffsetSec ?? 0,
    music_on_section: '',
    religion: theme.religion ?? 'islam'
  } as Settings;
}

/** Props untuk CoverModal dari root theme + hero. */
export function buildCoverProps(theme: InvitationRootProps, hero: HeroInfo, greetingName?: string) {
  return {
    caption: hero.caption,
    bride: hero.bride,
    groom: hero.groom,
    date: hero.date,
    bgImage: hero.bgImage,
    greetingName,
    primary: theme.primary,
    secondary: theme.secondary,
    background: theme.background,
    text: theme.text,
    coverGreeting: theme.coverGreeting,
    coverButtonText: theme.coverButtonText,
    coverBgImage: theme.coverBgImage,
    coverStyle: theme.coverStyle
  };
}
