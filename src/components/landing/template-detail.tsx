'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Sparkles, Wand2 } from 'lucide-react';
import type { CanvasData, TemplateMeta } from '@/lib/types';
import GuestRenderer from '@/components/guest/GuestRenderer';
import OrderDialog from '@/components/landing/order-dialog';
import PhoneFrame from '@/components/ui/phone-frame';
import { clientCreateProject } from '@/lib/api/project-client';

interface TemplateDetailProps {
  meta: TemplateMeta;
  index: number;
  canvas: CanvasData;
  categoryLabel: string;
  total: number;
  prev: { id: string; name: string } | null;
  next: { id: string; name: string } | null;
}

function Ornament() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-strong" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="hsl(var(--gold-strong))" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-strong" />
    </div>
  );
}

export default function TemplateDetail({ meta, index, canvas, categoryLabel, total, prev, next }: TemplateDetailProps) {
  const router = useRouter();
  const [orderOpen, setOrderOpen] = useState(false);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState('');
  const [pricing, setPricing] = useState({ base_price: 0, discount_percent: 0, promo_code: '' });

  async function editInBuilder() {
    setEditBusy(true);
    setEditError('');
    try {
      const res = await clientCreateProject(meta.name, meta.id);
      if (res.error) return setEditError(res.error);
      router.push(`/builder/${res.id}`);
    } catch {
      setEditError('Gagal membuka builder. Coba lagi.');
    } finally {
      setEditBusy(false);
    }
  }

  useEffect(() => {
    import('@/lib/settings').then(({ getPricing }) =>
      getPricing().then((p) => setPricing({ base_price: p.base_price, discount_percent: p.discount_percent, promo_code: p.promo_code }))
    ).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ornamen latar */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(40,50%,57%,0.14),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Semua Template
          </Link>
          <span className="hidden text-xs text-muted-foreground sm:block">
            Template {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/" className="rounded-sm transition-colors hover:text-gold-deep">
            Beranda
          </Link>
          <span aria-hidden>/</span>
          <Link href="/#catalog" className="rounded-sm transition-colors hover:text-gold-deep">
            Template
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-gold-deep">{meta.name}</span>
        </nav>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          {/* Kolom ponsel: PhoneFrame lebar maks 360 & di-center; min-w-0 agar
              tidak mendorong kolom info keluar pada breakpoint lg. */}
          <div className="flex min-w-0 justify-center pt-2">
            <PhoneFrame accent={meta.secondary}>
              <GuestRenderer canvas={canvas} preview width="mobile" />
            </PhoneFrame>
          </div>

          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-deep">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> {categoryLabel}
            </span>
            <h1 className="mt-4 font-heading text-display-md font-medium text-foreground sm:text-display-lg">{meta.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full border border-border" style={{ background: meta.primary }} />
                <span className="h-5 w-5 rounded-full border border-border" style={{ background: meta.secondary }} />
              </div>
              <p className="text-xs text-muted-foreground">Palet warna tema</p>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
            <Ornament />

            <button
              onClick={() => setOrderOpen(true)}
              className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-5 py-3.5 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Pesan Template Ini
            </button>
            <button
              onClick={editInBuilder}
              disabled={editBusy}
              className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-gold/70 bg-card px-5 py-3 text-sm font-semibold text-gold-deep transition-colors hover:bg-gold/10 disabled:opacity-60"
            >
              {editBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
              {editBusy ? 'Membuka Builder…' : 'Edit Langsung di Builder'}
            </button>
            {editError && <p className="mt-2 text-center text-xs text-destructive">{editError}</p>}
            <p className="mt-3 text-center text-xs text-muted-foreground">Isi form pemesanan — tim kami yang akan mengerjakan desainnya untuk Anda.</p>

            <div className="mt-8 flex justify-between gap-3 border-t border-border pt-6">
              {prev ? (
                <Link
                  href={`/templates/${prev.id}`}
                  className="flex min-h-12 flex-1 items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{prev.name}</span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <Link
                  href={`/templates/${next.id}`}
                  className="flex min-h-12 flex-1 items-center justify-end gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-gold"
                >
                  <span className="truncate">{next.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </main>

      {orderOpen && (
        <OrderDialog
          templateName={meta.name}
          basePrice={pricing.base_price}
          discountPercent={pricing.discount_percent}
          promoCode={pricing.promo_code}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}