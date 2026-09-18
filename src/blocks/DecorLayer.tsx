'use client';

import { motion, type TargetAndTransition } from 'framer-motion';
import type { DecorItem, DecorLoop } from '@/puck/types';
import LottiePlayer from './LottiePlayer';

const LOOP: Record<DecorLoop, TargetAndTransition | undefined> = {
  none: undefined,
  float: { y: [0, -10, 0] },
  pulse: { scale: [1, 1.06, 1] },
  spin: { rotate: [0, 360] }
};

/** Layer dekor bebas posisi + animasi loop. Ditumpuk di atas konten undangan. */
export default function DecorLayer({ decor }: { decor?: DecorItem[] }) {
  const items = (decor ?? []).filter((d) => d.imageUrl);
  if (items.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {items.map((d) => {
        const scaleX = d.flipX ? -1 : 1;
        const scaleY = d.flipY ? -1 : 1;
        const baseStyle: React.CSSProperties = {
          position: 'absolute',
          left: d.x,
          top: d.y,
          width: d.width,
          opacity: d.opacity ?? 1,
          zIndex: d.zIndex ?? 1,
          transform: `rotate(${d.rotation ?? 0}deg) scale(${scaleX}, ${scaleY})`
        };

        if (d.kind === 'lottie') {
          return (
            <div key={d.id} style={baseStyle}>
              <LottiePlayer src={d.imageUrl} style={{ width: '100%', height: 'auto' }} />
            </div>
          );
        }

        return (
          <motion.img
            key={d.id}
            src={d.imageUrl}
            alt=""
            style={{
              position: 'absolute',
              left: d.x,
              top: d.y,
              width: d.width,
              opacity: d.opacity ?? 1,
              zIndex: d.zIndex ?? 1,
              rotate: d.rotation ?? 0,
              scaleX,
              scaleY
            }}
            animate={LOOP[d.loop ?? 'none']}
            transition={d.loop && d.loop !== 'none' ? { duration: d.loop === 'spin' ? 8 : 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
          />
        );
      })}
    </div>
  );
}
