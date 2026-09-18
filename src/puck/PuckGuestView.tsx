'use client';

import { useEffect, useState } from 'react';
import { Render } from '@puckeditor/core';
import { config } from '@/puck/config';
import CoverModal from '@/components/guest/cover-modal';
import ShareBar from '@/components/guest/share-bar';
import MusicPlayer from '@/components/guest/music-player';
import GuestBookWall from '@/components/guest/guest-book';
import CheckIn from '@/components/guest/check-in';
import { fireConfetti } from '@/lib/confetti';
import type { PuckData } from '@/lib/canvas/puck-format';
import type { InvitationRootProps } from '@/puck/types';
import type { Settings } from '@/lib/types';

interface PuckGuestViewProps {
  canvas: PuckData;
  projectId: string;
  greetingName?: string;
}

/** Undangan format Puck: blok + cover + musik + buku tamu + absensi + share + confetti. */
export default function PuckGuestView({ canvas, projectId, greetingName }: PuckGuestViewProps) {
  const theme = (canvas.root.props ?? {}) as InvitationRootProps;
  const hero = canvas.content.find((c) => c.type === 'Hero') as { props?: Record<string, unknown> } | undefined;
  const hp = hero?.props ?? {};
  const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

  const showCover = theme.showCover !== 'no';
  const [opened, setOpened] = useState(!showCover);

  useEffect(() => {
    if (!showCover) return;
    const handler = () => {
      setOpened(true);
      void fireConfetti();
    };
    window.addEventListener('invite-opened', handler);
    return () => window.removeEventListener('invite-opened', handler);
  }, [showCover]);

  const coupleNames = [str(hp.bride), str(hp.groom)].filter(Boolean).join(' & ');

  const settings = {
    music_url: theme.musicUrl ?? '',
    guest_book_enabled: theme.guestBookEnabled !== 'no',
    checkin_enabled: theme.checkinEnabled !== 'no',
    music_autoplay: theme.musicAutoplay !== 'no',
    music_offset_sec: theme.musicOffsetSec ?? 0,
    music_on_section: '',
    religion: 'islam'
  } as Settings;

  return (
    <>
      <Render config={config} data={canvas} metadata={{ projectId }} />
      {theme.guestBookEnabled !== 'no' ? <GuestBookWall projectId={projectId} title={theme.guestBookTitle} /> : null}
      {theme.checkinEnabled !== 'no' ? <CheckIn projectId={projectId} greetingName={greetingName} preview={false} /> : null}
      {opened ? <MusicPlayer settings={settings} /> : null}
      {opened ? (
        <ShareBar
          coupleNames={coupleNames}
          date={str(hp.date) || undefined}
          theme={{ primary: theme.primary, secondary: theme.secondary, background: theme.background }}
          heroImage={str(hp.bg_image) || undefined}
        />
      ) : null}
      {showCover ? (
        <CoverModal
          caption={str(hp.caption, 'Undangan Pernikahan')}
          bride={str(hp.bride)}
          groom={str(hp.groom)}
          date={str(hp.date)}
          bgImage={str(hp.bg_image) || undefined}
          greetingName={greetingName}
          primary={theme.primary}
          secondary={theme.secondary}
          background={theme.background}
          text={theme.text}
          coverGreeting={theme.coverGreeting}
          coverButtonText={theme.coverButtonText}
          coverBgImage={theme.coverBgImage}
          coverStyle={theme.coverStyle}
        />
      ) : null}
    </>
  );
}
