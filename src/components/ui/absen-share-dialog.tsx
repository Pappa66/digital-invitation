'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Check, Copy, ExternalLink, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { getSiteOrigin } from '@/lib/site';

interface AbsenShareDialogProps {
  open: boolean;
  projectId: string;
  onClose: () => void;
}

/** Salin teks: clipboard API modern + fallback textarea/execCommand. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * Dialog "QR Absen" per project — link publik `${origin}/absen/{projectId}`
 * lengkap dengan QR untuk dipindai panitia (tanpa login).
 */
export default function AbsenShareDialog({ open, projectId, onClose }: AbsenShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const absenUrl = `${getSiteOrigin()}/absen/${projectId}`;

  async function handleCopy() {
    const ok = await copyText(absenUrl);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-gold-strong" aria-hidden />
            QR Absen
          </DialogTitle>
          <DialogDescription>Buka kamera untuk memindai QR tamu</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-soft">
            <QRCode value={absenUrl} size={180} fgColor="#111827" />
          </div>

          <div className="w-full space-y-2.5">
            <button
              onClick={handleCopy}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gold/60 bg-card px-4 py-2.5 text-sm font-semibold text-gold-deep transition-colors hover:bg-gold/10 active:scale-[0.99]"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
              {copied ? 'Tersalin' : 'Salin Link'}
            </button>

            <a
              href={absenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-4 py-2.5 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Buka halaman absen
            </a>
          </div>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Link ini publik — bagikan ke panitia tanpa login.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}