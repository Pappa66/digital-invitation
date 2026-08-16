'use client';

import { Smartphone, Monitor, Tablet } from 'lucide-react';

export type Device = 'mobile' | 'tablet' | 'desktop';

interface DeviceToggleProps {
  device: Device;
  onChange: (device: Device) => void;
}

export default function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  const items: { key: Device; label: string; icon: typeof Smartphone }[] = [
    { key: 'mobile', label: 'Mobile', icon: Smartphone },
    { key: 'tablet', label: 'Tablet', icon: Tablet },
    { key: 'desktop', label: 'Desktop', icon: Monitor }
  ];
  return (
    <div className="flex items-center rounded-lg border border-[#e0d6c2] bg-white p-0.5" role="group" aria-label="Mode tampilan">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            aria-pressed={device === it.key}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              device === it.key ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white' : 'text-[#6b5f4d] hover:text-[#8a6d2f]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}