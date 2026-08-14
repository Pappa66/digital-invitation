'use client';

export interface GuideStep {
  title: string;
  body: string;
}

interface GuideModalProps {
  open: boolean;
  title: string;
  steps: GuideStep[];
  onClose: () => void;
}

export default function GuideModal({ open, title, steps, onClose }: GuideModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:bg-gray-100" aria-label="Tutup panduan">
            ✕
          </button>
        </div>
        <ol className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-gray-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}