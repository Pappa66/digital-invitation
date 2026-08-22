'use client';

import { Suspense, Component, type ReactNode, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  url: string;
  primary: string;
}

function Model({ url, primary }: ModelProps) {
  const { scene } = useGLTF(url);
  const ref = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(primary),
          roughness: 0.55,
          metalness: 0.15,
          side: THREE.DoubleSide
        });
      }
    });
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    return clone;
  }, [scene, primary]);

  useFrame((_, dt) => {
    ref.rotation.y += dt * 0.35;
  });

  return <primitive object={ref} scale={1.6} />;
}

function Scene({ url, primary }: ModelProps) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color={primary} />
      <directionalLight position={[-3, -2, -4]} intensity={0.4} />
      <Suspense fallback={null}>
        <Model url={url} primary={primary} />
      </Suspense>
    </Canvas>
  );
}

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Layer 3D budaya: model GLB dari Supabase Storage, berputar halus.
 *  Aman: bila GLB belum ada/error, Boundary mengembalikan null (fallback SVG). */
export default function Cultural3DLayer({ path, primary, supabaseUrl }: { path: string; primary: string; supabaseUrl?: string }) {
  const url = path.startsWith('http') ? path : `${supabaseUrl}/storage/v1/object/public/invitation-assets/${path}`;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 opacity-90" aria-hidden>
      <Boundary>
        <Scene url={url} primary={primary} />
      </Boundary>
    </div>
  );
}
