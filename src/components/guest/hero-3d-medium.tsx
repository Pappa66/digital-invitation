// @ts-nocheck
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/** Titik emas melayang — efisien (200 points, 60fps) */
function GoldDust() {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    return arr;
  }, []);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.04;
  });
  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#d4af37" size={0.035} sizeAttenuation depthWrite={false} opacity={0.65} />
    </Points>
  );
}

function FloatingRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.12;
      ref.current.rotation.y += delta * 0.08;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.6, 0.02, 12, 32]} />
      <meshStandardMaterial color="#c9a45c" transparent opacity={0.22} />
    </mesh>
  );
}

export default function HeroMedium3D({ mode = 'particles' }: { mode?: 'particles' | 'rings' }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 4], fov: 55 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[2, 4, 2]} intensity={0.6} />
        {mode === 'particles' && <GoldDust />}
        {mode === 'rings' && (
          <>
            <FloatingRing position={[-1.8, 1.2, -1]} scale={0.8} />
            <FloatingRing position={[1.6, -1.0, -1.5]} scale={1.1} />
          </>
        )}
        {mode === 'particles' && <FloatingRing position={[0, 0, -2]} scale={0.6} />}
      </Canvas>
    </div>
  );
}
