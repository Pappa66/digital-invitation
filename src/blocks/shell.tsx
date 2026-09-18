'use client';

import type { ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { BlockStyleLite, EntranceKind, Position } from '@/puck/types';

const VARIANTS: Record<Exclude<EntranceKind, 'none'>, Variants> = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } }
};

interface BlockShellProps {
  position?: Position;
  /** Animasi masuk (guest). Default 'fade'; 'none' = tanpa animasi. */
  entrance?: EntranceKind;
  /** Override warna per-bagian (teks/aksen/latar). */
  blockStyle?: BlockStyleLite;
  children: ReactNode;
}

/** CSS var override dari blockStyle — menurun ke elemen anak. */
function styleVars(blockStyle?: BlockStyleLite): React.CSSProperties {
  const vars: Record<string, string> = {};
  if (blockStyle?.textColor) vars['--color-text'] = blockStyle.textColor;
  if (blockStyle?.accentColor) vars['--color-primary'] = blockStyle.accentColor;
  if (blockStyle?.bgColor) vars['--color-background'] = blockStyle.bgColor;
  return vars as React.CSSProperties;
}

/**
 * Pembungkus tiap blok. Default: flow (ikut aliran vertikal).
 * Jika `position.mode === 'absolute'`, elemen dilepas dari flow
 * (ala Elementor Advanced → Positioning → Absolute).
 */
export function BlockShell({ position, entrance = 'fade', blockStyle, children }: BlockShellProps) {
  const variant = entrance && entrance !== 'none' ? VARIANTS[entrance] : null;
  const vars = styleVars(blockStyle);

  const inner = variant ? (
    <motion.div variants={variant} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
      {children}
    </motion.div>
  ) : (
    <>{children}</>
  );

  if (position?.mode === 'absolute') {
    return (
      <div
        style={{
          ...vars,
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

  return (
    <div className="relative w-full" style={vars}>
      {inner}
    </div>
  );
}
