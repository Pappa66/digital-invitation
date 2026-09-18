'use client';

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Lebar kolom konten undangan (px) — selaras dengan preview builder. */
export const GUEST_CANVAS_WIDTH = 430;

/** Skala maksimum di layar lebar agar undangan tidak terasa sempit. */
const MAX_SCALE = 1.22;

interface GuestCanvasShellProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Membungkus output tamu: di layar lebar (>430px) konten di-scale proporsional
 * sehingga undangan terasa memenuhi layar, bukan kolom sempit dengan margin kosong.
 */
export function GuestCanvasShell({ children, className = '', style }: GuestCanvasShellProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: 0 });

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const update = () => {
      const vw = window.innerWidth;
      const pad = 24;
      const base = GUEST_CANVAS_WIDTH;
      const scale = vw > base + pad * 2 ? Math.min(MAX_SCALE, (vw - pad * 2) / base) : 1;
      setLayout({ scale, height: el.offsetHeight });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const { scale, height } = layout;
  const scaledH = height > 0 ? height * scale : undefined;

  return (
    <div
      className="relative mx-auto w-full overflow-x-clip"
      style={{
        maxWidth: scale > 1 ? GUEST_CANVAS_WIDTH * scale : GUEST_CANVAS_WIDTH,
        minHeight: scaledH
      }}
    >
      <div
        ref={innerRef}
        className={className}
        style={{
          width: GUEST_CANVAS_WIDTH,
          maxWidth: '100%',
          transform: scale > 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          ...style
        }}
      >
        {children}
      </div>
    </div>
  );
}
