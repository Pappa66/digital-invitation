'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Check, Copy, QrCode, Share2, X, Instagram, Loader2, MessageCircle, Printer } from 'lucide-react';

interface ShareBarProps {
  /** Nama mempelai (mis. "Raka & Salma") untuk template IG Story. */
  coupleNames?: string;
  /** Tanggal acara untuk template IG Story. */
  date?: string;
  /** Warna tema untuk gradien poster story. */
  theme?: { primary: string; secondary: string; background: string };
}

/** Tombol mengambang bagikan undangan + QR, di pojok kanan bawah halaman tamu. */
export default function ShareBar({ coupleNames, date, theme }: ShareBarProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [storyLoading, setStoryLoading] = useState(false);
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

  async function downloadStory() {
    setStoryLoading(true);
    try {
      const W = 1080;
      const H = 1920;
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const primary = theme?.primary || '#D4AF37';
      const secondary = theme?.secondary || '#8A6D2F';
      const bg = theme?.background || '#FAF6EF';
      const names = coupleNames || 'Kami Berdua';
      const dateLine = date || '';

      // Latar gradien halus
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, primary);
      grad.addColorStop(0.55, secondary);
      grad.addColorStop(1, bg);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Ornamen garis ganda mengelilingi kartu
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 60, W - 120, H - 120);
      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(84, 84, W - 168, H - 168);

      // Aksesoris sudut kecil
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const dot = (x: number, y: number) => {
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
      };
      dot(84, 84); dot(W - 84, 84); dot(84, H - 84); dot(W - 84, H - 84);

      // Teks
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'italic 44px Georgia, serif';
      ctx.fillText('Undangan Pernikahan', W / 2, H * 0.3);
      ctx.font = 'italic 88px Georgia, serif';
      ctx.fillText(names, W / 2, H * 0.5);
      if (dateLine) {
        ctx.font = '42px Georgia, serif';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(dateLine, W / 2, H * 0.66);
      }
      ctx.font = 'italic 40px Georgia, serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText('Prasha Digital Indonesia', W / 2, H * 0.86);

      // Unduh
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ig-story-undangan.png';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      /* ignore */
    } finally {
      setStoryLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openPanel}
        aria-label={open ? 'Tutup panel bagikan' : 'Bagikan undangan'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-card ring-2 ring-gold/60 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" aria-hidden /> : <Share2 className="h-6 w-6" aria-hidden />}
      </button>

      {open && (
        <div className="print-hidden fixed bottom-20 right-4 z-50 w-72 rounded-3xl border border-border bg-card p-5 text-foreground shadow-dialog">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Bagikan Undangan</p>
            <button onClick={() => setOpen(false)} aria-label="Tutup panel" className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <button
            onClick={share}
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-3 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
            {copied ? 'Tersalin!' : 'Salin / Bagikan'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${document.title || 'Undangan Pernikahan'}\n${url}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-green-100 px-3 py-2.5 text-sm font-semibold text-green-900 transition-colors hover:bg-green-200"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> Bagikan via WhatsApp
          </a>
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
            <QRCode value={url || ' '} size={88} fgColor="#2b2620" bgColor="#ffffff" />
            <div className="text-[11px] leading-relaxed text-muted-foreground">
              <QrCode className="mb-1 h-4 w-4" aria-hidden />
              Pindai QR untuk membuka undangan dari perangkat lain.
            </div>
          </div>
          {coupleNames && (
            <button
              onClick={downloadStory}
              disabled={storyLoading}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              {storyLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Instagram className="h-4 w-4" aria-hidden />}
              {storyLoading ? 'Membuat...' : 'Download Template IG Story'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Printer className="h-4 w-4" aria-hidden /> Cetak / Simpan PDF
          </button>
          <p className="mt-3 truncate rounded-lg bg-muted px-3 py-2 font-mono text-[11px] text-muted-foreground">{url}</p>
        </div>
      )}
    </>
  );
}