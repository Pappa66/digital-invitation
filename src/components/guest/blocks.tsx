'use client';

import { useEffect, useState, useRef, useContext } from 'react';
import { motion, type Target } from 'framer-motion';
import Image from 'next/image';
import { Calendar, MapPin, Heart, Sparkles, Gem, BookOpen, Sprout, MailOpen, Plus, Radio } from 'lucide-react';
import type { BlockProps, DecorAsset, DecorShapeKind } from '@/lib/types';
import { Editable, BuilderEditableContext } from '@/components/builder/inline-edit';
import { usePreview } from '@/components/guest/preview-context';
import { useTheme } from '@/components/guest/theme-context';
import { useInnerPositions } from '@/components/guest/inner-context';
import { useBuilderStore } from '@/store/builder-store';

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

/**
 * Sub-elemen bergeser di dalam blok (hanya mode bebas): menerapkan offset
 * tersimpan pada `block.inner` sebagai transform translate + menandai elemen
 * dengan `data-inner` agar builder menampilkan handle drag.
 */
function Inner({ name, className, children }: { name: string; className?: string; children: React.ReactNode }) {
  const inner = useInnerPositions();
  const pos = inner?.[name];
  return (
    <div
      data-inner={name}
      className={className}
      style={pos ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : undefined}
    >
      {children}
    </div>
  );
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

/* ============================ Layer dekor ============================ */

function ShapeSvg({ kind, color, size, opacity }: { kind: string; color: string; size: number; opacity: number }) {
  const s = size;
  const props = { fill: kind === 'ring' ? 'none' : color, stroke: kind === 'ring' ? color : 'none', strokeWidth: kind === 'ring' ? s * 0.06 : 0 };
  let node: React.ReactNode = null;
  switch (kind) {
    case 'circle':
      node = <circle cx={s / 2} cy={s / 2} r={s / 2} {...props} />;
      break;
    case 'square':
      node = <rect width={s} height={s} {...props} />;
      break;
    case 'triangle':
      node = (
        <polygon
          points={`${s / 2},0 ${s},${s * 0.92} 0,${s * 0.92}`}
          {...props}
        />
      );
      break;
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? s / 2 : s * 0.22;
        const a = (Math.PI / 5) * i - Math.PI / 2;
        pts.push(`${s / 2 + r * Math.cos(a)},${s / 2 + r * Math.sin(a)}`);
      }
      node = <polygon points={pts.join(' ')} {...props} />;
      break;
    }
    case 'heart':
      node = (
        <path
          d={`M ${s / 2} ${s * 0.9} C ${s * 0.05} ${s * 0.65}, ${s * 0.05} ${s * 0.3}, ${s * 0.3} ${s * 0.3} C ${s * 0.46} ${s * 0.3}, ${s / 2} ${s * 0.42}, ${s / 2} ${s * 0.5} C ${s / 2} ${s * 0.42}, ${s * 0.54} ${s * 0.3}, ${s * 0.7} ${s * 0.3} C ${s * 0.95} ${s * 0.3}, ${s * 0.95} ${s * 0.65}, ${s / 2} ${s * 0.9} Z`}
          {...props}
        />
      );
      break;
    case 'leaf':
      node = (
        <path
          d={`M ${s * 0.1} ${s * 0.9} Q ${s * 0.95} ${s * 0.7}, ${s * 0.9} ${s * 0.1} Q ${s * 0.55} ${s * 0.2}, ${s * 0.1} ${s * 0.9} Z`}
          {...props}
        />
      );
      break;
    case 'diamond':
      node = (
        <polygon
          points={`${s / 2},0 ${s},${s / 2} ${s / 2},${s} 0,${s / 2}`}
          {...props}
        />
      );
      break;
    case 'ring':
      node = <circle cx={s / 2} cy={s / 2} r={s / 2 - s * 0.05} {...props} />;
      break;
    default:
      node = <circle cx={s / 2} cy={s / 2} r={s / 2} {...props} />;
  }
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ opacity, display: 'block' }} aria-hidden>
      {node}
    </svg>
  );
}

const PHOTO_SHAPE_CLASS: Record<string, string> = {
  square: 'rounded-none',
  circle: 'rounded-full object-cover',
  rounded: 'rounded-xl',
  tilt: 'rounded-xl -rotate-3'
};

