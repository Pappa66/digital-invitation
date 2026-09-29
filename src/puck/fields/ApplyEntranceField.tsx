'use client';

import { useState } from 'react';
import { createUsePuck } from '@puckeditor/core';
import type { config } from '@/puck/config';

const usePuckStore = createUsePuck<typeof config>();

const OPTIONS = [
  { label: 'Fade', value: 'fade' },
  { label: 'Slide naik', value: 'slide' },
  { label: 'Slide turun', value: 'slideDown' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Flip', value: 'flip' },
  { label: 'Parallax (scroll)', value: 'parallax' },
  { label: 'Tanpa animasi', value: 'none' }
];

/** Field: pilih satu animasi lalu terapkan ke SEMUA section sekaligus. */
export default function ApplyEntranceField({ field }: { field?: { label?: string } }) {
  const dispatch = usePuckStore((s) => s.dispatch);
  const [val, setVal] = useState('fade');
  const [done, setDone] = useState(false);

  function applyAll() {
    dispatch({
      type: 'setData',
      data: (prev) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (prev.content as any[]).map((item) => ({ ...item, props: { ...item.props, entrance: val } }));
        return { ...prev, content };
      }
    });
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  }

  return (
    <div className="flex flex-col gap-2">
      {field?.label ? <span className="text-xs font-medium text-[#6b5f4d]">{field.label}</span> : null}
      <div className="flex items-center gap-2">
        <select value={val} onChange={(e) => setVal(e.target.value)} className="min-w-0 flex-1 rounded border border-[#ddd0bb] px-2 py-1 text-xs">
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="button" onClick={applyAll} className="shrink-0 rounded border border-[#c9a45c] bg-white px-2.5 py-1 text-xs font-medium text-[#8a6d2f] hover:bg-[#c9a45c]/10">
          {done ? 'Diterapkan!' : 'Terapkan ke semua'}
        </button>
      </div>
    </div>
  );
}
