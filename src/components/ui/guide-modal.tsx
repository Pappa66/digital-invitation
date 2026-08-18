'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-h-[85vh] w-full max-w-lg overflow-y-auto p-6 sm:rounded-xl">
        <DialogTitle className="text-base font-semibold text-gray-900">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          Panduan langkah demi langkah untuk menggunakan aplikasi ini.
        </DialogDescription>
        <ol className="mt-4 space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-xs font-semibold text-white">
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
            className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Mengerti
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}