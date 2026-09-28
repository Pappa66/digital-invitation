import type { HeroProps } from '@/puck/types';
import { BlockShell } from './shell';
import EditableImage from './EditableImage';
import EditableText from './EditableText';

const LAYOUT: Record<NonNullable<HeroProps['variant']>, { section: string; inner: string }> = {
  center: { section: 'items-center justify-center text-center', inner: 'items-center' },
  left: { section: 'items-start justify-center text-left', inner: 'items-start' },
  bottom: { section: 'items-center justify-end text-center', inner: 'items-center' }
};

export default function Hero({ caption, groom, bride, date, place, bgImage, bgFit = 'cover', bgPosition = 'center', bgZoom = 1, variant = 'center', nameSize, nameFont, nameColor, position, entrance, blockStyle, id, puck }: HeroProps & { id?: string; puck?: { isEditing?: boolean } }) {
  const v = LAYOUT[variant];
  const editing = puck?.isEditing;
  const textColor = blockStyle?.textColor || '#ffffff';
  const nameStyle: React.CSSProperties = {
    fontFamily: nameFont ? `'${nameFont}', serif` : 'var(--font-heading)',
    fontSize: nameSize || undefined,
    color: nameColor || textColor
  };
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className={`relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-neutral-900 px-6 py-16 ${v.section}`} style={{ color: textColor }}>
        {bgImage ? (
          /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(bgImage) ? (
            <video src={bgImage} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full opacity-55" style={{ objectFit: bgFit, objectPosition: bgPosition }} />
          ) : (
            <EditableImage
              src={bgImage}
              fit={bgFit}
              position={bgPosition}
              zoom={bgZoom}
              editable={editing}
              componentId={id}
              propKey="bgPosition"
              zoomKey="bgZoom"
              className="absolute inset-0"
              imgClassName="opacity-55"
            />
          )
        ) : null}
        <div className={`relative z-20 flex flex-col ${v.inner}`} style={{ textShadow: '0 2px 14px rgba(0,0,0,0.45)' }}>
          <EditableText as="p" value={caption} editing={editing} componentId={id} propKey="caption" className="text-[11px] uppercase tracking-[0.35em] opacity-85" />
          <EditableText as="h1" value={bride} editing={editing} componentId={id} propKey="bride" className="mt-5 font-heading text-4xl leading-tight sm:text-5xl" style={nameStyle} />
          <span className="my-2 text-sm opacity-60">&amp;</span>
          <EditableText as="h1" value={groom} editing={editing} componentId={id} propKey="groom" className="font-heading text-4xl leading-tight sm:text-5xl" style={nameStyle} />
          <div className="mt-7 h-px w-24 bg-white/30" />
          <EditableText as="p" value={date} editing={editing} componentId={id} propKey="date" className="mt-5 text-xs uppercase tracking-[0.28em] opacity-90" />
          {place !== undefined ? (
            <EditableText as="p" value={place ?? ''} editing={editing} componentId={id} propKey="place" className="mt-2 text-xs opacity-70" />
          ) : null}
        </div>
      </section>
    </BlockShell>
  );
}
