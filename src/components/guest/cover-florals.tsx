'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * 4 Floral corner SVGs untuk cover modal — diletakkan di 4 sudut.
 * Setiap corner punya gaya berbeda: mawar, melati, anggrek, daun tropis.
 */
function FloralCorner({ position, color }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; color: string }) {
  const transforms: Record<string, string> = {
    'top-left': '',
    'top-right': 'scaleX(-1)',
    'bottom-left': 'scaleY(-1)',
    'bottom-right': 'scale(-1,-1)'
  };
  const positions: Record<string, React.CSSProperties> = {
    'top-left': { top: 0, left: 0 },
    'top-right': { top: 0, right: 0 },
    'bottom-left': { bottom: 0, left: 0 },
    'bottom-right': { bottom: 0, right: 0 }
  };

return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-20"
      style={{ ...positions[position], transform: transforms[position] }}
    >
      <svg width="112" height="96" viewBox="0 0 120 100" fill="none" style={{ opacity: 0.45 }}>
        {/* Main curve */}
        <path
          d="M0 90C0 40 25 10 60 10h60"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity={0.6}
        />
        <path
          d="M0 90c0-35 18-65 50-75h40"
          stroke={color}
          strokeWidth="1"
          strokeLinecap="round"
          opacity={0.35}
        />

        {/* Rose flower 1 - large */}
        <circle cx="16" cy="68" r="7.5" stroke={color} strokeWidth="1.1" opacity={0.6} />
        <path d="M12 64c2-4 6-6 8-2-4 0-6 2-8 2Z" stroke={color} strokeWidth="0.8" opacity={0.7} />
        <path d="M22 64c-2-4-6-6-8-2 4 0 6 2 8 2Z" stroke={color} strokeWidth="0.8" opacity={0.7} />
        <path d="M12 72c2 4 6 6 8 2-4 0-6-2-8-2Z" stroke={color} strokeWidth="0.8" opacity={0.7} />
        <path d="M22 72c-2 4-6 6-8 2 4 0 6-2 8-2Z" stroke={color} strokeWidth="0.8" opacity={0.7} />
        <circle cx="16" cy="68" r="3" fill={color} opacity={0.5} />

        {/* Rose flower 2 - medium */}
        <circle cx="40" cy="44" r="6" stroke={color} strokeWidth="1" opacity={0.55} />
        <path d="M37 41c1-3 4-4 6-1-3 0-5 1-6 1Z" stroke={color} strokeWidth="0.7" opacity={0.65} />
        <path d="M45 41c-1-3-4-4-6-1 3 0 5 1 6 1Z" stroke={color} strokeWidth="0.7" opacity={0.65} />
        <circle cx="40" cy="44" r="2" fill={color} opacity={0.45} />

        {/* Rose flower 3 - small */}
        <circle cx="66" cy="24" r="4.5" stroke={color} strokeWidth="0.9" opacity={0.5} />
        <circle cx="66" cy="24" r="1.8" fill={color} opacity={0.4} />

        {/* Leaves */}
        <ellipse cx="28" cy="78" rx="6" ry="2.5" transform="rotate(-35 28 78)" stroke={color} strokeWidth="0.8" opacity={0.4} />
        <ellipse cx="52" cy="56" rx="5" ry="2" transform="rotate(-45 52 56)" stroke={color} strokeWidth="0.7" opacity={0.35} />
        <ellipse cx="78" cy="34" rx="4.5" ry="1.8" transform="rotate(-50 78 34)" stroke={color} strokeWidth="0.7" opacity={0.3} />

        {/* Small buds */}
        <circle cx="86" cy="14" r="2" stroke={color} strokeWidth="0.6" opacity={0.35} />
        <circle cx="96" cy="10" r="1.5" stroke={color} strokeWidth="0.5" opacity={0.3} />
      </svg>
    </div>
  );
}

/**
 * Floating petal animation — 10 kelopak jatuh perlahan.
 * Bentuk: oval, heart, round — beragam ukuran & delay.
 */
interface Petal {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'oval' | 'heart' | 'round';
}

function PetalSvg({ shape, size, color }: { shape: string; size: number; color: string }) {
  if (shape === 'heart') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <path
          d="M8 14C8 14 1 9 1 5C1 3 3 1 5 1C6.5 1 7.5 2 8 3C8.5 2 9.5 1 11 1C13 1 15 3 15 5C15 9 8 14 8 14Z"
          fill={color}
          opacity={0.5}
        />
      </svg>
    );
  }
  if (shape === 'round') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6" fill={color} opacity={0.4} />
      </svg>
    );
  }
  // oval
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 12 17" fill="none">
      <ellipse cx="6" cy="8.5" rx="5" ry="7.5" fill={color} opacity={0.45} />
    </svg>
  );
}

export function FloatingPetals({ color }: { color: string }) {
  const petals: Petal[] = useMemo(() => {
    const shapes: Petal['shape'][] = ['oval', 'heart', 'round'];
    // Deterministic pseudo-random values based on index
    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed * 9301 + 49297) * 49297;
      return x - Math.floor(x);
    };
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${8 + pseudoRandom(i * 7 + 1) * 84}%`,
      size: 10 + pseudoRandom(i * 13 + 3) * 8,
      delay: pseudoRandom(i * 19 + 5) * 6,
      duration: 5 + pseudoRandom(i * 23 + 7) * 4,
      rotation: pseudoRandom(i * 29 + 11) * 360,
      shape: shapes[i % 3]
    }));
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.left, top: '-20px' }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, Math.sin(p.id) * 30, 0],
            rotate: [p.rotation, p.rotation + 180, p.rotation + 360],
            opacity: [0, 0.7, 0.7, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear'
          }}
        >
          <PetalSvg shape={p.shape} size={p.size} color={color} />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Decorative frame overlay — border halus dengan floral accents di sudut.
 */
export function DecorativeFrame({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-4 z-20" aria-hidden>
      <svg width="100%" height="100%" viewBox="0 0 400 700" fill="none" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
        {/* Outer frame */}
        <rect x="8" y="8" width="384" height="684" rx="16" stroke={color} strokeWidth="1" />
        {/* Inner frame */}
        <rect x="16" y="16" width="368" height="668" rx="12" stroke={color} strokeWidth="0.5" strokeDasharray="4 4" />
        {/* Top center ornament */}
        <circle cx="200" cy="12" r="3" fill={color} />
        <line x1="170" y1="12" x2="192" y2="12" stroke={color} strokeWidth="0.5" />
        <line x1="208" y1="12" x2="230" y2="12" stroke={color} strokeWidth="0.5" />
        {/* Bottom center ornament */}
        <circle cx="200" cy="688" r="3" fill={color} />
        <line x1="170" y1="688" x2="192" y2="688" stroke={color} strokeWidth="0.5" />
        <line x1="208" y1="688" x2="230" y2="688" stroke={color} strokeWidth="0.5" />
        {/* Left center ornament */}
        <circle cx="12" cy="350" r="3" fill={color} />
        <line x1="12" y1="320" x2="12" y2="342" stroke={color} strokeWidth="0.5" />
        <line x1="12" y1="358" x2="12" y2="380" stroke={color} strokeWidth="0.5" />
        {/* Right center ornament */}
        <circle cx="388" cy="350" r="3" fill={color} />
        <line x1="388" y1="320" x2="388" y2="342" stroke={color} strokeWidth="0.5" />
        <line x1="388" y1="358" x2="388" y2="380" stroke={color} strokeWidth="0.5" />
      </svg>
    </div>
  );
}

export { FloralCorner };
