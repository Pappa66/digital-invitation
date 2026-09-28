'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { PUCK_TEMPLATE_LIST, getPuckTemplate } from '@/lib/templates/puck';
import { listUserTemplates, removeUserTemplate, type UserTemplate } from '@/lib/user-templates';
import type { PuckData } from '@/lib/canvas/puck-format';

interface TemplatePickerProps {
  onSelect: (data: PuckData | null) => void;
  onClose: () => void;
}

/** Modal pilih template (bawaan + "Template Saya"). */
export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [mine, setMine] = useState<UserTemplate[]>(() => listUserTemplates());

  useEffect(() => {
    document.body.classList.add('puck-modal-open');
    return () => document.body.classList.remove('puck-modal-open');
  }, []);

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center overflow-auto bg-black/60 p-6">
      <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#2b2620]">Mulai dari Template</h2>
          <button type="button" onClick={onClose} className="rounded border border-[#e0d6c2] px-2 py-1 text-xs">
            Tutup
          </button>
        </div>

        {mine.length > 0 ? (
          <>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#b39a65]">Template Saya</p>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {mine.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-xl border border-[#e7ddcc] p-3 hover:border-[#c9a45c]">
                  <button type="button" onClick={() => onSelect(t.data)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-semibold text-[#2b2620]">{t.name}</span>
                    <span className="block text-xs text-[#8a7a66]">Tersimpan {new Date(t.createdAt).toLocaleDateString('id-ID')}</span>
                  </button>
                  <button
                    type="button"
                    title="Hapus"
                    onClick={() => {
                      removeUserTemplate(t.id);
                      setMine(listUserTemplates());
                    }}
                    className="shrink-0 rounded border border-[#e0d6c2] p-1.5 text-red-500 hover:border-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-[#b39a65]">Template Bawaan</p>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PUCK_TEMPLATE_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const data = getPuckTemplate(t.id);
                if (data) onSelect(data);
              }}
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