function DecorText({ props }: { props: DecorAsset }) {
  const align = props.align ?? 'center';
  return (
    <div
      className={`${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}
      style={{
        fontWeight: props.fontWeight ?? 'normal',
        fontStyle: props.italic ? 'italic' : 'normal',
        textDecoration: props.underline ? 'underline' : 'none',
        fontSize: `${props.fontSize ?? 14}px`,
        color: props.color ?? '#ffffff',
        opacity: props.opacity ?? 1,
        whiteSpace: 'pre-wrap'
      }}
    >
      {props.text ?? ''}
    </div>
  );
}

function DecorImage({ props }: { props: DecorAsset }) {
  const url = props.imageUrl ?? '';
  if (!url) return null;
  const width = props.width ?? 120;
  const cls = (props.photoShape ?? 'rounded') === 'circle' ? 'rounded-full object-cover' : (PHOTO_SHAPE_CLASS[props.photoShape ?? 'rounded']);
  return (
    <img
      src={url}
      alt=""
      width={width}
      style={{ width, height: width, opacity: props.opacity ?? 1 }}
      className={`${cls} ${props.photoShape === 'circle' ? 'aspect-square' : ''}`}
    />
  );
}

export function DecorAssetView({ asset }: { asset: DecorAsset }) {
  if (asset.kind === 'text') return <DecorText props={asset} />;
  if (asset.kind === 'image') return <DecorImage props={asset} />;
  const shape = asset.shape ?? 'circle';
  return (
    <ShapeSvg
      kind={shape}
      color={asset.color ?? '#c9a45c'}
      size={asset.size ?? 48}
      opacity={asset.opacity ?? 1}
    />
  );
}

/** Layer dekor di dalam blok. Mode builder: interaktif (drag, pilih, hapus). Mode guest: pasif. */
export function DecorLayer({ blockId, decor }: { blockId: string; decor?: DecorAsset[] }) {
  const inBuilder = useContext(BuilderEditableContext) !== null;

  if (inBuilder) {
    return <BuilderDecorLayer blockId={blockId} decor={decor} />;
  }
  if (!decor || decor.length === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {decor.map((asset) => (
        <DecorNode key={asset.id} asset={asset} />
      ))}
    </div>
  );
}

function DecorNode({ asset }: { asset: DecorAsset }) {
  return (
    <div
      className="absolute"
      style={{
        left: asset.x,
        top: asset.y,
        transform: asset.rotation ? `rotate(${asset.rotation}deg)` : undefined,
        zIndex: asset.layer ?? 0
      }}
    >
      <DecorAssetView asset={asset} />
    </div>
  );
}

const DECOR_SHAPES: { key: string; label: string }[] = [
  { key: 'circle', label: 'Bulat' },
  { key: 'square', label: 'Kotak' },
  { key: 'triangle', label: 'Segitiga' },
  { key: 'star', label: 'Bintang' },
  { key: 'heart', label: 'Hati' },
  { key: 'leaf', label: 'Daun' },
  { key: 'diamond', label: 'Ketupat' },
  { key: 'ring', label: 'Cincin' }
];

function decorUid() {
  return `d-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Editor layer dekor di mode builder: pilih, seret (dengan guide/snap), hapus, tambah. */
function BuilderDecorLayer({ blockId, decor }: { blockId: string; decor?: DecorAsset[] }) {
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const selectedDecor = useBuilderStore((s) => s.selectedDecor);
  const selectDecor = useBuilderStore((s) => s.selectDecor);
  const updateDecor = useBuilderStore((s) => s.updateDecor);
  const removeDecor = useBuilderStore((s) => s.removeDecor);
  const addDecor = useBuilderStore((s) => s.addDecor);
  const [addMenu, setAddMenu] = useState<'main' | 'text' | 'image' | null>(null);
  const [shapePick, setShapePick] = useState<DecorShapeKind>('circle');
  const dragRef = useRef<{
    assetId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    w: number;
    h: number;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [guides, setGuides] = useState<{ x?: number; y?: number }>({});
  const boxRef = useRef<HTMLDivElement>(null);

  const blockSelected = selectedBlockId === blockId;
  const isSelected = (id: string) => selectedDecor === `${blockId}::${id}`;

  function startDrag(e: React.PointerEvent, asset: DecorAsset) {
    e.stopPropagation();
    e.preventDefault();
    selectDecor(`${blockId}::${asset.id}`);
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      assetId: asset.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: asset.x,
      origY: asset.y,
      w: rect.width,
      h: rect.height
    };
    setDraggingId(asset.id);
  }

  useEffect(() => {
    if (!dragRef.current) return;
    const onMove = (ev: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const box = boxRef.current?.getBoundingClientRect();
      const blkW = box?.width ?? 420;
      const blkH = box?.height ?? 800;

      let nx = Math.max(0, d.origX + (ev.clientX - d.startX));
      let ny = Math.max(0, d.origY + (ev.clientY - d.startY));
      const cx = nx + d.w / 2;
      const cy = ny + d.h / 2;

      const snap = 6;
      let gx: number | undefined;
      let gy: number | undefined;
      // tengah horizontal
      if (Math.abs(cx - blkW / 2) < snap) {
        nx = blkW / 2 - d.w / 2;
        gx = blkW / 2;
      } else if (Math.abs(cx - d.w / 2) < snap) {
        nx = 0;
        gx = 0;
      } else if (Math.abs(cx - (blkW - d.w / 2)) < snap) {
        nx = blkW - d.w;
        gx = blkW;
      }
      // tengah vertikal
      if (Math.abs(cy - blkH / 2) < snap) {
        ny = blkH / 2 - d.h / 2;
        gy = blkH / 2;
      } else if (Math.abs(cy - d.h / 2) < snap) {
        ny = 0;
        gy = 0;
      }
      setGuides({ x: gx, y: gy });
      updateDecor(blockId, d.assetId, { x: Math.round(nx), y: Math.round(ny) });
    };
    const onUp = () => {
      dragRef.current = null;
      setDraggingId(null);
      setGuides({});
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId, blockId, updateDecor]);

  function addText() {
    addDecor(blockId, {
      id: decorUid(),
      kind: 'text',
      text: 'Teks tambahan',
      fontSize: 14,
      color: '#ffffff',
      align: 'center',
      x: 120,
      y: 40,
      width: 180,
      layer: 1
    });
    setAddMenu(null);
  }

  function addImage() {
    addDecor(blockId, {
      id: decorUid(),
      kind: 'image',
      imageUrl: '',
      photoShape: 'rounded',
      width: 100,
      x: 160,
      y: 40,
      layer: 1
    });
    setAddMenu(null);
  }

  function addShape() {
    addDecor(blockId, {
      id: decorUid(),
      kind: 'shape',
      shape: shapePick,
      color: '#c9a45c',
      size: 48,
      x: 180,
      y: 40,
      opacity: 0.9,
      layer: 1
    });
    setAddMenu(null);
  }

  const items = decor ?? [];

  return (
    <div ref={boxRef} className="pointer-events-none absolute inset-0 z-20 overflow-visible">
      {/* Guide align saat drag */}
      {guides.x !== undefined && (
        <div className="pointer-events-none absolute top-0 h-full w-px bg-[#c9a45c]" style={{ left: guides.x }} />
      )}
      {guides.y !== undefined && (
        <div className="pointer-events-none absolute left-0 h-px w-full bg-[#c9a45c]" style={{ top: guides.y }} />
      )}

      {/* Kontrol pilihan & drag pada tiap asset */}
      {items.map((asset) => (
        <div
          key={asset.id}
          data-decor
          className={`pointer-events-auto absolute cursor-move ${isSelected(asset.id) ? 'outline-2 outline-dashed outline-[#c9a45c] outline-offset-1' : 'outline-none'}`}
          style={{
            left: asset.x,
            top: asset.y,
            transform: asset.rotation ? `rotate(${asset.rotation}deg)` : undefined,
            zIndex: (asset.layer ?? 0) + 100
          }}
          onPointerDown={(e) => startDrag(e, asset)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            removeDecor(blockId, asset.id);
          }}
        >
          <DecorAssetView asset={asset} />
          {isSelected(asset.id) && (
            <>
              <button
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white shadow"
                title="Hapus asset"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  removeDecor(blockId, asset.id);
                }}
              >
                ✕
              </button>
              <span className="absolute -bottom-5 left-0 whitespace-nowrap text-[9px] text-[#8a6d2f]">
                {asset.kind === 'shape' ? asset.shape : asset.kind} · drag utk pindah
              </span>
            </>
          )}
        </div>
      ))}

      {/* Tombol tambah asset pada blok terpilih */}
      {blockSelected && (
        <div className="pointer-events-auto absolute -top-3 left-1/2 z-[300] flex w-40 -translate-x-1/2 justify-center">
          {addMenu === 'main' ? (
            <div className="flex flex-col gap-1 rounded-md bg-[#141414]/95 p-1.5 shadow-lg ring-1 ring-white/10">
              <button
                className="rounded px-2 py-1 text-left text-[11px] text-white hover:bg-[#c9a45c]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  addShape();
                }}
              >
                {DECOR_SHAPES.find((s) => s.key === shapePick)?.label ?? 'Shape'} ({shapePick})
              </button>
              <button
                className="rounded px-2 py-1 text-left text-[11px] text-white hover:bg-[#c9a45c]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  addText();
                }}
              >
                Teks
              </button>
              <button
                className="rounded px-2 py-1 text-left text-[11px] text-white hover:bg-[#c9a45c]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  addImage();
                }}
              >
                Gambar
              </button>
              <div className="my-1 h-px bg-white/10" />
              <p className="px-2 pb-1 text-[9px] uppercase tracking-wide text-[#c9a45c]">Shape</p>
              <div className="flex flex-wrap gap-1 px-1">
                {DECOR_SHAPES.map((s) => (
                  <button
                    key={s.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShapePick(s.key as DecorShapeKind);
                    }}
                    className={`rounded px-1.5 py-0.5 text-[10px] ${shapePick === s.key ? 'bg-[#c9a45c] text-white' : 'text-white/80 hover:bg-white/10'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button
                className="mt-1 rounded px-2 py-1 text-left text-[11px] text-[#c9a45c] hover:bg-[#c9a45c]/30"
                onClick={(e) => {
                  e.stopPropagation();
                  setAddMenu(null);
                }}
              >
                Tutup
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-1 rounded-md bg-[#141414]/90 px-2.5 py-1 text-xs font-medium text-white shadow-lg ring-1 ring-white/10 transition-colors hover:bg-[#c9a45c]/30"
              title="Tambah asset di dalam blok"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setAddMenu('main');
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Asset
            </button>
          )}
        </div>
      )}
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

function BackgroundImage({ src, fit, position }: { src: string; fit?: string; position?: string }) {
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
        className={fit === 'contain' ? 'object-contain' : 'object-cover'}
        style={{ objectPosition: position || 'center' }}
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

/** "&" raksasa khas undangan mewah (webvitation.com): besar, tipis, miring. */
function GiantAmp() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      aria-hidden
      className="flex items-center justify-center py-4"
    >
      <span
        className="font-heading text-7xl leading-none italic opacity-30 md:text-8xl"
        style={{ color: 'var(--color-primary)' }}
      >
        &amp;
      </span>
    </motion.div>
  );
}

export function HeroBlock({ props, greetingName }: { props: BlockProps; greetingName?: string }) {
  const showOrnament = bool(props, 'show_ornament');
  const align = str(props, 'variant') === 'left' ? 'left' : 'center';
  const isLeft = align === 'left';
  const preview = usePreview();
  const theme = useTheme();
  const inBuilder = useContext(BuilderEditableContext) !== null;
  const [opened, setOpened] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const heroStyle = theme?.hero_style ?? 'image';
  const hasBgImage = !!str(props, 'bg_image');
  const showGradient = !hasBgImage && heroStyle === 'gradient';

  function openInvitation() {
    if (opened) return;
    setOpened(true);
    window.dispatchEvent(new CustomEvent('invite-opened'));
    // Gulir mulus ke blok berikutnya (umumnya Couple) setelah animasi fade selesai.
    window.setTimeout(() => {
      const el = sectionRef.current;
      if (el) {
        const wrapper = el.closest('[data-block-type]');
        const target =
          (wrapper ? wrapper.nextElementSibling : null) ??
          (el.nextElementSibling as HTMLElement | null) ??
          el;
        const rect = target.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + rect.top, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 650);
  }

  return (
    <section
      ref={sectionRef}
      className={`relative flex min-h-screen w-full flex-col overflow-hidden px-6 py-20 text-white ${
        isLeft ? 'items-start justify-center text-left' : 'items-center justify-center text-center'
      }`}
    >
      <BackgroundImage src={str(props, 'bg_image')} fit={str(props, 'bg_fit')} position={str(props, 'bg_position')} />
      {showGradient && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(165deg, var(--color-primary) 0%, color-mix(in srgb, var(--color-primary) 55%, var(--color-secondary)) 45%, var(--color-background) 135%)`
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,0.28), transparent 55%), radial-gradient(100% 70% at 85% 100%, rgba(255,255,255,0.12), transparent 55%)'
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 42% at 50% 38%, transparent 30%, rgba(0,0,0,0.5) 100%)'
            }}
          />
        </div>
      )}
      <HeroSparkles />
      <Inner name="content">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          animate={opened ? { opacity: 0, y: -40, transition: { duration: 0.6, ease: 'easeInOut' } } : {}}
          className={`relative z-10 flex w-full flex-col ${isLeft ? 'items-start' : 'items-center'}`}
        >
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xs uppercase tracking-[0.3em]"
          >
            <Editable prop="caption">{str(props, 'caption')}</Editable>
          </motion.p>
          {showOrnament && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={isLeft ? 'mt-4 mr-auto text-white opacity-80' : 'mt-4 text-white opacity-80'}
            >
              <Ornament />
            </motion.div>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-6 text-3xl font-medium leading-tight sm:text-4xl md:text-5xl"
          >
            <Editable prop="bride">{str(props, 'bride')}</Editable>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="my-4 text-xl sm:text-2xl"
          >
            &amp;
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-3xl font-medium leading-tight sm:text-4xl md:text-5xl"
          >
            <Editable prop="groom">{str(props, 'groom')}</Editable>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.05 }}
            className="mt-8 text-sm uppercase tracking-widest opacity-90"
          >
            <Editable prop="date">{str(props, 'date')}</Editable>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-3 flex items-center gap-2 text-xs opacity-80"
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>
              <Editable prop="place">{str(props, 'place')}</Editable>
            </span>
          </motion.div>
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
          {!preview && !inBuilder && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              animate={opened ? { opacity: 0, y: -12, transition: { duration: 0.4 } } : {}}
              onClick={openInvitation}
              className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform hover:scale-[1.04] active:scale-95"
            >
              <MailOpen className="h-4 w-4" />
              Buka Undangan
            </motion.button>
          )}
        </motion.div>
      </Inner>
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
        {str(props, 'introduction') &&
          title(
            <p className="mb-6 text-sm leading-relaxed opacity-80">
              <Editable prop="introduction" multiline>
                {str(props, 'introduction')}
              </Editable>
            </p>
          )}
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
          <Inner name="groom">
            <div className="mx-auto grid w-full max-w-2xl items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-8">
              <div className="min-w-0 text-center">
                <CouplePerson propKey="groom" name={str(props, 'groom')} parents={str(props, 'groom_parents')} />
              </div>
              <div className="my-2 flex min-w-0 justify-center md:my-0">
                <GiantAmp />
              </div>
              <div className="min-w-0 text-center">
                <CouplePerson propKey="bride" name={str(props, 'bride')} parents={str(props, 'bride_parents')} />
              </div>
            </div>
          </Inner>
        ) : (
          <>
            <div className="mb-0">
              <CouplePerson propKey="groom" name={str(props, 'groom')} parents={str(props, 'groom_parents')} />
            </div>
            <GiantAmp />
            <div className="mt-0">
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
      <Inner name="timer">
        <CountdownTimer target={target} variant={variant} />
      </Inner>
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

  const title = str(props, 'title');
  const dateStr = str(props, 'date');
  const address = str(props, 'address') || str(props, 'location');

  const calendarHref = (() => {
    const text = [title, `Lokasi: ${str(props, 'location')}`, address].filter(Boolean).join('\n');
    return (
      'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      `&text=${encodeURIComponent(`Undangan: ${title}`)}` +
      `&details=${encodeURIComponent(text)}` +
      `&location=${encodeURIComponent(address)}`
    );
  })();
  return (
    <section className={`px-6 py-14 text-center ${band ? 'py-20' : ''}`}>
      <div
        className={`${
          band
            ? 'mx-auto w-full border-y border-current/10 py-12'
            : 'mx-auto w-full rounded-xl border border-current/10 p-8'
        }`}
      >
        <Inner name="content">
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
              {(str(props, 'maps_url') || address) && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                  {str(props, 'live_url') && bool(props, 'show_live') !== false && (
                    <a
                      href={str(props, 'live_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-current/25 px-4 py-2 text-xs font-medium transition-colors hover:bg-current/10"
                    >
                      <Radio className="h-3.5 w-3.5" /> Siaran Langsung
                    </a>
                  )}
                  {str(props, 'maps_url') && (
                    <a
                      href={str(props, 'maps_url')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-current/25 px-4 py-2 text-xs font-medium transition-colors hover:bg-current/10"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Buka Maps
                    </a>
                  )}
                  {address && (
                    <a
                      href={calendarHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-current/25 px-4 py-2 text-xs font-medium transition-colors hover:bg-current/10"
                    >
                      <Calendar className="h-3.5 w-3.5" /> Simpan ke Kalender
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </Inner>
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
      <Inner name="title">
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
      </Inner>
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
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
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

  if (layout === 'grid3') {
    return (
      <section className="px-6 py-16">
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
        <div className="mx-auto grid w-full grid-cols-3 gap-2.5">
          {images.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              {...a}
              whileInView={a.animate}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="relative aspect-square overflow-hidden rounded-md"
            >
              <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" quality={70} loading="lazy" className="object-cover" />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'masonry') {
    return (
      <section className="px-6 py-16">
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
        <div className="mx-auto w-full">
          <div className="columns-2 gap-3 [column-fill:_balance] md:columns-3">
            {images.map((src, i) => (
              <motion.div
                key={`${src}-${i}`}
                {...a}
                whileInView={a.animate}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                className="mb-3 break-inside-avoid overflow-hidden rounded-lg"
              >
                <Image
                  src={src}
                  alt=""
                  width={600}
                  height={700}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  quality={70}
                  loading="lazy"
                  className="h-auto w-full object-cover"
                  style={{ aspectRatio: `${[3, 4, 5, 3][i % 4]}/4` }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'mosaic') {
    return (
      <section className="px-6 py-16">
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
        <div className="mx-auto grid w-full grid-cols-3 gap-2">
          {images.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              {...a}
              whileInView={a.animate}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: Math.min(i, 5) * 0.06 }}
              className={`relative overflow-hidden rounded-md ${i % 5 === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-[3/4]'}`}
            >
              <Image src={src} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" quality={75} loading="lazy" className="object-cover" />
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'polaroid') {
    return (
      <section className="px-6 py-16">
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
        <div className="mx-auto grid w-full grid-cols-2 gap-6 md:grid-cols-3">
          {images.map((src, i) => (
            <motion.div
              key={`${src}-${i}`}
              {...a}
              whileInView={a.animate}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (i % 6) * 0.07 }}
              className="break-inside-avoid rounded-sm bg-white p-2 pb-8 shadow-[0_6px_16px_rgba(0,0,0,0.18)]"
              style={{ transform: `rotate(${[-3, 2, -1, 3, -2, 2][i % 6]}deg)` }}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-[#e8e2d5]">
                <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" quality={70} loading="lazy" className="object-cover" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'arch') {
    const hero = images[0];
    const rest = images.slice(1);
    return (
      <section className="px-6 py-16">
        <Inner name="title">
          <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </Inner>
        <div className="mx-auto w-full">
          {hero && (
            <motion.div
              {...a}
              whileInView={a.animate}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative mx-auto aspect-[3/4.2] w-full max-w-[300px] overflow-hidden rounded-t-[999px] shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
            >
              <Image src={hero} alt="" fill sizes="(max-width: 768px) 100vw, 420px" quality={80} loading="lazy" className="object-cover" />
            </motion.div>
          )}
          {rest.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {rest.map((src, i) => (
                <motion.div
                  key={`${src}-${i}`}
                  {...a}
                  whileInView={a.animate}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="relative aspect-square overflow-hidden rounded-lg"
                >
                  <Image src={src} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" quality={70} loading="lazy" className="object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-16">
      <Inner name="title">
        <h2 className="mb-8 text-center text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
      </Inner>
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
      <Inner name="title">
        <h2 className="mb-8 text-center text-xl md:text-2xl">{title}</h2>
      </Inner>
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
  const embedUrl = str(props, 'embed_url');
  const address = str(props, 'address');
  const direct = maybeEmbedSrc(embedUrl);
  const [apiSrc, setApiSrc] = useState<{ url: string; src: string } | null>(null);

  useEffect(() => {
    let alive = true;
    if (!embedUrl || direct) return () => {
      alive = false;
    };
    fetch(`/api/maps?url=${encodeURIComponent(embedUrl)}`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d.src) setApiSrc({ url: embedUrl, src: d.src });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [embedUrl, direct]);

  const resolved = direct ?? (apiSrc?.url === embedUrl ? apiSrc.src : null);
  const src = resolved ?? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  return (
    <section className="px-6 py-14 text-center">
      <Inner name="title">
        <h2 className="text-xl md:text-2xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
      </Inner>
      {address && <p className="mt-2 text-sm opacity-80">{address}</p>}
      <div className="mx-auto mt-6 w-full overflow-hidden rounded-xl border border-current/10">
        <iframe
          src={src}
          className="h-64 w-full"
          loading="lazy"
          title={address}
        />
      </div>
    </section>
  );
}

/** Ubah tautan Google Maps yang sudah langsung embedable. null = perlu di-resolve server. */
function maybeEmbedSrc(embedUrl: string): string | null {
  const raw = (embedUrl || '').trim();
  if (!raw) return null;
  if (/^https?:\/\/[^/]+\/maps\/embed/.test(raw) || /[?&]output=embed/.test(raw)) return raw;
  const at = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)(?:,(\d+)z)?/);
  if (at) return `https://maps.google.com/maps?q=${at[1]},${at[2]}&z=${at[3] ?? 15}&output=embed`;
  return null;
}

export function ThanksBlock({ props }: { props: BlockProps }) {
  return (
    <section className="px-6 py-20 text-center">
      <Inner name="title">
        <div>
          <Ornament className="mb-6 opacity-60" />
          <h2 className="text-2xl font-medium md:text-3xl"><Editable prop="title">{str(props, 'title')}</Editable></h2>
        </div>
      </Inner>
      <p className="mx-auto mt-6 w-full text-sm leading-relaxed opacity-80">
        {str(props, 'message')}
      </p>
      <p className="mt-8 text-xs uppercase tracking-widest opacity-70">{str(props, 'closing')}</p>
      <p className="mt-4 text-xl italic">{str(props, 'names')}</p>
    </section>
  );
}

export function TextBlock({ props }: { props: BlockProps }) {
  const align = str(props, 'align') === 'left' ? 'left' : str(props, 'align') === 'right' ? 'right' : 'center';
  return (
    <section className="px-6 py-8">
      <Inner name="text">
        <p
          className={`text-sm leading-relaxed opacity-90 ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`}
        >
          <Editable prop="text" multiline>
            {str(props, 'text')}
          </Editable>
        </p>
      </Inner>
    </section>
  );
}

export function PhotoBlock({ props }: { props: BlockProps }) {
  const rounded = bool(props, 'rounded');
  const image = str(props, 'image');
  const caption = str(props, 'caption');
  return (
    <section className="px-6 py-8">
      <Inner name="photo">
        <div className={`mx-auto w-full overflow-hidden ${rounded ? 'rounded-xl' : ''}`}>
          {image ? (
            <Image src={image} alt={caption} width={0} height={0} sizes="100vw" className="h-auto w-full object-cover" />
          ) : (
            <div className="flex h-48 w-full items-center justify-center border border-dashed border-current/20 text-xs text-[#8a7a66]">
              Pilih gambar di panel kanan
            </div>
          )}
        </div>
        {caption && <p className="mt-3 text-center text-xs opacity-70">{caption}</p>}
      </Inner>
    </section>
  );
}

/** Kutipan / ayat (Arab + latin + referensi) menyerupai seksi doa di webvitation. */
export function QuoteBlock({ props }: { props: BlockProps }) {
  return (
    <section className="px-6 py-14 text-center">
      <Inner name="quote">
        <div>
          <Ornament className="mb-6 opacity-50" />
          <p
            lang="ar"
            dir="rtl"
            className="mx-auto max-w-md font-['Amiri','Scheherazade_New',serif] text-2xl leading-[2] md:text-3xl"
          >
            <Editable prop="arabic" multiline>
              {str(props, 'arabic')}
            </Editable>
          </p>
          <p className="mx-auto mt-5 max-w-md text-sm italic leading-relaxed opacity-80">
            <Editable prop="latin" multiline>
              {str(props, 'latin')}
            </Editable>
          </p>
          {str(props, 'latin') && <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed opacity-70">{str(props, 'translation')}</p>}
          <p className="mt-5 text-xs uppercase tracking-widest opacity-60">{str(props, 'reference')}</p>
        </div>
      </Inner>
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