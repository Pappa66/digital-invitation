'use client';

import { Smartphone, Monitor } from 'lucide-react';

export type Device = 'mobile' | 'desktop';

interface DeviceToggleProps {
  device: Device;
  onChange: (device: Device) => void;
}

export default function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-[#e0d6c2] bg-white p-0.5" role="group" aria-label="Mode tampilan">
      <button
        onClick={() => onChange('mobile')}
        aria-pressed={device === 'mobile'}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          device === 'mobile' ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white' : 'text-[#6b5f4d] hover:text-[#8a6d2f]'
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        Mobile
      </button>
      <button
        onClick={() => onChange('desktop')}
        aria-pressed={device === 'desktop'}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          device === 'desktop' ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-white' : 'text-[#6b5f4d] hover:text-[#8a6d2f]'
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        Desktop
      </button>
    </div>
  );
}