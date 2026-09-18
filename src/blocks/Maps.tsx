import type { MapsProps } from '@/puck/types';
import { BlockShell } from './shell';

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('google.com') && u.pathname.includes('/maps')) {
      return `${url}${url.includes('?') ? '&' : '?'}output=embed`;
    }
    return url;
  } catch {
    return null;
  }
}

export default function Maps({ title, address, embedUrl, position, entrance, blockStyle }: MapsProps) {
  const embed = embedUrl ? toEmbed(embedUrl) : null;
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm opacity-80">{address}</p>
        {embed ? (
          <div className="mt-6 overflow-hidden rounded-2xl border border-black/10">
            <iframe title={title || 'Peta lokasi'} src={embed} className="h-64 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        ) : (
          <p className="mt-6 text-xs opacity-60">Tempel URL Google Maps pada field &ldquo;Embed URL&rdquo; untuk menampilkan peta.</p>
        )}
        {address ? (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block rounded-full px-5 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-primary,#3b5ba5)' }}
          >
            Buka di Google Maps
          </a>
        ) : null}
      </section>
    </BlockShell>
  );
}
