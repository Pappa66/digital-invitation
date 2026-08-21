'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/** 3D ringan: tilt perspective mengikuti cursor (desktop) + float halus. 0 dep tambahan. */
export function Tilt3D({ children, intensity = 8 }: { children: React.ReactNode; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 80, damping: 18 });

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' as const, rotateX: rx, rotateY: ry }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}

/** Float ornament 3D ringan: mengambang dengan depth */
export function Float3D({ children, depth = 20, delay = 0 }: { children: React.ReactNode; depth?: number; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0], z: [0, depth / 2, 0] }}
      transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
      style={{ transformStyle: 'preserve-3d' as const }}
    >
      {children}
    </motion.div>
  );
}
