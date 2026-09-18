import type { GalleryProps } from '@/puck/types';
import { BlockShell } from './shell';
import GalleryCarousel from './GalleryCarousel';

export default function Gallery({ title, images, variant = 'grid', position, entrance }: GalleryProps) {
  const list = (images ?? []).filter((img) => img && img.url);
  return (
    <BlockShell position={position} entrance={entrance}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {list.length === 0 ? (
          <p className="mt-6 text-sm opacity-60">Belum ada foto. Tambahkan URL gambar di panel kanan.</p>
        ) : variant === 'carousel' ? (
          <div className="mt-8">
            <GalleryCarousel images={list} />
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {list.map((img, i) => (
              <figure key={`${img.url}-${i}`} className="overflow-hidden rounded-xl bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ''} className="aspect-[3/4] w-full object-cover" />
                {img.caption ? <figcaption className="px-2 py-1 text-[11px] opacity-70">{img.caption}</figcaption> : null}
              </figure>
            ))}
          </div>
        )}
      </section>
    </BlockShell>
  );
}
