'use client';

import type { DecorItem, DecorLoop } from '@/puck/types';
import { newDecorItem, removeDecorItem, updateDecorItem } from '@/puck/lib/decor-utils';
import AssetField from './AssetField';

const LOOP_OPTIONS: { label: string; value: DecorLoop }[] = [
  { label: 'Tanpa animasi', value: 'none' },
  { label: 'Mengambang', value: 'float' },
  { label: 'Denyut', value: 'pulse' },
  { label: 'Berputar', value: 'spin' }
];

interface DecorFieldProps {
  value?: DecorItem[];
  onChange: (value: DecorItem[]) => void;
  readOnly?: boolean;
}

const num = (v: number | undefined, fallback = 0) => (typeof v === 'number' ? v : fallback);

/** Custom field dekor kanvas: unggah PNG transparan, atur posisi/ukuran/animasi loop. */
export default function DecorField({ value, onChange, readOnly }: DecorFieldProps) {
  const list = value ?? [];
  const set = (next: DecorItem[]) => onChange(next);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={readOnly}
        onClick={() => set([...list, newDecorItem()])}
        className="rounded border border-dashed border-[#c9a45c] px-2 py-1.5 text-xs font-medium text-[#8a6d2f] hover:bg-[#c9a45c]/10 disabled:opacity-60"
      >
        + Tambah dekor
      </button>

      {list.length === 0 ? <p className="text-[11px] text-[#a09383]">Belum ada dekor. Tambahkan PNG transparan (mis. bunga, daun).</p> : null}

      {list.map((item, i) => (
        <div key={item.id} className="flex flex-col gap-2 rounded-md border border-[#eee4cf] bg-white/60 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#6b5f4d]">Dekor #{i + 1}</span>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => set(removeDecorItem(list, item.id))}
              className="text-[11px] text-red-500 hover:underline disabled:opacity-60"
            >
              Hapus
            </button>
          </div>

          <AssetField
            value={item.imageUrl}
            onChange={(url) => set(updateDecorItem(list, item.id, { imageUrl: url }))}
            field={{ label: 'Gambar dekor' }}
          />

          <label className="flex flex-col text-[10px] text-[#6b5f4d]">
            Tipe dekor
            <select
              disabled={readOnly}
              value={item.kind ?? 'image'}
              onChange={(e) => set(updateDecorItem(list, item.id, { kind: e.target.value as 'image' | 'lottie' }))}
              className="w-full rounded border border-[#ddd0bb] px-1.5 py-1 text-xs"
            >
              <option value="image">Gambar (PNG/SVG)</option>
              <option value="lottie">Lottie (JSON animasi)</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                ['X', 'x', 1],
                ['Y', 'y', 1],
                ['Lebar', 'width', 1],
                ['Rotasi', 'rotation', 1],
                ['Opacity', 'opacity', 0.05],
                ['Z', 'zIndex', 1]
              ] as const
            ).map(([label, key, step]) => (
              <label key={key} className="flex flex-col text-[10px] text-[#6b5f4d]">
                {label}
                <input
                  type="number"
                  step={step}
                  disabled={readOnly}
                  value={num(item[key])}
                  onChange={(e) => set(updateDecorItem(list, item.id, { [key]: Number(e.target.value) }))}
                  className="w-full rounded border border-[#ddd0bb] px-1.5 py-1"
                />
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#6b5f4d]">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={!!item.flipX}
                onChange={(e) => set(updateDecorItem(list, item.id, { flipX: e.target.checked }))}
              />
              Balik H
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={!!item.flipY}
                onChange={(e) => set(updateDecorItem(list, item.id, { flipY: e.target.checked }))}
              />
              Balik V
            </label>
          </div>

          <label className="flex flex-col text-[10px] text-[#6b5f4d]">
            Animasi
            <select
              disabled={readOnly}
              value={item.loop ?? 'none'}
              onChange={(e) => set(updateDecorItem(list, item.id, { loop: e.target.value as DecorLoop }))}
              className="w-full rounded border border-[#ddd0bb] px-1.5 py-1 text-xs"
            >
              {LOOP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      ))}
    </div>
  );
}
