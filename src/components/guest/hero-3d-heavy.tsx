// @ts-nocheck
'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

/** Heavy: arch + pillars + floating hearts — lazy, hanya dimuat bila variant heavy */
function GoldenArch() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.06;
  });
  return (
    <group ref={ref} position={[0, -0.2, -1.5]}>
      {/* Lengkung */}
      <mesh position={[0, 0.9, 0]}>
        <torusGeometry args={[1.1, 0.04, 16, 48, Math.PI]} />
        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Pilar kiri/kanan */}
      <mesh position={[-1.1, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
        <meshStandardMaterial color="#8a6d2f" />
      </mesh>
      <mesh position={[1.1, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 1.8, 16]} />
        <meshStandardMaterial color="#8a6d2f" />
      </mesh>
      {/* Hati melayang */}
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.6}>
        <mesh position={[0, 0.4, 0.4]} scale={0.18}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#c9a45c" transparent opacity={0.9} />
        </mesh>
      </Float>
    </group>
  );
}

export default function HeroHeavy3D({ mode = 'arch' }: { mode?: 'arch' | 'hearts' }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.2, 3.2]} fov={52} />
        <ambientLight intensity={0.9} />
        <directionalLight position={[3, 5, 4]} intensity={0.7} />
        <pointLight position={[-2, 2, 2]} intensity={0.5} color="#ffd700" />
        <GoldenArch />
        {/* Kabut halus */}
        <fog attach="fog" args={['#faf6ef', 4, 9]} />
      </Canvas>
      {/* Vignette agar teks tetap terbaca */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />
    </div>
  );
}
