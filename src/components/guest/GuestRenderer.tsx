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
import { GuestCanvasShell, GUEST_CANVAS_WIDTH } from '@/components/guest/guest-canvas-shell';
import CanvasStickerLayer from '@/components/builder/canvas-sticker-layer';

interface GuestRendererProps {
  canvas: CanvasData;
  projectId?: string;
  greetingName?: string;
  preview?: boolean;
  demo?: boolean;
  width?: 'mobile' | 'desktop';
}

const CANVAS_W = 420;

function SectionGap() {
  return <div className="h-4" aria-hidden />;
}

function CanvasBody({
  canvas,
  projectId,
  greetingName,
  preview,
  immersive,
  showCover
}: {
  canvas: CanvasData;
  projectId?: string;
  greetingName?: string;
  preview?: boolean;
  immersive: boolean;
  showCover: boolean;
}) {
  const flow = canvas.flow ?? 'stack';
  const heroBlock = canvas.blocks.find((b) => b.type === 'Hero');
  const coupleNames = [heroBlock?.props.bride, heroBlock?.props.groom].filter(Boolean).join(' & ');
  const shareMeta = {
    coupleNames,
    date: typeof heroBlock?.props.date === 'string' ? heroBlock.props.date : undefined,
    theme: { primary: canvas.theme.primary, secondary: canvas.theme.secondary, background: canvas.theme.background },
    heroImage: typeof heroBlock?.props.bg_image === 'string' ? heroBlock.props.bg_image : undefined
  };
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
    coverBgImage: canvas.settings.cover_bg_image,
    coverStyle: canvas.theme.cover_style
  };

  if (flow === 'free') {
    const height = canvas.blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 900;
    return (
      <div className="relative" style={{ minHeight: Math.max(height, 1200) }}>
        <CanvasStickerLayer stickers={canvas.stickers} />
        {canvas.blocks.map((block) =>
          block.layout ? (
            <div
              key={block.id}
              style={{ position: 'absolute', left: block.layout.x, top: block.layout.y, width: block.layout.width, maxWidth: CANVAS_W }}
            >
              <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive} showCoverButton={!showCover} />
            </div>
          ) : (
            <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive} showCoverButton={!showCover} />
          )
        )}
        {immersive && <MusicPlayer settings={canvas.settings} />}
        {immersive && <ShareBar {...shareMeta} />}
        <GuestNav blocks={canvas.blocks} />
        <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={false} />
        {immersive && showCover && <CoverModal {...coverProps} />}
      </div>
    );
  }

  return (
    <div className="relative">
      <CanvasStickerLayer stickers={canvas.stickers} />
      {canvas.blocks.map((block, i) => (
        <div key={block.id}>
          <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive} showCoverButton={!showCover} />
          {i < canvas.blocks.length - 1 && <SectionGap />}
        </div>
      ))}
      {!preview && canvas.settings.guest_book_enabled && <GuestBookWall projectId={projectId} />}
      {!preview && projectId && canvas.settings.checkin_enabled !== false && (
        <CheckIn projectId={projectId} greetingName={greetingName} preview={preview} />
      )}
      {immersive && <MusicPlayer settings={canvas.settings} />}
      {immersive && <ShareBar {...shareMeta} />}
      <GuestNav blocks={canvas.blocks} />
      <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={false} />
      {immersive && showCover && <CoverModal {...coverProps} />}
    </div>
  );
}

export default function GuestRenderer({ canvas, projectId, greetingName, preview, demo, width = 'mobile' }: GuestRendererProps) {
  const immersive = !preview || !!demo;
  const showCover = canvas.settings.show_cover !== false;
  const styleVars = {
    '--color-primary': canvas.theme.primary,
    '--color-secondary': canvas.theme.secondary,
    '--color-background': canvas.theme.background,
    '--color-text': canvas.theme.text,
    '--font-heading': `'${canvas.theme.font_heading}', serif`,
    '--font-body': `'${canvas.theme.font_body}', sans-serif`
  } as React.CSSProperties;

  const rootClass =
    'guest-root relative w-full min-w-0 overflow-x-clip box-border ' +
    (canvas.theme.card_style ? 'guest-card-style ' : '');

  return (
    <PreviewContext.Provider value={!!preview}>
      <ThemeContext.Provider value={canvas.theme}>
        <div
          className="min-h-dvh w-full"
          style={{ background: canvas.theme.background, color: canvas.theme.text }}
        >
          <GuestCanvasShell className={`${rootClass} relative`} style={styleVars}>
            <CanvasBody
              canvas={canvas}
              projectId={projectId}
              greetingName={greetingName}
              preview={preview}
              immersive={immersive}
              showCover={showCover}
            />
          </GuestCanvasShell>
        </div>
      </ThemeContext.Provider>
    </PreviewContext.Provider>
  );
}

export { GUEST_CANVAS_WIDTH };
