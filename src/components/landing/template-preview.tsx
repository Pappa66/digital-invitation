'use client';

import { useEffect, useRef, useState } from 'react';
import { Render } from '@puckeditor/core';
import { config } from '@/puck/config';
import type { PuckData } from '@/lib/canvas/puck-format';

const CANVAS_W = 430;

interface TemplatePreviewProps {
  canvas: PuckData;
  /** Warna latar tema untuk menutup area putih kosong sambil menunggu render/gambar. */
  bg?: string;
}

/**
 * Render asli template Puck di-scale agar muat di kartu. Pointer & animasi
 * dimatikan (preview). Konten di-absolute agar tidak mendorong layout kartu.
 */
export default function TemplatePreview({ canvas, bg }: TemplatePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.6);
  const theme = canvas.root.props;

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
        background: `linear-gradient(135deg, ${theme?.primary ?? '#BFA06A'}11 0%, ${theme?.secondary ?? '#D9A7A4'}22 60%, ${bg ?? '#ffffff'} 100%)`
      }}
    >
      <div className="absolute left-0 top-0 will-change-transform" style={{ width: CANVAS_W }}>
        <div className="w-full" style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }} aria-hidden data-preview>
          <Render config={config} data={canvas} />
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
