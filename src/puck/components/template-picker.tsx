'use client';

import { PUCK_TEMPLATE_LIST } from '@/lib/templates/puck';

interface TemplatePickerProps {
  onSelect: (templateId: string | null) => void;
  onClose: () => void;
}

/** Modal pilih template awal untuk kanvas kosong. */
export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  return (
    <div className="fixed inset-0 z-[1200] flex items-start justify-center overflow-auto bg-black/40 p-6">
      <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2b2620]">Mulai dari Template</h2>
          <button type="button" onClick={onClose} className="rounded border border-[#e0d6c2] px-2 py-1 text-xs">
            Tutup
          </button>
        </div>
        <p className="mt-1 text-xs text-[#8a7a66]">Pilih template untuk mengisi kanvas, atau mulai dari kosong.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PUCK_TEMPLATE_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="flex items-start gap-3 rounded-xl border border-[#e7ddcc] p-3 text-left hover:border-[#c9a45c] hover:bg-[#faf7f2]"
            >
              <span className="mt-1 h-10 w-10 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#2b2620]">{t.name}</span>
                <span className="block text-xs text-[#8a7a66]">{t.description}</span>
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="mt-4 w-full rounded-lg border border-dashed border-[#c9a45c] px-4 py-2 text-sm text-[#8a6d2f] hover:bg-[#c9a45c]/10"
        >
          Mulai dari kosong
        </button>
      </div>
    </div>
  );
}
