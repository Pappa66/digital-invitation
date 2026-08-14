'use client';

import { createContext, useContext } from 'react';

/** Posisi sub-elemen di dalam blok (px, relatif kiri-atas blok). Map: nama elemen -> offset. */
export type InnerPositions = Record<string, { x: number; y: number }>;

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