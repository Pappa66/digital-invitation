import type { CoupleProps } from '@/puck/types';
import { BlockShell } from './shell';
import EditableImage from './EditableImage';
import EditableText from './EditableText';

function Photo({ src, alt, pos = 'center', zoom = 1, editable, componentId }: { src?: string; alt: string; pos?: string; zoom?: number; editable?: boolean; componentId?: string }) {
  if (src) {
    return (
      <EditableImage
        src={src}
        alt={alt}
        position={pos}
        zoom={zoom}
        editable={editable}
        componentId={componentId}
        propKey="photoPosition"
        zoomKey="photoZoom"
        className="h-28 w-28 rounded-full shadow-soft"
      />
    );
  }
  return <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-secondary,#e7ddcc)] text-xs opacity-60">Foto</div>;
}

interface PersonProps {
  name: string;
  parents?: string;
  photo?: string;
  reverse?: boolean;
  nameStyle?: React.CSSProperties;
  photoPosition?: string;
  photoZoom?: number;
  swap?: boolean;
  editable?: boolean;
  componentId?: string;
  nameKey?: string;
}

function Person({ name, parents, photo, reverse, nameStyle, photoPosition, photoZoom, editable, componentId, nameKey }: PersonProps) {
  return (
    <div className={`flex items-center gap-4 ${reverse ? 'flex-row-reverse text-right' : 'text-left'}`}>
      <Photo src={photo} alt={name} pos={photoPosition} zoom={photoZoom} editable={editable} componentId={componentId} />
      <div className="min-w-0">
        <EditableText as="p" value={name} editing={editable} componentId={componentId} propKey={nameKey} className="text-xl" style={nameStyle} />
        {parents ? <p className="mt-1 text-xs opacity-70">{parents}</p> : null}
      </div>
    </div>
  );
}

export default function Couple({ title, groom, groomParents, groomPhoto, bride, brideParents, bridePhoto, photoPosition, photoZoom = 1, swap = 'no', variant = 'vertical', nameSize, nameFont, nameColor, position, entrance, blockStyle, id, puck }: CoupleProps & { id?: string; puck?: { isEditing?: boolean } }) {
  const doSwap = swap === 'yes';
  const A = doSwap
    ? { n: bride, p: brideParents, ph: bridePhoto, k: 'bride' }
    : { n: groom, p: groomParents, ph: groomPhoto, k: 'groom' };
  const B = doSwap
    ? { n: groom, p: groomParents, ph: groomPhoto, k: 'groom' }
    : { n: bride, p: brideParents, ph: bridePhoto, k: 'bride' };
  const nameStyle: React.CSSProperties = {
    fontFamily: nameFont ? `'${nameFont}', serif` : 'var(--font-heading)',
    fontSize: nameSize || undefined,
    color: nameColor || undefined
  };
  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <EditableText as="h2" value={title} editing={puck?.isEditing} componentId={id} propKey="title" className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }} />

        {variant === 'side' ? (
          <div className="mx-auto mt-8 flex max-w-sm flex-col gap-6">
            <Person name={A.n} parents={A.p} photo={A.ph} nameStyle={nameStyle} photoPosition={photoPosition} photoZoom={photoZoom} editable={puck?.isEditing} componentId={id} nameKey={A.k} />
            <div className="text-center text-2xl opacity-60" style={{ color: 'var(--color-primary)' }}>
              &amp;
            </div>
            <Person name={B.n} parents={B.p} photo={B.ph} reverse nameStyle={nameStyle} photoPosition={photoPosition} photoZoom={photoZoom} editable={puck?.isEditing} componentId={id} nameKey={B.k} />
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
            <div className="flex flex-col items-center">
              <Photo src={A.ph} alt={A.n} pos={photoPosition} zoom={photoZoom} editable={puck?.isEditing} componentId={id} />
              <EditableText as="p" value={A.n} editing={puck?.isEditing} componentId={id} propKey={A.k} className="mt-3 text-xl" style={nameStyle} />
              {A.p ? <p className="mt-1 text-xs opacity-70">{A.p}</p> : null}
            </div>
            <span className="text-2xl opacity-60" style={{ color: 'var(--color-primary)' }}>
              &amp;
            </span>
            <div className="flex flex-col items-center">
              <Photo src={B.ph} alt={B.n} pos={photoPosition} zoom={photoZoom} editable={puck?.isEditing} componentId={id} />
              <EditableText as="p" value={B.n} editing={puck?.isEditing} componentId={id} propKey={B.k} className="mt-3 text-xl" style={nameStyle} />
              {B.p ? <p className="mt-1 text-xs opacity-70">{B.p}</p> : null}
            </div>
          </div>
        )}
      </section>
    </BlockShell>
  );
}
