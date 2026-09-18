import type { CoupleProps } from '@/puck/types';
import { BlockShell } from './shell';

function Photo({ src, alt }: { src?: string; alt: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className="h-28 w-28 rounded-full object-cover shadow-soft" />;
  }
  return <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-secondary,#e7ddcc)] text-xs opacity-60">Foto</div>;
}

interface PersonProps {
  name: string;
  parents?: string;
  photo?: string;
  reverse?: boolean;
  nameStyle?: React.CSSProperties;
}

function Person({ name, parents, photo, reverse, nameStyle }: PersonProps) {
  return (
    <div className={`flex items-center gap-4 ${reverse ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <Photo src={photo} alt={name} />
      <div className="min-w-0">
        <p className="text-xl" style={nameStyle}>
          {name}
        </p>
        {parents ? <p className="mt-1 text-xs opacity-70">{parents}</p> : null}
      </div>
    </div>
  );
}

export default function Couple({ title, groom, groomParents, groomPhoto, bride, brideParents, bridePhoto, variant = 'vertical', nameSize, nameFont, nameColor, position, entrance, blockStyle }: CoupleProps) {
  const nameStyle: React.CSSProperties = {
    fontFamily: nameFont ? `'${nameFont}', serif` : 'var(--font-heading)',
    fontSize: nameSize || undefined,
    color: nameColor || undefined
  };
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>

        {variant === 'side' ? (
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-6">
            <Person name={groom} parents={groomParents} photo={groomPhoto} nameStyle={nameStyle} />
            <div className="text-center text-2xl opacity-60" style={{ color: 'var(--color-primary)' }}>
              &amp;
            </div>
            <Person name={bride} parents={brideParents} photo={bridePhoto} reverse nameStyle={nameStyle} />
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
            <div className="flex flex-col items-center">
              <Photo src={groomPhoto} alt={groom} />
              <p className="mt-3 text-xl" style={nameStyle}>
                {groom}
              </p>
              {groomParents ? <p className="mt-1 text-xs opacity-70">{groomParents}</p> : null}
            </div>
            <span className="text-2xl opacity-60" style={{ color: 'var(--color-primary)' }}>
              &amp;
            </span>
            <div className="flex flex-col items-center">
              <Photo src={bridePhoto} alt={bride} />
              <p className="mt-3 text-xl" style={nameStyle}>
                {bride}
              </p>
              {brideParents ? <p className="mt-1 text-xs opacity-70">{brideParents}</p> : null}
            </div>
          </div>
        )}
      </section>
    </BlockShell>
  );
}
