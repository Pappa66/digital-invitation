'use client';

import type { CanvasData } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import MusicPlayer from '@/components/guest/music-player';
import GuestBookWall from '@/components/guest/guest-book';
import ShareBar from '@/components/guest/share-bar';
import { PreviewContext } from '@/components/guest/preview-context';

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
  const styleVars = {
    '--color-primary': canvas.theme.primary,
    '--color-secondary': canvas.theme.secondary,
    '--color-background': canvas.theme.background,
    '--color-text': canvas.theme.text,
    '--font-heading': `'${canvas.theme.font_heading}', serif`,
    '--font-body': `'${canvas.theme.font_body}', sans-serif`
  } as React.CSSProperties;

  const rootClass =
    'guest-root mx-auto w-full overflow-x-hidden ' + (width === 'desktop' ? 'max-w-full' : 'max-w-[430px]');

  if (flow === 'free') {
    const height = canvas.blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 900;
    return (
      <PreviewContext.Provider value={!!preview}>
        <div className={`${rootClass} relative`} style={{ ...styleVars, minHeight: Math.max(height, 1200) }}>
          {canvas.blocks.map((block) =>
            block.layout ? (
              <div
                key={block.id}
                style={{ position: 'absolute', left: block.layout.x, top: block.layout.y, width: block.layout.width, maxWidth: CANVAS_W }}
              >
                <BlockView block={block} projectId={projectId} greetingName={greetingName} />
              </div>
            ) : (
              <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} />
            )
          )}
          {!preview && <MusicPlayer settings={canvas.settings} />}
          {!preview && <ShareBar />}
        </div>
      </PreviewContext.Provider>
    );
  }

  return (
    <PreviewContext.Provider value={!!preview}>
      <div className={rootClass} style={styleVars}>
        {canvas.blocks.map((block) => (
          <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} />
        ))}
        {!preview && canvas.settings.guest_book_enabled && <GuestBookWall projectId={projectId} />}
        {!preview && <MusicPlayer settings={canvas.settings} />}
        {!preview && <ShareBar />}
      </div>
    </PreviewContext.Provider>
  );
}