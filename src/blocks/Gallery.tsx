import type { GalleryImage, GalleryProps } from '@/puck/types';
import { BlockShell } from './shell';
import GalleryCarousel from './GalleryCarousel';

function Img({ img }: { img: GalleryImage }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img.url} alt={img.caption || ''} loading="lazy" decoding="async" className="h-full w-full object-cover" />;
}

function Polaroid({ img, rotate }: { img: GalleryImage; rotate: number }) {
  return (
    <figure className="mx-auto w-full rounded-sm bg-white p-2 pb-7 shadow-[0_8px_20px_rgba(0,0,0,0.18)]" style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="aspect-[3/4] overflow-hidden bg-black/5">
        <Img img={img} />
      </div>
      {img.caption ? <figcaption className="mt-2 text-center text-[11px] opacity-70">{img.caption}</figcaption> : null}
    </figure>
  );
}

/** Galeri dengan beberapa gaya tampilan. */
export default function Gallery({ title, images, variant = 'grid', position, entrance, blockStyle }: GalleryProps) {
  const list = (images ?? []).filter((img) => img && img.url);

  function renderBody() {
    if (variant === 'carousel') return <GalleryCarousel images={list} />;
    if (variant === 'masonry') {
      return (
        <div className="columns-2 gap-3 [&>*]:mb-3">
          {list.map((img, i) => (
            <figure key={`${img.url}-${i}`} className="break-inside-avoid overflow-hidden rounded-xl bg-black/5">
              <Img img={img} />
              {img.caption ? <figcaption className="px-2 py-1 text-[11px] opacity-70">{img.caption}</figcaption> : null}
            </figure>
          ))}
        </div>
      );
    }
    if (variant === 'polaroid') {
      return (
        <div className="grid grid-cols-2 gap-4 px-2">
          {list.map((img, i) => (
            <Polaroid key={`${img.url}-${i}`} img={img} rotate={i % 2 === 0 ? -3 : 3} />
          ))}
        </div>
      );
    }
    if (variant === 'mosaic') {
      return (
        <div className="grid auto-rows-[130px] grid-cols-3 gap-2">
          {list.map((img, i) => (
            <figure
              key={`${img.url}-${i}`}
              className={`overflow-hidden rounded-xl bg-black/5 ${i % 5 === 0 ? 'col-span-2 row-span-2' : ''}`}
            >
              <Img img={img} />
            </figure>
          ))}
        </div>
      );
    }
    // grid
    return (
      <div className="grid grid-cols-2 gap-3">
        {list.map((img, i) => (
          <figure key={`${img.url}-${i}`} className="overflow-hidden rounded-xl bg-black/5">
            <div className="aspect-[3/4]">
              <Img img={img} />
            </div>
            {img.caption ? <figcaption className="px-2 py-1 text-[11px] opacity-70">{img.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    );
  }

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {list.length === 0 ? <p className="mt-6 text-sm opacity-60">Belum ada foto. Tambahkan dari panel kanan.</p> : <div className="mt-8">{renderBody()}</div>}
      </section>
    </BlockShell>
  );
}
