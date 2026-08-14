'use client';

import { useEffect, useState } from 'react';
import { motion, type Target } from 'framer-motion';
import Image from 'next/image';
import { Calendar, MapPin, Heart, Sparkles, Gem, BookOpen, Sprout } from 'lucide-react';
import type { BlockProps } from '@/lib/types';
import { Editable } from '@/components/builder/inline-edit';
import { usePreview } from '@/components/guest/preview-context';

/** Akses props sebagai string dengan fallback aman (''). */
function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}
/** Akses props sebagai boolean dengan fallback false. */
function bool(props: BlockProps, key: string): boolean {
  return props[key] === true || props[key] === 'true';
}
/** Akses props sebagai string[] dengan fallback []. */
function arr(props: BlockProps, key: string): string[] {
  const v = props[key];
  return Array.isArray(v) ? (v as string[]) : [];
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-12 bg-current opacity-50" />
      <Heart className="h-4 w-4" />
      <span className="h-px w-12 bg-current opacity-50" />
    </div>
  );
}

/** Partikel lembut yang mengambang di hero (aksen animasi halus). */
function HeroSparkles() {
  const spots = [
    { left: '10%', top: '16%', size: 5, delay: 0 },
    { left: '84%', top: '20%', size: 3, delay: 1.4 },
    { left: '72%', top: '58%', size: 6, delay: 0.7 },
    { left: '18%', top: '70%', size: 3, delay: 2.0 },
    { left: '52%', top: '34%', size: 4, delay: 0.3 },
    { left: '30%', top: '44%', size: 2, delay: 2.6 }
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {spots.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/50"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{ y: [0, -16, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function BackgroundImage({ src }: { src: string }) {
  if (!src) return null;
  return (
    <div className="absolute inset-0 z-0">
      <Image
        src={src}
        alt=""
        fill
        priority
        sizes="100vw"
        quality={75}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}

function CouplePerson({ propKey, name, parents }: { propKey: string; name: string; parents: string }) {
  return (
    <div className="min-w-0 flex-1 break-words">
      <h2 className="text-2xl font-medium leading-snug md:text-3xl">
        <Editable prop={propKey}>{name}</Editable>
      </h2>
      <p className="mt-2 text-xs uppercase leading-relaxed tracking-widest opacity-70">
        <Editable prop={`${propKey}_parents`}>{parents}</Editable>
      </p>
    </div>
  );
}

export function HeroBlock({ props, greetingName }: { props: BlockProps; greetingName?: string }) {
  const showOrnament = bool(props, 'show_ornament');
  const align = str(props, 'variant') === 'left' ? 'left' : 'center';
  const isLeft = align === 'left';
  return (
    <section
      className={`relative flex min-h-screen w-full flex-col overflow-hidden px-6 py-20 text-white ${
        isLeft ? 'items-start justify-center text-left' : 'items-center justify-center text-center'
      }`}
    >
      <BackgroundImage src={str(props, 'bg_image')} />
      <HeroSparkles />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className={`relative z-10 flex w-full flex-col ${isLeft ? 'items-start' : 'items-center'}`}
      >
        <p className="text-xs uppercase tracking-[0.3em]">
          <Editable prop="caption">{str(props, 'caption')}</Editable>
        </p>
        {showOrnament && <Ornament className={isLeft ? 'mt-4 mr-auto text-white opacity-80' : 'mt-4 text-white opacity-80'} />}
        <h1 className="mt-6 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
          <Editable prop="bride">{str(props, 'bride')}</Editable>
        </h1>
        <p className="my-4 text-xl sm:text-2xl">&amp;</p>
        <h1 className="text-3xl font-medium leading-tight sm:text-4xl md:text-5xl">
          <Editable prop="groom">{str(props, 'groom')}</Editable>
        </h1>
        <p className="mt-8 text-sm uppercase tracking-widest opacity-90">
          <Editable prop="date">{str(props, 'date')}</Editable>
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            <Editable prop="place">{str(props, 'place')}</Editable>
          </span>
        </div>
        {greetingName && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10"
          >
            <div className="inline-flex flex-col items-center rounded-full border border-white/25 bg-white/10 px-6 py-3 backdrop-blur-sm">
              <span className="text-[10px] uppercase tracking-[0.25em] opacity-80">Kepada Yth.</span>
              <span className="mt-0.5 text-sm font-medium">{greetingName}</span>
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export function CoupleBlock({ props }: { props: BlockProps }) {
  const side = str(props, 'variant') === 'side';
  const title = (children: React.ReactNode) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );

  return (
    <section className="px-6 py-16 md:py-24">
      <div className={`mx-auto w-full ${side ? '' : 'text-center'}`}>
        {str(props, 'bismillah') &&
          title(
            <p className={`mb-6 text-sm italic opacity-70 ${side ? 'text-center' : ''}`}>
              <Editable prop="bismillah">{str(props, 'bismillah')}</Editable>
            </p>
          )}
        {str(props, 'quote') &&
          title(
            <p className="mb-8 border-y border-current/10 py-6 text-sm italic leading-relaxed opacity-80">
              &ldquo;<Editable prop="quote">{str(props, 'quote')}</Editable>&rdquo;
            </p>
          )}
        {side ? (
          <div className="mx-auto grid w-full max-w-2xl items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
            <div className="min-w-0 text-center">
              <CouplePerson propKey="groom" name={str(props, 'groom')} parents={str(props, 'groom_parents')} />
            </div>
            <div className="my-2 flex min-w-0 justify-center md:my-0">
              <Ornament className="text-current opacity-60" />
            </div>
            <div className="min-w-0 text-center">
              <CouplePerson propKey="bride" name={str(props, 'bride')} parents={str(props, 'bride_parents')} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10">
              <CouplePerson propKey="groom" name={str(props, 'groom')} parents={str(props, 'groom_parents')} />
            </div>
            <Ornament className="text-current opacity-60" />
            <div className="mt-10">
              <CouplePerson propKey="bride" name={str(props, 'bride')} parents={str(props, 'bride_parents')} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export function CountdownBlock({ props }: { props: BlockProps }) {
  const target = new Date(str(props, 'target_date')).getTime();
  const variant = str(props, 'variant') || 'circles';
  return (
    <section className="px-6 py-16 text-center">
      <h2 className="text-xl md:text-2xl">
        <Editable prop="title">{str(props, 'title')}</Editable>
      </h2>
      <CountdownTimer target={target} variant={variant} />
    </section>
  );
}

function CountdownTimer({ target, variant }: { target: number; variant: string }) {
  const preview = usePreview();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (preview) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [preview]);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const cells = [
    { label: 'Hari', value: days },
    { label: 'Jam', value: hours },
    { label: 'Menit', value: minutes },
    { label: 'Detik', value: seconds }
  ];

  const Digit = ({ value }: { value: number }) => (
    <motion.span
      key={value}
      initial={{ scale: 0.5, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="inline-block tabular-nums"
    >
      {String(value).padStart(2, '0')}
    </motion.span>
  );

  if (variant === 'line') {
    return (
      <div className="mx-auto mt-10 flex w-full items-center justify-center gap-4 text-sm uppercase tracking-widest opacity-90">
        {cells.map((c, i) => (
          <span key={c.label} className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">
              <Digit value={c.value} />
            </span>
            <span>{c.label}</span>
            {i < cells.length - 1 && <span className="mx-2 opacity-40">/</span>}
          </span>
        ))}
      </div>
    );
  }

  const cellBase =
    variant === 'cards'
      ? 'flex h-16 w-14 flex-col items-center justify-center rounded-lg border border-current/25 px-1 md:h-20 md:w-16'
      : 'flex h-16 w-16 items-center justify-center rounded-full border border-current/20 text-2xl font-semibold md:h-20 md:w-20';

  return (
    <div className="mx-auto mt-10 flex w-full items-start justify-center gap-4">
      {cells.map((c) => (
        <div key={c.label} className="flex flex-col items-center">
          <div className={cellBase}>
            <span className="text-2xl font-semibold md:text-3xl">
              <Digit value={c.value} />
            </span>
          </div>
          <span className="mt-2 text-xs uppercase tracking-widest opacity-70">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export function EventDetailBlock({ props }: { props: BlockProps }) {
  const icon = str(props, 'icon') === 'glass' ? Sparkles : Gem;
  const Icon = icon;
  const band = str(props, 'variant') === 'band';
  return (
    <section className={`px-6 py-14 text-center ${band ? 'py-20' : ''}`}>
      <div
        className={`${
          band
            ? 'mx-auto w-full border-y border-current/10 py-12'
            : 'mx-auto w-full rounded-xl border border-current/10 p-8'
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Icon className="mx-auto h-7 w-7" />
          <h2 className="mt-4 text-2xl font-medium">
            <Editable prop="title">{str(props, 'title')}</Editable>
          </h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-start justify-center gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <Editable prop="date">{str(props, 'date')}</Editable> •{' '}
                <Editable prop="time">{str(props, 'time')}</Editable>
              </span>
            </div>
            <div className="flex items-start justify-center gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <Editable prop="location">{str(props, 'location')}</Editable>
                <br />
                <span className="opacity-70">
                  <Editable prop="address">{str(props, 'address')}</Editable>
                </span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function StoryBlock({ props }: { props: BlockProps }) {
  const titles = arr(props, 'ev_title');
  const dates = arr(props, 'ev_date');
  const descs = arr(props, 'ev_desc');
  const count = titles.length;
  return (
    <section className="px-6 py-16 md:py-24">
      <div className="mx-auto w-full text-center">
        <h2 className="text-2xl font-medium md:text-3xl">
          <Editable prop="title">{str(props, 'title')}</Editable>
        </h2>
        {str(props, 'subtitle') && (
          <p className="mt-2 text-sm italic opacity-70">
            <Editable prop="subtitle">{str(props, 'subtitle')}</Editable>
          </p>
        )}
        <Ornament className="mt-6 opacity-60" />
      </div>
      <div className="mx-auto mt-10 w-full space-y-8">
        {count === 0 && <p className="text-center text-sm opacity-50">Belum ada cerita.</p>}
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="relative flex gap-4"
          >
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current/25">
                <BookOpen className="h-4 w-4" />
              </span>
              {i < count - 1 && <span className="mt-1 w-px flex-1 bg-current/20" />}
            </div>
            <div className="pb-2 text-left">
              {dates[i] && (
                <p className="text-xs uppercase tracking-widest opacity-70">
                  <Editable prop="ev_date" index={i}>
                    {dates[i]}
                  </Editable>
                </p>
              )}
              <h3 className="mt-1 text-lg font-medium">
                <Editable prop="ev_title" index={i}>
                  {titles[i]}
                </Editable>
              </h3>
              <p className="mt-1 text-sm leading-relaxed opacity-80">
                <Editable prop="ev_desc" index={i} multiline>
                  {descs[i]}
                </Editable>
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** Daftar animasi foto (≥10 pilihan) yang bisa dipilih per blok Galeri. */
const PHOTO_ANIMS: Record<string, { initial: Target; animate: Target }> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  zoom: { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 } },
  'zoom-out': { initial: { opacity: 0, scale: 1.3 }, animate: { opacity: 1, scale: 1 } },
  'slide-left': { initial: { opacity: 0, x: -56 }, animate: { opacity: 1, x: 0 } },
  'slide-right': { initial: { opacity: 0, x: 56 }, animate: { opacity: 1, x: 0 } },
  'slide-up': { initial: { opacity: 0, y: 56 }, animate: { opacity: 1, y: 0 } },
  flip: { initial: { opacity: 0, rotateY: 90 }, animate: { opacity: 1, rotateY: 0 } },
  blur: { initial: { opacity: 0, filter: 'blur(14px)' }, animate: { opacity: 1, filter: 'blur(0px)' } },
  rise: { initial: { opacity: 0, y: 90, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 } },
  swing: { initial: { opacity: 0, x: -28, rotate: -7 }, animate: { opacity: 1, x: 0, rotate: 0 } },
  pop: { initial: { opacity: 0, scale: 0.55 }, animate: { opacity: 1, scale: 1 } },
  'ken-burns': { initial: { opacity: 0 }, animate: { opacity: 1 } }
};

export function GalleryBlock({ props }: { props: BlockProps }) {
  const images = arr(props, 'images');
  const layout = str(props, 'variant') || 'grid';
  const anim = str(props, 'animation') || 'fade';
  const a = PHOTO_ANIMS[anim] ?? PHOTO_ANIMS.fade;
  const title = str(props, 'title');

  if (layout === 'carousel') {
    return (
      <GalleryCarousel
        images={images}
        anim={a}
        animKey={anim}
        title={title}
        intervalSec={Math.max(1, Number(str(props, 'interval_sec')) || 3)}
      />
    );
  }

  if (layout === 'column') {
    return (
      <section className="px-6 py-16">
        <h2 className="mb-8 text-center text-xl md:text-2xl">{str(props, 'title')}</h2>
        <div className="mx-auto flex w-full flex-col gap-5">
          {images.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              {...a}
              whileInView={a.animate}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: Math.min(i, 4) * 0.08 }}
              className="relative aspect-[4/5] w-full overflow-hidden rounded-lg"
            >
              <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 420px" quality={75} loading="lazy" className="object-cover" />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <h2 className="mb-8 text-center text-xl md:text-2xl">{str(props, 'title')}</h2>
      <div className="mx-auto grid w-full grid-cols-2 gap-3">
        {images.map((src, i) => (
          <motion.div
            key={`${src}-${i}`}
            {...a}
            whileInView={a.animate}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className={`relative aspect-[3/4] overflow-hidden rounded-lg ${i === 0 || i === 3 ? 'col-span-2' : ''}`}
          >
            <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" quality={75} loading="lazy" className="object-cover" />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function GalleryCarousel({
  images,
  anim,
  animKey,
  title,
  intervalSec
}: {
  images: string[];
  anim: { initial: Target; animate: Target };
  animKey: string;
  title: string;
  intervalSec: number;
}) {
  const [idx, setIdx] = useState(0);
  const preview = usePreview();

  useEffect(() => {
    if (preview || images.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % images.length), intervalSec * 1000);
    return () => clearInterval(id);
  }, [preview, images.length, intervalSec]);

  if (images.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <h2 className="mb-8 text-center text-xl md:text-2xl">{title}</h2>
      <div className="mx-auto w-full">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg">
          {animKey === 'ken-burns' ? (
            <motion.div key={idx} {...anim} transition={{ duration: 0.9 }} className="absolute inset-0 h-full w-full">
              <motion.div
                className="h-full w-full"
                animate={{ scale: [1, 1.15] }}
                transition={{ duration: Math.max(8, intervalSec * 2), repeat: Infinity, ease: 'linear' }}
              >
                <Image src={images[idx]} alt="" fill sizes="(max-width: 768px) 100vw, 420px" quality={80} className="object-cover" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key={idx} {...anim} transition={{ duration: 0.7 }} className="absolute inset-0 h-full w-full">
              <Image src={images[idx]} alt="" fill sizes="(max-width: 768px) 100vw, 420px" quality={80} className="object-cover" />
            </motion.div>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Tampilkan foto ${i + 1}`}
                className={`h-1.5 rounded-full bg-current transition-all ${i === idx ? 'w-5 opacity-90' : 'w-1.5 opacity-30 hover:opacity-60'}`}
              />
            ))}
          </div>
        )}
        <p className="mt-3 text-center text-[10px] uppercase tracking-widest opacity-50">
          Carousel otomatis · {intervalSec} detik
        </p>
      </div>
    </section>
  );
}

export function MapsBlock({ props }: { props: BlockProps }) {
  return (
    <section className="px-6 py-14 text-center">
      <h2 className="text-xl md:text-2xl">{str(props, 'title')}</h2>
      <p className="mt-2 text-sm opacity-80">{str(props, 'address')}</p>
      <div className="mx-auto mt-6 w-full overflow-hidden rounded-xl border border-current/10">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(str(props, 'address'))}&output=embed`}
          className="h-64 w-full"
          loading="lazy"
          title={str(props, 'address')}
        />
      </div>
    </section>
  );
}

export function ThanksBlock({ props }: { props: BlockProps }) {
  return (
    <section className="px-6 py-20 text-center">
      <Ornament className="mb-6 opacity-60" />
      <h2 className="text-2xl font-medium md:text-3xl">{str(props, 'title')}</h2>
      <p className="mx-auto mt-6 w-full text-sm leading-relaxed opacity-80">
        {str(props, 'message')}
      </p>
      <p className="mt-8 text-xs uppercase tracking-widest opacity-70">{str(props, 'closing')}</p>
      <p className="mt-4 text-xl italic">{str(props, 'names')}</p>
    </section>
  );
}

const DIVIDER_VARIANTS: Record<string, React.ReactNode> = {
  line: (
    <div className="flex items-center gap-3">
      <span className="h-px w-16 bg-current opacity-40" />
      <span className="h-1.5 w-1.5 rotate-45 bg-current opacity-70" />
      <span className="h-px w-16 bg-current opacity-40" />
    </div>
  ),
  dots: (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <span key={i} className={`h-1 w-1 rounded-full bg-current ${i % 2 ? 'opacity-30' : 'opacity-80'}`} />
      ))}
    </div>
  ),
  diamond: (
    <div className="flex items-center gap-3">
      <span className="h-px w-20 bg-current opacity-40" />
      <span className="h-2 w-2 rotate-45 border border-current opacity-80" />
      <span className="h-px w-20 bg-current opacity-40" />
    </div>
  ),
  hearts: (
    <div className="flex items-center gap-3">
      <span className="h-px w-14 bg-current opacity-40" />
      <Heart className="h-4 w-4 opacity-80" />
      <span className="h-px w-14 bg-current opacity-40" />
    </div>
  ),
  leaves: (
    <div className="flex items-center gap-3">
      <span className="h-px w-14 bg-current opacity-40" />
      <Sprout className="h-4 w-4 opacity-80" />
      <span className="h-px w-14 bg-current opacity-40" />
    </div>
  )
};

/** Pemisah / ornamen antar-section (plug-and-play: cukup klik tambah). */
export function DividerBlock({ props }: { props: BlockProps }) {
  const variant = str(props, 'variant') || 'line';
  return (
    <section className="flex w-full items-center justify-center px-6 py-8 text-current" aria-hidden>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-center"
      >
        {DIVIDER_VARIANTS[variant] ?? DIVIDER_VARIANTS.line}
      </motion.div>
    </section>
  );
}