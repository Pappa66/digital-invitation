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
import { buildCoverProps, buildGuestSettings, readHero } from '@/puck/guest-config';
import type { PuckData } from '@/lib/canvas/puck-format';
import type { InvitationRootProps } from '@/puck/types';

interface PuckGuestViewProps {
  canvas: PuckData;
  projectId: string;
  greetingName?: string;
}

/** Undangan format Puck: blok + cover + musik + buku tamu + absensi + share + confetti. */
export default function PuckGuestView({ canvas, projectId, greetingName }: PuckGuestViewProps) {
  const theme = (canvas.root.props ?? {}) as InvitationRootProps;
  const hero = readHero(canvas);
  const settings = buildGuestSettings(theme);
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

  return (
    <>
      <Render config={config} data={canvas} metadata={{ projectId }} />
      {theme.guestBookEnabled !== 'no' ? <GuestBookWall projectId={projectId} title={theme.guestBookTitle} /> : null}
      {theme.checkinEnabled !== 'no' ? <CheckIn projectId={projectId} greetingName={greetingName} preview={false} /> : null}
      {opened ? <MusicPlayer settings={settings} /> : null}
      {opened ? (
        <ShareBar
          coupleNames={hero.coupleNames}
          date={hero.date || undefined}
          theme={{ primary: theme.primary, secondary: theme.secondary, background: theme.background }}
          heroImage={hero.bgImage}
        />
      ) : null}
      {showCover ? <CoverModal {...buildCoverProps(theme, hero, greetingName)} /> : null}
    </>
  );
}
