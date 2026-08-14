'use client';

import { Smartphone, Monitor } from 'lucide-react';

export type Device = 'mobile' | 'desktop';

interface DeviceToggleProps {
  device: Device;
  onChange: (device: Device) => void;
}

export default function DeviceToggle({ device, onChange }: DeviceToggleProps) {
  return (
    <div className="flex items-center rounded-lg border border-[#3a3f4a] bg-[#10131a] p-0.5" role="group" aria-label="Mode tampilan">
      <button
        onClick={() => onChange('mobile')}
        aria-pressed={device === 'mobile'}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          device === 'mobile' ? 'bg-[#e8ddc6] text-[#141414]' : 'text-[#8b93a3] hover:text-white'
        }`}
      >
        <Smartphone className="h-3.5 w-3.5" />
        Mobile
      </button>
      <button
        onClick={() => onChange('desktop')}
        aria-pressed={device === 'desktop'}
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          device === 'desktop' ? 'bg-[#e8ddc6] text-[#141414]' : 'text-[#8b93a3] hover:text-white'
        }`}
      >
        <Monitor className="h-3.5 w-3.5" />
        Desktop
      </button>
    </div>
  );
}