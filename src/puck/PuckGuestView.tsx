'use client';

import { useEffect, useState } from 'react';
import { Render } from '@puckeditor/core';
import { config } from '@/puck/config';
import ShareBar from '@/components/guest/share-bar';
import MusicPlayer from '@/components/guest/music-player';
import GuestBookWall from '@/components/guest/guest-book';
import CheckIn from '@/components/guest/check-in';
import { fireConfetti } from '@/lib/confetti';
import { buildGuestSettings, readHero } from '@/puck/guest-config';
import type { PuckData } from '@/lib/canvas/puck-format';
import type { InvitationRootProps } from '@/puck/types';

interface PuckGuestViewProps {
  canvas: PuckData;
  projectId: string;
  greetingName?: string;
}

/** Undangan format Puck: blok (termasuk Cover) + musik + buku tamu + absensi + share + confetti. */
export default function PuckGuestView({ canvas, projectId, greetingName }: PuckGuestViewProps) {
  const theme = (canvas.root.props ?? {}) as InvitationRootProps;
  const hero = readHero(canvas);
  const settings = buildGuestSettings(theme);
  const hasCover = canvas.content.some((c) => c.type === 'Cover');
  const [opened, setOpened] = useState(!hasCover);

  useEffect(() => {
    if (!hasCover) return;
    const handler = () => {
      setOpened(true);
      void fireConfetti();
    };
    window.addEventListener('invite-opened', handler);
    return () => window.removeEventListener('invite-opened', handler);
  }, [hasCover]);

  return (
    <>
      <Render config={config} data={canvas} metadata={{ projectId, greetingName }} />
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
    </>
  );
}
