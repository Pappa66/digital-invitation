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

/** Render asli template di-discale agar muat di kartu. Pointer & timer dimatikan. */
export default function TemplatePreview({ canvas, bg }: TemplatePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CANVAS_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none relative aspect-[3/4] w-full select-none overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${canvas.theme.primary}11 0%, ${canvas.theme.secondary}22 60%, ${bg ?? '#ffffff'} 100%)` }}
    >
      <div
        className="w-[430px]"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        aria-hidden
        data-preview
      >
        <GuestRenderer canvas={canvas} preview />
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to bottom, transparent 70%, rgba(14,14,19,0.55) 100%)' }}
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
    </div>
  );
}