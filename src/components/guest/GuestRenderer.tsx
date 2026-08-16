'use client';

import type { CanvasData } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import MusicPlayer from '@/components/guest/music-player';
import GuestBookWall from '@/components/guest/guest-book';
import CheckIn from '@/components/guest/check-in';
import ShareBar from '@/components/guest/share-bar';
import { PreviewContext } from '@/components/guest/preview-context';
import { ThemeContext } from '@/components/guest/theme-context';
import { GuestFrame } from '@/components/guest/guest-frame';
import GuestNav from '@/components/guest/guest-nav';
import CoverModal from '@/components/guest/cover-modal';

interface GuestRendererProps {
  canvas: CanvasData;
  projectId?: string;
  greetingName?: string;
  preview?: boolean;
  demo?: boolean;
  width?: 'mobile' | 'desktop';
}

const CANVAS_W = 420;

export default function GuestRenderer({ canvas, projectId, greetingName, preview, demo, width = 'mobile' }: GuestRendererProps) {
  const immersive = !preview || !!demo;
  const flow = canvas.flow ?? 'stack';
  const heroBlock = canvas.blocks.find((b) => b.type === 'Hero');
  const coupleNames = [heroBlock?.props.bride, heroBlock?.props.groom].filter(Boolean).join(' & ');
  const showCover = canvas.settings.show_cover !== false;
  const shareMeta = {
    coupleNames,
    date: typeof heroBlock?.props.date === 'string' ? heroBlock.props.date : undefined,
    theme: { primary: canvas.theme.primary, secondary: canvas.theme.secondary, background: canvas.theme.background }
  };
  const styleVars = {
    '--color-primary': canvas.theme.primary,
    '--color-secondary': canvas.theme.secondary,
    '--color-background': canvas.theme.background,
    '--color-text': canvas.theme.text,
    '--font-heading': `'${canvas.theme.font_heading}', serif`,
    '--font-body': `'${canvas.theme.font_body}', sans-serif`
  } as React.CSSProperties;

  const rootClass =
    'guest-root relative mx-auto w-full overflow-x-clip ' +
    (canvas.theme.card_style ? 'guest-card-style ' : '') +
    (width === 'desktop' ? 'max-w-full' : 'max-w-[430px]');

  const coverProps = {
    caption: typeof heroBlock?.props.caption === 'string' ? heroBlock.props.caption : 'Undangan Pernikahan',
    bride: typeof heroBlock?.props.bride === 'string' ? heroBlock.props.bride : '',
    groom: typeof heroBlock?.props.groom === 'string' ? heroBlock.props.groom : '',
    date: typeof heroBlock?.props.date === 'string' ? heroBlock.props.date : '',
    bgImage: typeof heroBlock?.props.bg_image === 'string' ? heroBlock.props.bg_image : undefined,
    greetingName,
    primary: canvas.theme.primary,
    secondary: canvas.theme.secondary,
    background: canvas.theme.background,
    text: canvas.theme.text,
    ornament: typeof canvas.theme.ornament === 'string' ? canvas.theme.ornament : undefined,
    coverGreeting: canvas.settings.cover_greeting,
    coverButtonText: canvas.settings.cover_button_text,
    coverBgImage: canvas.settings.cover_bg_image
  };

  if (flow === 'free') {
    const height = canvas.blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 900;
    return (
      <PreviewContext.Provider value={!!preview}>
        <ThemeContext.Provider value={canvas.theme}>
        <div className={`${rootClass} relative`} style={{ ...styleVars, minHeight: Math.max(height, 1200) }}>
          {canvas.blocks.map((block) =>
            block.layout ? (
              <div
                key={block.id}
                style={{ position: 'absolute', left: block.layout.x, top: block.layout.y, width: block.layout.width, maxWidth: CANVAS_W }}
              >
                <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} />
              </div>
            ) : (
              <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} />
            )
          )}
          {immersive && <MusicPlayer settings={canvas.settings} />}
          {immersive && <ShareBar {...shareMeta} />}
          <GuestNav />
          {!canvas.theme.card_style && <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />}
          {immersive && showCover && <CoverModal {...coverProps} />}
        </div>
        </ThemeContext.Provider>
      </PreviewContext.Provider>
    );
  }

  return (
    <PreviewContext.Provider value={!!preview}>
      <ThemeContext.Provider value={canvas.theme}>
      <div className={rootClass} style={styleVars}>
        {canvas.blocks.map((block) => (
          <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} />
        ))}
        {!preview && canvas.settings.guest_book_enabled && <GuestBookWall projectId={projectId} />}
        {!preview && projectId && canvas.settings.checkin_enabled !== false && (
          <CheckIn
            projectId={projectId}
            greetingName={greetingName}
            preview={preview}
            showSeatInfo={!!canvas.settings.show_seat_info}
            tableLabel={typeof canvas.settings.table_label === 'string' ? canvas.settings.table_label : undefined}
            seatLabel={typeof canvas.settings.seat_label === 'string' ? canvas.settings.seat_label : undefined}
          />
        )}
        {immersive && <MusicPlayer settings={canvas.settings} />}
        {immersive && <ShareBar {...shareMeta} />}
        <GuestNav />
        {!canvas.theme.card_style && <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />}
        {immersive && showCover && <CoverModal {...coverProps} />}
      </div>
      </ThemeContext.Provider>
    </PreviewContext.Provider>
  );
}
