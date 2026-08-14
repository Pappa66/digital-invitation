'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Check, Copy, QrCode, Share2, X } from 'lucide-react';

/** Tombol mengambang bagikan undangan + QR, di pojok kanan bawah halaman tamu. */
export default function ShareBar() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  function ensureUrl() {
    if (!url && typeof window !== 'undefined') setUrl(window.location.href);
  }

  function openPanel() {
    ensureUrl();
    setOpen((o) => !o);
  }

  async function share() {
    ensureUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title || 'Undangan', url });
        return;
      } catch {
        /* dibatalkan */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <button
        onClick={openPanel}
        aria-label="Bagikan undangan"
        className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition-transform hover:scale-105"
      >
        {open ? <X className="h-5 w-5" /> : <Share2 className="h-5 w-5" />}
      </button>

      {open && (
        <div className="print-hidden fixed bottom-20 right-5 z-50 w-64 rounded-2xl border border-current/10 bg-white p-4 text-gray-900 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Bagikan Undangan</p>
            <button onClick={() => setOpen(false)} aria-label="Tutup" className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={share}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? 'Tersalin!' : 'Salin / Bagikan'}
          </button>
          <div className="mt-3 flex items-center gap-3">
            <QRCode value={url || ' '} size={84} fgColor="#111827" />
            <div className="text-[11px] leading-relaxed text-gray-500">
              <QrCode className="mb-1 h-4 w-4 text-gray-400" />
              Pindai QR untuk membuka undangan dari perangkat lain.
            </div>
          </div>
          <p className="mt-2 truncate rounded-md bg-gray-50 px-2 py-1 font-mono text-[10px] text-gray-400">{url}</p>
        </div>
      )}
    </>
  );
}