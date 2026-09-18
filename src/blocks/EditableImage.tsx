'use client';

import { useEffect, useRef } from 'react';
import { createUsePuck } from '@puckeditor/core';
import type { config } from '@/puck/config';
import { setComponentProp } from '@/puck/overrides/position-utils';

const usePuckStore = createUsePuck<typeof config>();

interface PanOverlayProps {
  componentId: string;
  propKey: string;
  zoomKey: string;
  position: string;
  zoom: number;
}

function parsePos(pos: string): { x: number; y: number } {
  const m = pos.split(/\s+/).map((v) => parseFloat(v));
  return { x: Number.isFinite(m[0]) ? m[0] : 50, y: Number.isFinite(m[1]) ? m[1] : 50 };
}

/** Overlay: geser (object-position) + scroll untuk zoom. */
function PanOverlay({ componentId, propKey, zoomKey, position, zoom }: PanOverlayProps) {
  const dispatch = usePuckStore((s) => s.dispatch);
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number; ox: number; oy: number; w: number; h: number } | null>(null);

  // Zoom via scroll (non-passive agar bisa preventDefault).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = Math.max(1, Math.min(3, zoom - e.deltaY * 0.0015));
      dispatch({ type: 'setData', data: (prev) => setComponentProp(prev, componentId, zoomKey, Number(next.toFixed(2))) });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [componentId, zoomKey, zoom, dispatch]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.stopPropagation();
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cur = parsePos(position);
    start.current = { x: e.clientX, y: e.clientY, ox: cur.x, oy: cur.y, w: rect.width || 1, h: rect.height || 1 };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s) return;
    const nx = Math.max(0, Math.min(100, s.ox - ((e.clientX - s.x) / s.w) * 100));
    const ny = Math.max(0, Math.min(100, s.oy - ((e.clientY - s.y) / s.h) * 100));
    dispatch({ type: 'setData', data: (prev) => setComponentProp(prev, componentId, propKey, `${Math.round(nx)}% ${Math.round(ny)}%`) });
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    start.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  return (
    <div
      ref={ref}
      className="absolute inset-0 z-10 cursor-move"
      title="Geser untuk fokus · scroll untuk zoom"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    />
  );
}

interface EditableImageProps {
  src: string;
  alt?: string;
  fit?: 'cover' | 'contain';
  position?: string;
  zoom?: number;
  editable?: boolean;
  componentId?: string;
  propKey?: string;
  zoomKey?: string;
  className?: string;
  imgClassName?: string;
}

/** Gambar dengan fokus (geser) & zoom (scroll) di editor; statis di tamu. */
export default function EditableImage({
  src,
  alt = '',
  fit = 'cover',
  position = 'center',
  zoom = 1,
  editable,
  componentId,
  propKey = 'imgPosition',
  zoomKey = 'imgZoom',
  className,
  imgClassName
}: EditableImageProps) {
  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={editable ? undefined : 'lazy'}
        decoding="async"
        className={`h-full w-full ${imgClassName ?? ''}`}
        style={{ objectFit: fit, objectPosition: position, transform: zoom && zoom !== 1 ? `scale(${zoom})` : undefined }}
      />
      {editable && componentId ? <PanOverlay componentId={componentId} propKey={propKey} zoomKey={zoomKey} position={position} zoom={zoom} /> : null}
    </div>
  );
}
