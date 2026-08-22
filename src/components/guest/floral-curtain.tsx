'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

interface FloralCurtainProps {
  /** true = menutup (membingkai layar), false = terbuka (tirai menyingkir). */
  open: boolean;
  primary: string;
  secondary: string;
  /** Warna latar gelap di balik tirai (agar bunga menonjol). */
  backdrop?: string;
  /** Foto redup di balik tirai (opsional). */
  image?: string;
}

/** Sekuntum mawar stylized (currentColor + fill emas). */
function Rose({ x, y, r, color, fill }: { x: number; y: number; r: number; color: string; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx={0} cy={-r * 0.5} rx={r * 0.5} ry={r * 0.85} fill={fill} opacity={0.85} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.95} fill={fill} />
      <circle r={r * 0.4} fill={color} opacity={0.9} />
    </g>
  );
}

/** Selembar daun. */
function Leaf({ x, y, rot, fill }: { x: number; y: number; rot: number; fill: string }) {
  return (
    <path
      d="M0 0 C 20 -12, 38 -4, 46 16 C 28 20, 10 16, 0 0 Z"
      transform={`translate(${x} ${y}) rotate(${rot})`}
      fill={fill}
      opacity={0.82}
    />
  );
}

/** Satu rangkaian bunga vertikal (vine) dalam viewBox 220 x 1080. */
function FloralVine({ color, fill, leaf }: { color: string; fill: string; leaf: string }) {
  return (
    <svg viewBox="0 0 220 1080" preserveAspectRatio="xMidYMin meet" className="h-full w-full" aria-hidden>
      {/* Tangkai meliuk */}
      <path
        d="M110 -20 C 70 160, 160 320, 100 520 S 150 820, 110 1100"
        stroke={color}
        strokeWidth={5}
        fill="none"
        opacity={0.7}
      />
      {/* Daun */}
      <Leaf x={92} y={120} rot={-30} fill={leaf} />
      <Leaf x={128} y={250} rot={150} fill={leaf} />
      <Leaf x={86} y={380} rot={-40} fill={leaf} />
      <Leaf x={134} y={520} rot={160} fill={leaf} />
      <Leaf x={96} y={660} rot={-25} fill={leaf} />
      <Leaf x={130} y={800} rot={150} fill={leaf} />
      <Leaf x={100} y={940} rot={-35} fill={leaf} />
      {/* Bunga */}
      <Rose x={104} y={150} r={34} color={color} fill={fill} />
      <Rose x={128} y={430} r={28} color={color} fill={fill} />
      <Rose x={96} y={700} r={32} color={color} fill={fill} />
      <Rose x={120} y={980} r={26} color={color} fill={fill} />
    </svg>
  );
}

/** Satu sisi tirai (kiri/kanan) — beberapa lapisan bunga dengan kedalaman (Z). */
function CurtainSide({ side, open, primary, secondary, leaf }: { side: 'left' | 'right'; open: boolean; primary: string; secondary: string; leaf: string }) {
  const isLeft = side === 'left';
  const dir = isLeft ? -1 : 1;
  const layers = [
    { z: -120, scale: 1.25, opacity: 0.35, blur: 6 },
    { z: -60, scale: 1.1, opacity: 0.6, blur: 2 },
    { z: 0, scale: 1, opacity: 1, blur: 0 }
  ];
  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{
        [isLeft ? 'left' : 'right']: 0,
        width: '34%',
        transformStyle: 'preserve-3d',
        transformOrigin: isLeft ? 'left center' : 'right center'
      }}
      initial={false}
      animate={{
        x: open ? 0 : `${dir * 115}%`,
        rotateY: open ? 0 : dir * 18,
        opacity: open ? 1 : 0
      }}
      transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
        {layers.map((l, i) => (
          <div
            key={i}
            className="absolute inset-0 flex"
            style={{
              transform: `translateZ(${l.z}px) scale(${l.scale})`,
              opacity: l.opacity,
              filter: l.blur ? `blur(${l.blur}px)` : undefined,
              justifyContent: isLeft ? 'flex-start' : 'flex-end'
            }}
          >
            <div className={`h-full ${isLeft ? 'scale-x-[-1]' : ''}`} style={{ width: '70%' }}>
              <FloralVine color={primary} fill={secondary} leaf={leaf} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/**
 * Tirai bunga 3D — entrance khas "ruangan": rangkaian bunga di kiri & kanan
 * dengan kedalaman (multi-layer Z + parallax ikut gerak kursor), lalu menyingkir
 * seperti gorden saat undangan dibuka. Bersifat dekoratif (aria-hidden).
 */
export default function FloralCurtain({ open, primary, secondary, backdrop = '#2A2018', image }: FloralCurtainProps) {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) return;
    function onMove(e: PointerEvent) {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2;
        const ny = (e.clientY / window.innerHeight - 0.5) * 2;
        setTilt({ x: nx * 3.2, y: -ny * 2.4 });
        frame.current = null;
      });
    }
    window.addEventListener('pointermove', onMove);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [reduce]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden
      style={{ perspective: '1300px', background: `radial-gradient(120% 80% at 50% 45%, ${backdrop} 0%, #1c150f 100%)` }}
    >
      {image && (
        <div className="absolute inset-0 z-0">
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
          <div className="absolute inset-0" style={{ background: 'rgba(20,15,10,0.55)' }} />
        </div>
      )}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: 'preserve-3d',
          transform: reduce ? undefined : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: 'transform 0.25s ease-out'
        }}
      >
        {/* Cahaya hangat di tengah ruangan */}
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 50% at 50% 48%, ${primary}22 0%, transparent 60%)` }}
        />
        <CurtainSide side="left" open={open} primary={primary} secondary={secondary} leaf={secondary} />
        <CurtainSide side="right" open={open} primary={primary} secondary={secondary} leaf={secondary} />
      </div>
    </div>
  );
}
