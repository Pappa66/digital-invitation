import type { LiveStreamingProps } from '@/puck/types';
import { toEmbedUrl } from '@/lib/embed';
import { BlockShell } from './shell';

export default function LiveStreaming({ title, embedUrl, note, position, entrance, blockStyle }: LiveStreamingProps) {
  const embed = toEmbedUrl(embedUrl);
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {note ? <p className="mx-auto mt-2 max-w-sm text-sm opacity-75">{note}</p> : null}
        {embed ? (
          <div className="mx-auto mt-6 aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-black/10">
            <iframe title={title || 'Live streaming'} src={embed} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          </div>
        ) : (
          <p className="mt-6 text-xs opacity-60">Tempel link YouTube/Vimeo di field “URL Streaming”.</p>
        )}
      </section>
    </BlockShell>
  );
}
