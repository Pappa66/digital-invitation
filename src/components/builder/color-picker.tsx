'use client';

import { useState } from 'react';

const PRESET_PALETTES: string[][] = [
  ['#D4AF37', '#8A6D2F', '#FAF6EF', '#4A443C'],
  ['#7C9885', '#A9B7A6', '#F7F6F2', '#3E4A43'],
  ['#046A38', '#B5A27C', '#F7F5EF', '#2E3B34'],
  ['#1F3A5F', '#C9A227', '#F8F9FB', '#26364C'],
  ['#111827', '#6B7280', '#FFFFFF', '#111827'],
  ['#E8A0B4', '#F3C7D3', '#FFFBF8', '#5D4A52'],
  ['#B5651D', '#C9A28A', '#FBF6F0', '#4A3B2E'],
  ['#2F5D50', '#C77B4E', '#F5F0E8', '#37423B'],
  ['#324F43', '#A9C5B4', '#F4F6F4', '#2E3B35'],
  ['#7FB5A8', '#F6C6A8', '#FFFDF8', '#4E5B57'],
  ['#C9A227', '#2A2A2A', '#1A1A1A', '#EDEDED'],
  ['#9A8C98', '#4A4E69', '#F2E9E4', '#22223B'],
  ['#3D5A80', '#EE6C4D', '#E0FBFC', '#293241'],
  ['#606C38', '#DDA15E', '#FEFAE0', '#283618'],
  ['#B0413E', '#F6D365', '#FFF9F4', '#3D2C2E']
];

const PALETTE_NAMES = [
  'Elegant Gold', 'Sage Garden', 'Emerald Khaki', 'Navy Classic', 'Monochrome',
  'Blush', 'Boho Earth', 'Bali', 'Forest', 'Pastel', 'Dark Gold', 'Muted Mauve',
  'Oceanic', 'Olive', 'Terracotta'
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {label && <label className="mb-1 block text-xs font-medium text-[#4a443c]">{label}</label>}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-9 shrink-0 rounded-md border border-[#e0d6c2]"
          style={{ background: value }}
          aria-label="Buka color picker"
        />
        <div className="flex flex-1 items-center rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-7 w-7 cursor-pointer border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v);
            }}
            className="w-full bg-transparent px-2 py-1.5 text-xs text-[#4a443c] outline-none"
          />
        </div>
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-50 w-64 rounded-lg border border-[#e7ddcc] bg-white p-3 shadow-2xl">
            <p className="mb-2 text-xs font-medium text-[#8a7a66]">Preset Palettes</p>
            <div className="space-y-2">
              {PRESET_PALETTES.map((palette, i) => (
                <div key={i} className="group flex items-center justify-between">
                  <div className="flex gap-1">
                    {palette.map((c, j) => (
                      <button
                        key={j}
                        onClick={() => onChange(c)}
                        className={`h-6 w-6 rounded-full border border-black/30 transition-transform hover:scale-110 ${value === c ? 'ring-2 ring-[#c9a45c] ring-offset-1 ring-offset-white' : ''}`}
                        style={{ background: c }}
                        title={c}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8a7a66]">{PALETTE_NAMES[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}