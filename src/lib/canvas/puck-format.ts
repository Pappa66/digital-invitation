import type { Data } from '@puckeditor/core';
import type { InvitationRootProps, POCProps } from '@/puck/types';
import { defaultTheme } from '@/puck/theme';

export type PuckData = Data<POCProps, InvitationRootProps>;

/**
 * Mendeteksi data Puck (`{ root, content }`) vs format lama CanvasData
 * (`{ blocks, theme, settings }`). Dipakai agar undangan lama tetap bisa
 * dirender dengan renderer lama, dan yang baru memakai <Render> Puck.
 */
export function isPuckData(value: unknown): value is PuckData {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return Array.isArray(v.content) && !!v.root && typeof v.root === 'object' && !Array.isArray(v.blocks);
}

/** Data Puck kosong dengan tema default. */
export function emptyPuckData(): PuckData {
  return {
    root: {
      props: {
        ...defaultTheme,
        decor: [],
        showCover: 'yes',
        coverGreeting: 'Kepada Yth.',
        coverButtonText: 'Buka Undangan',
        coverStyle: 'floral',
        musicUrl: '',
        musicAutoplay: 'yes',
        musicOffsetSec: 0,
        guestBookEnabled: 'yes',
        guestBookTitle: 'Buku Tamu & Ucapan',
        checkinEnabled: 'yes',
        religion: 'islam'
      }
    },
    content: []
  };
}

/** Ambil nama pasangan dari blok Hero (untuk judul/slug otomatis). */
export function extractCoupleTitle(data: PuckData): string {
  const hero = data.content.find((c) => c.type === 'Hero') as { props?: { groom?: unknown; bride?: unknown } } | undefined;
  const bride = typeof hero?.props?.bride === 'string' ? hero.props.bride.trim() : '';
  const groom = typeof hero?.props?.groom === 'string' ? hero.props.groom.trim() : '';
  return [bride, groom].filter(Boolean).join(' & ');
}
