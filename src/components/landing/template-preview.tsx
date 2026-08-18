'use client';

import { useEffect, useRef, useState } from 'react';
import type { CanvasData } from '@/lib/types';
import GuestRenderer from '@/components/guest/GuestRenderer';

const CANVAS_W = 430;

interface TemplatePreviewProps {
  canvas: CanvasData;
  /** Warna latar tema untuk menutup area putih kosong sambil menunggu render/gambar. */
  bg?: string;
}

/**
 * Render asli template di-scale agar muat di kartu. Pointer & timer dimatikan.
 *
 * Konten (lebar desain 430px) di-`position: absolute` agar TIDAK memengaruhi
 * tinggi/layout, merusak ukuran track grid, atau mendorong kartu. Kartu murni
 * dikendalikan oleh `aspect-[3/4]` + `overflow-hidden`; bagian bawah konten
 * yang lebih tinggi dari kartu terpotong rapi di ujung kartu.
 */
export default function TemplatePreview({ canvas, bg }: TemplatePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (typeof el.clientWidth !== 'number' || el.clientWidth <= 0) return;
      setScale(Math.min(1, el.clientWidth / CANVAS_W));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative min-w-0 select-none overflow-hidden"
      style={{
        aspectRatio: '3 / 4',
        background: `linear-gradient(135deg, ${canvas.theme.primary}11 0%, ${canvas.theme.secondary}22 60%, ${bg ?? '#ffffff'} 100%)`
      }}
    >
      {/* Kanvas asli — absolute + transform scale (origin kiri-atas). Tidak menyumbang layout. */}
      <div className="absolute left-0 top-0 will-change-transform" style={{ width: CANVAS_W }}>
        <div className="w-full" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} aria-hidden data-preview>
          <GuestRenderer canvas={canvas} preview />
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 70%, rgba(14,14,19,0.55) 100%)' }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}