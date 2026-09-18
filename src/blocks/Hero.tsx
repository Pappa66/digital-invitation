import type { HeroProps } from '@/puck/types';
import { BlockShell } from './shell';

const LAYOUT: Record<NonNullable<HeroProps['variant']>, { section: string; inner: string; align: string }> = {
  center: { section: 'items-center justify-center text-center', inner: 'items-center', align: '' },
  left: { section: 'items-start justify-center text-left', inner: 'items-start', align: 'mx-0' },
  bottom: { section: 'items-center justify-end text-center', inner: 'items-center', align: '' }
};

export default function Hero({ caption, groom, bride, date, place, bgImage, variant = 'center', nameSize, nameFont, nameColor, position, entrance, blockStyle }: HeroProps) {
  const v = LAYOUT[variant];
  const nameStyle: React.CSSProperties = {
    fontFamily: nameFont ? `'${nameFont}', serif` : 'var(--font-heading)',
    fontSize: nameSize || undefined,
    color: nameColor || undefined
  };
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className={`relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-neutral-900 px-6 py-16 text-white ${v.section}`}>
        {bgImage ? (
          /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(bgImage) ? (
            <video src={bgImage} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-55" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={bgImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
          )
        ) : null}
        <div className={`relative z-10 flex flex-col ${v.inner}`}>
          <p className="text-[11px] uppercase tracking-[0.35em] opacity-85">{caption}</p>
          <h1 className="mt-5 font-heading text-4xl leading-tight sm:text-5xl" style={nameStyle}>
            {bride}
          </h1>
          <span className="my-2 text-sm opacity-60">&amp;</span>
          <h1 className="font-heading text-4xl leading-tight sm:text-5xl" style={nameStyle}>
            {groom}
          </h1>
          <div className="mt-7 h-px w-24 bg-white/30" />
          <p className="mt-5 text-xs uppercase tracking-[0.28em] opacity-90">{date}</p>
          {place ? <p className="mt-2 text-xs opacity-70">{place}</p> : null}
        </div>
      </section>
    </BlockShell>
  );
}
