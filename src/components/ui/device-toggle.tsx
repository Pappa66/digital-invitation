'use client';

import { useRef } from 'react';
import { Smartphone, Monitor, Tablet } from 'lucide-react';

export type Device = 'mobile' | 'tablet' | 'desktop';

/**
 * Lebar koordinat desain blok (mode bebas) — identik dengan lebar konten
 * output publik (`CANVAS_W` di GuestRenderer). Jangan diubah tanpa
 * menyelaraskan GuestRenderer.
 */
export const DESIGN_WIDTH = 420;

/** Lebar kanvas preview per perangkat (px), dipakai untuk kalkulasi layout. */
export const PREVIEW_WIDTHS: Record<Device, number> = {
  // Sama dengan lebar output publik: GuestRenderer memakai max-w-[430px].
  mobile: 430,
  // Preview "lebih luas" saja — output publik tetap selebar ponsel.
  tablet: 768,
  // Perkiraan layar lebar; output publik membuka max-w-full di desktop.
  desktop: 900
};

/** Nilai CSS `width` untuk kotak kanvas preview. */
export const PREVIEW_CSS_WIDTHS: Record<Device, string> = {
  mobile: `${PREVIEW_WIDTHS.mobile}px`,
  tablet: `${PREVIEW_WIDTHS.tablet}px`,
  desktop: '100%'
};

const DEVICE_META: Record<Device, { label: string; note: string }> = {
  mobile: { label: 'Ponsel', note: '≈430px — sama dengan lebar output publik di HP' },
  tablet: { label: 'Tablet', note: '≈768px — preview lebih luas; output publik tetap selebar ponsel' },
  desktop: { label: 'Desktop', note: '100% — menyamai output publik saat dibuka di layar lebar' }
};

const ORDER: Device[] = ['mobile', 'tablet', 'desktop'];

interface DeviceToggleProps {
  device: Device;
  onChange: (device: Device) => void;
}

/** Toggle perangkat preview builder — radio group dengan navigasi panah. */
export default function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  const activeRef = useRef<HTMLButtonElement | null>(null);

  function focusDevice(next: Device) {
    onChange(next);
    // Fokus dipindahkan secara imperatif setelah state ter-update.
    requestAnimationFrame(() => activeRef.current?.focus());
  }

  function onKeyDown(e: React.KeyboardEvent, key: Device) {
    const idx = ORDER.indexOf(key);
    let next: Device | null = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = ORDER[(idx + 1) % ORDER.length];
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = ORDER[(idx - 1 + ORDER.length) % ORDER.length];
    else if (e.key === 'Home') next = ORDER[0];
    else if (e.key === 'End') next = ORDER[ORDER.length - 1];
    if (next) {
      e.preventDefault();
      focusDevice(next);
    }
  }

  return (
    <div role="radiogroup" aria-label="Mode tampilan preview" className="flex items-center rounded-lg border border-[#e0d6c2] bg-white p-0.5">
      {ORDER.map((key) => {
        const isActive = device === key;
        const { label, note } = DEVICE_META[key];
        const Icon = key === 'mobile' ? Smartphone : key === 'tablet' ? Tablet : Monitor;
        return (
          <button
            key={key}
            ref={isActive ? activeRef : undefined}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={`${label} — ${note}`}
            title={note}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(e) => onKeyDown(e, key)}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white'
                : 'text-[#6b5f4d] hover:text-[#8a6d2f]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}