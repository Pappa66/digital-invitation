'use client';

import { createContext, useContext } from 'react';

/** Posisi sub-elemen di dalam blok (px, relatif kiri-atas blok). Map: nama elemen -> offset + warna. */
export type InnerPositions = Record<string, { x: number; y: number; color?: string }>;

const InnerContext = createContext<InnerPositions | undefined>(undefined);

/** Provider posisi inner milik satu blok. Nilai boleh undefined (tidak ada offset). */
export const InnerProvider = InnerContext.Provider;

/** Baca peta posisi inner blok aktif. Undefined bila tidak ada offset tersimpan. */
export function useInnerPositions(): InnerPositions | undefined {
  return useContext(InnerContext);
}

/** Ambil posisi {x,y} satu elemen inner (default 0,0 saat belum digeser). */
export function innerOffset(inner: InnerPositions | undefined, name: string): { x: number; y: number } {
  return inner?.[name] ?? { x: 0, y: 0 };
}

/** Ambil warna kustom satu elemen inner (undefined jika tidak ada). */
export function innerColor(inner: InnerPositions | undefined, name: string): string | undefined {
  return inner?.[name]?.color;
}

/** Wrapper sub-elemen di dalam blok yang bisa digeser bebas + warna kustom. */
export function Inner({ name, className, children }: { name: string; className?: string; children: React.ReactNode }) {
  const inner = useInnerPositions();
  const pos = inner?.[name];
  return (
    <div
      data-inner={name}
      className={className}
      style={{
        ...(pos?.x || pos?.y ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : {}),
        ...(pos?.color ? { color: pos.color } : {})
      }}
    >
      {children}
    </div>
  );
}