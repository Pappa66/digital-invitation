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

interface GuestRendererProps {
  canvas: CanvasData;
  projectId?: string;
  /** Nama tamu dari query ?to= untuk sapaan personal di Hero. */
  greetingName?: string;
  /** Mode preview (kartu template): matikan musik & timer agar ringan. */
  preview?: boolean;
  /** Lebar tampilan yang dirender: ponsel (default) atau desktop. */
  width?: 'mobile' | 'desktop';
}

const CANVAS_W = 420;

export default function GuestRenderer({ canvas, projectId, greetingName, preview, width = 'mobile' }: GuestRendererProps) {
  const flow = canvas.flow ?? 'stack';
  const heroBlock = canvas.blocks.find((b) => b.type === 'Hero');
  const coupleNames = [heroBlock?.props.bride, heroBlock?.props.groom].filter(Boolean).join(' & ');
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
    'guest-root mx-auto w-full overflow-x-hidden ' +
    (canvas.theme.card_style ? 'guest-card-style ' : '') +
    (width === 'desktop' ? 'max-w-full' : 'max-w-[430px]');

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
                <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} />
              </div>
            ) : (
              <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} />
            )
          )}
{!preview && <MusicPlayer settings={canvas.settings} />}
        {!preview && <ShareBar {...shareMeta} />}
        {!preview && <GuestNav />}
        <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />
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
          <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} />
        ))}
        {!preview && canvas.settings.guest_book_enabled && <GuestBookWall projectId={projectId} />}
        {!preview && projectId && canvas.settings.checkin_enabled !== false && (
          <CheckIn projectId={projectId} greetingName={greetingName} preview={preview} />
        )}
        {!preview && <MusicPlayer settings={canvas.settings} />}
        {!preview && <ShareBar {...shareMeta} />}
        {!preview && <GuestNav />}
        <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />
      </div>
      </ThemeContext.Provider>
    </PreviewContext.Provider>
  );
}