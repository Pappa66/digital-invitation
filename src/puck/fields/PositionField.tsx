'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { Position } from '@/puck/types';

// react-moveable mengakses DOM → hanya di client.
const Moveable = dynamic(() => import('react-moveable'), { ssr: false });

interface PositionFieldProps {
  /** Nilai field (dari Puck). */
  value: Position;
  /** Menulis balik ke data Puck. */
  onChange: (value: Position) => void;
  /** Metadata field Puck (untuk label). */
  field?: { label?: string };
  readOnly?: boolean;
}

const CANVAS_W = 236;
const CANVAS_H = 140;

/**
 * Custom field "Posisi": toggle Absolute + drag bebas (react-moveable)
 * pada mini-kanvas. Meniru Elementor → Advanced → Positioning → Absolute.
 */
export default function PositionField({ value, onChange, field, readOnly }: PositionFieldProps) {
  const pos: Position = value ?? { mode: 'flow', x: 16, y: 16 };
  const [target, setTarget] = useState<HTMLDivElement | null>(null);
  const absolute = pos.mode === 'absolute';

  const set = (patch: Partial<Position>) => onChange({ ...pos, ...patch });

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-xs font-medium text-[#6b5f4d]">
        <input
          type="checkbox"
          checked={absolute}
          disabled={readOnly}
          onChange={(e) => set({ mode: e.target.checked ? 'absolute' : 'flow' })}
        />
        Absolute position{field?.label ? ` — ${field.label}` : ''}
      </label>

      {absolute ? (
        <>
          <div
            className="relative overflow-hidden rounded-md border border-[#e7ddcc]"
            style={{
              width: CANVAS_W,
              height: CANVAS_H,
              background: 'repeating-conic-gradient(#f1ece1 0% 25%, #ffffff 0% 50%) 50% / 16px 16px'
            }}
          >
            <div
              ref={setTarget}
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y,
                width: 80,
                height: 44,
                borderRadius: 6,
                background: '#c9a45c',
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
                cursor: readOnly ? 'default' : 'move'
              }}
            />
          </div>

          {target ? (
            <Moveable
              target={target}
              draggable={!readOnly}
              onDrag={({ left, top }) => set({ x: Math.round(left), y: Math.round(top) })}
            />
          ) : null}

          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-1 text-[11px] text-[#6b5f4d]">
              X
              <input
                type="number"
                value={pos.x}
                disabled={readOnly}
                onChange={(e) => set({ x: Number(e.target.value) })}
                className="w-full rounded border border-[#ddd0bb] px-1.5 py-1"
              />
            </label>
            <label className="flex flex-1 items-center gap-1 text-[11px] text-[#6b5f4d]">
              Y
              <input
                type="number"
                value={pos.y}
                disabled={readOnly}
                onChange={(e) => set({ y: Number(e.target.value) })}
                className="w-full rounded border border-[#ddd0bb] px-1.5 py-1"
              />
            </label>
            <label className="flex flex-1 items-center gap-1 text-[11px] text-[#6b5f4d]">
              Rotasi
              <input
                type="number"
                value={pos.rotation ?? 0}
                disabled={readOnly}
                onChange={(e) => set({ rotation: Number(e.target.value) })}
                className="w-full rounded border border-[#ddd0bb] px-1.5 py-1"
              />
            </label>
          </div>
        </>
      ) : (
        <p className="text-[11px] leading-relaxed text-[#a09383]">
          Default: mengikuti aliran (flow). Aktifkan untuk melepas elemen dari aliran dan menggesernya bebas.
        </p>
      )}
    </div>
  );
}
