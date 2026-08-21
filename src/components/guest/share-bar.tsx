'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { Check, Copy, QrCode, Share2, X, Instagram, Loader2, MessageCircle } from 'lucide-react';

interface ShareBarProps {
  /** Nama mempelai (mis. "Raka & Salma") untuk template IG Story. */
  coupleNames?: string;
  /** Tanggal acara untuk template IG Story. */
  date?: string;
  /** Warna tema untuk gradien poster story. */
  theme?: { primary: string; secondary: string; background: string };
  /** Foto hero untuk twibbon IG Story (opsional — bila ada, jadi background). */
  heroImage?: string;
}

/** Tombol mengambang bagikan undangan + QR, di pojok kanan bawah halaman tamu. */
export default function ShareBar({ coupleNames, date, theme, heroImage }: ShareBarProps) {
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
      const names = coupleNames || 'Kami Berdua';
      const dateLine = date || '';

      // Helper: gambar hero sebagai background cover (twibbon) bila ada
      const drawCover = (img: HTMLImageElement) => {
        const scale = Math.max(W / img.width, H / img.height);
        const sw = img.width * scale;
        const sh = img.height * scale;
        const dx = (W - sw) / 2;
        const dy = (H - sh) / 2;
        ctx.drawImage(img, dx, dy, sw, sh);
        // Overlay gelap agar teks terbaca
        const overlay = ctx.createLinearGradient(0, 0, 0, H);
        overlay.addColorStop(0, 'rgba(0,0,0,0.18)');
        overlay.addColorStop(0.45, 'rgba(0,0,0,0.05)');
        overlay.addColorStop(0.7, 'rgba(0,0,0,0.55)');
        overlay.addColorStop(1, 'rgba(0,0,0,0.72)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, W, H);
      };

      if (heroImage) {
        try {
          const img = await new Promise<HTMLImageElement>((res, rej) => {
            const im = new Image();
            im.crossOrigin = 'anonymous';
            im.onload = () => res(im);
            im.onerror = rej;
            im.src = heroImage;
          });
          drawCover(img);
        } catch {
          // Gagal muat hero — fallback gradien
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, primary);
          grad.addColorStop(0.55, secondary);
          grad.addColorStop(1, '#FAF6EF');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }
      } else {
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, primary);
        grad.addColorStop(0.55, secondary);
        grad.addColorStop(1, '#FAF6EF');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Bingkai tipis twibbon (dalam)
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2;
      ctx.strokeRect(36, 36, W - 72, H - 72);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(48, 48, W - 96, H - 96);

      // Teks — hero-only twibbon
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 12;
      ctx.font = 'italic 42px Georgia, serif';
      ctx.fillText('Undangan Pernikahan', W / 2, H * 0.72);
      ctx.shadowBlur = 0;
      // Nama pasangan — besar, twibbon style
      ctx.font = 'italic 84px Georgia, serif';
      // Handle nama panjang: pecah jadi 2 baris bila perlu
      const maxW = W - 120;
      const words = names.split('&').map((s) => s.trim());
      if (words.length === 2 && ctx.measureText(names).width > maxW) {
        ctx.font = 'italic 72px Georgia, serif';
        ctx.fillText(words[0], W / 2, H * 0.80);
        ctx.font = 'italic 36px Georgia, serif';
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText('&', W / 2, H * 0.84);
        ctx.font = 'italic 72px Georgia, serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(words[1], W / 2, H * 0.88);
      } else {
        ctx.fillText(names, W / 2, H * 0.82);
      }
      if (dateLine) {
        ctx.font = '36px Georgia, serif';
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fillText(dateLine, W / 2, H * 0.91);
      }

      // Unduh
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'twibbon-undangan.png';
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
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 z-[60] flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background shadow-card ring-1 ring-gold/40 transition-transform hover:scale-105 active:scale-95 sm:h-12 sm:w-12"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
      </button>

      {open && (
        <div className="print-hidden fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-4 z-[60] w-72 rounded-3xl border border-border bg-card p-5 text-foreground shadow-dialog">
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
              {storyLoading ? 'Membuat...' : heroImage ? 'Download Twibbon (Hero)' : 'Download Template IG Story'}
            </button>
          )}
          <p className="mt-3 truncate rounded-lg bg-muted px-3 py-2 font-mono text-[11px] text-muted-foreground">{url}</p>
        </div>
      )}
    </>
  );
}