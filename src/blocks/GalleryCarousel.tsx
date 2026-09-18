'use client';

import useEmblaCarousel from 'embla-carousel-react';

/** Carousel galeri (embla) — geser antar foto. */
export default function GalleryCarousel({ images }: { images: { url: string; caption?: string }[] }) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'center' });

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="min-w-0 shrink-0 grow-0 basis-[85%] px-1.5">
            <figure className="overflow-hidden rounded-2xl bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption || ''} loading="lazy" decoding="async" className="aspect-[3/4] w-full object-cover" />
              {img.caption ? <figcaption className="px-3 py-2 text-[11px] opacity-70">{img.caption}</figcaption> : null}
            </figure>
          </div>
        ))}
      </div>
    </div>
  );
}
