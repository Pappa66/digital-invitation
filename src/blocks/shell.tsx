import type { CSSProperties, ReactNode } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { BlockStyleLite, EntranceKind, Position } from '@/puck/types';

const VARIANTS: Record<Exclude<EntranceKind, 'none'>, Variants> = {
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  slideUp: { hidden: { opacity: 0, y: -24 }, show: { opacity: 1, y: 0 } },
  slideDown: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } },
  zoom: { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1 } },
  flip: { hidden: { opacity: 0, rotateX: 45 }, show: { opacity: 1, rotateX: 0 } }
};

interface BlockShellProps {
  position?: Position;
  /** Animasi masuk (guest). Default 'fade'; 'none' = tanpa animasi. */
  entrance?: EntranceKind;
  /** Override warna/font/latar per-bagian. */
  blockStyle?: BlockStyleLite;
  children: ReactNode;
}

/** CSS var override dari blockStyle — menurun ke elemen anak. */
function styleVars(blockStyle?: BlockStyleLite): CSSProperties {
  const vars: Record<string, string> = {};
  if (blockStyle?.textColor) vars['--color-text'] = blockStyle.textColor;
  if (blockStyle?.accentColor) vars['--color-primary'] = blockStyle.accentColor;
  if (blockStyle?.bgColor) vars['--color-background'] = blockStyle.bgColor;
  if (blockStyle?.headingFont) vars['--font-heading'] = `'${blockStyle.headingFont}', serif`;
  if (blockStyle?.bgImage || blockStyle?.bgGradient) vars['--color-background'] = 'transparent';
  return vars as CSSProperties;
}

/**
 * Pembungkus tiap blok. Default: flow; `absolute` = lepas dari aliran.
 * Override warna/font/latar per-bagian lewat `blockStyle`.
 */
export function BlockShell({ position, entrance = 'fade', blockStyle, children }: BlockShellProps) {
  const variant = entrance && entrance !== 'none' ? VARIANTS[entrance] : null;
  const hasBgMedia = Boolean(blockStyle?.bgImage || blockStyle?.bgGradient);

  const bgStyle: CSSProperties = hasBgMedia
    ? {
        backgroundImage: blockStyle?.bgGradient || (blockStyle?.bgImage ? `url(${blockStyle.bgImage})` : undefined),
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  const animated = variant ? (
    <motion.div variants={variant} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
      {children}
    </motion.div>
  ) : (
    <>{children}</>
  );

  const inner = hasBgMedia ? (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 z-0" style={{ background: `rgba(0,0,0,${blockStyle?.bgOverlay ?? 0})` }} />
      <div className="relative z-10">{animated}</div>
    </div>
  ) : (
    animated
  );

  const base: CSSProperties = { ...styleVars(blockStyle), ...bgStyle };

  if (position?.mode === 'absolute') {
    return (
      <div
        style={{
          ...base,
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
    <div className="relative w-full" style={base}>
      {inner}
    </div>
  );
}
