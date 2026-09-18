'use client';

import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { EntranceKind, Position } from '@/puck/types';

const VARIANTS: Record<Exclude<EntranceKind, 'none'>, Variants> = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } }
};

interface BlockShellProps {
  position?: Position;
  /** Animasi masuk (guest). Default 'fade'; 'none' = tanpa animasi. */
  entrance?: EntranceKind;
  children: ReactNode;
}

/**
 * Pembungkus tiap blok. Default: flow (ikut aliran vertikal).
 * Jika `position.mode === 'absolute'`, elemen dilepas dari flow
 * (ala Elementor Advanced → Positioning → Absolute).
 */
export function BlockShell({ position, entrance = 'fade', children }: BlockShellProps) {
  const variant = entrance && entrance !== 'none' ? VARIANTS[entrance] : null;

  const inner = variant ? (
    <motion.div
      variants={variant}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  ) : (
    <>{children}</>
  );

  if (position?.mode === 'absolute') {
    return (
      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: position.width && position.width !== 'auto' ? position.width : undefined,
          transform: position.rotation ? `rotate(${position.rotation}deg)` : undefined,
          zIndex: position.zIndex ?? 0
        }}
      >
        {inner}
      </div>
    );
  }

  return <div className="relative w-full">{inner}</div>;
}
