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
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c9a45c]" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="#c9a45c" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c9a45c]" />
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
    <div className="min-h-screen bg-[#faf7f2] text-[#2b2620]">
      {/* Ornamen latar */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.14),transparent_55%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <header className="sticky top-0 z-40 border-b border-[#e7ddcc]/80 bg-[#faf7f2]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-[#8a7a66] transition-colors hover:text-[#2b2620]">
            <ArrowLeft className="h-4 w-4" /> Semua Template
          </Link>
          <span className="hidden text-xs text-[#b3a69a] sm:block">
            Template {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-[#b3a69a]">
          <Link href="/" className="transition-colors hover:text-[#8a6d2f]">
            Beranda
          </Link>
          <span aria-hidden>/</span>
          <Link href="/#catalog" className="transition-colors hover:text-[#8a6d2f]">
            Template
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-[#8a6d2f]">{meta.name}</span>
        </nav>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 pt-2">
            <PhoneFrame accent={meta.secondary}>
              <GuestRenderer canvas={canvas} preview demo width="mobile" />
            </PhoneFrame>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d9c795]/70 bg-white px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-[#8a6d2f]">
              <Sparkles className="h-3.5 w-3.5" /> {categoryLabel}
            </span>
            <h1 className="mt-4 font-heading text-4xl font-medium text-[#2b2620]">{meta.name}</h1>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full border border-[#e0d6c2]" style={{ background: meta.primary }} />
                <span className="h-5 w-5 rounded-full border border-[#e0d6c2]" style={{ background: meta.secondary }} />
              </div>
              <p className="text-xs text-[#b3a69a]">Palet warna tema</p>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-[#8a7a66]">{meta.description}</p>
            <Ornament />

            <button
              onClick={() => setOrderOpen(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
            >
              <MessageCircle className="h-4 w-4" />
              Pesan Template Ini
            </button>
            <button
              onClick={editInBuilder}
              disabled={editBusy}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#c9a45c]/70 bg-white px-5 py-3 text-sm font-semibold text-[#8a6d2f] transition-colors hover:bg-[#c9a45c]/10 disabled:opacity-60"
            >
              {editBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
              {editBusy ? 'Membuka Builder…' : 'Edit Langsung di Builder'}
            </button>
            {editError && <p className="mt-2 text-center text-xs text-red-600">{editError}</p>}
            <p className="mt-3 text-center text-xs text-[#b3a69a]">Isi form pemesanan — tim kami yang akan mengerjakan desainnya untuk Anda.</p>

            <div className="mt-8 flex justify-between gap-3 border-t border-[#e7ddcc] pt-6">
              {prev ? (
                <Link
                  href={`/templates/${prev.id}`}
                  className="flex flex-1 items-center gap-2 rounded-xl border border-[#e0d6c2] bg-white px-4 py-3 text-sm text-[#4a443c] transition-colors hover:border-[#c9a45c]"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="truncate">{prev.name}</span>
                </Link>
              ) : (
                <span className="flex-1" />
              )}
              {next ? (
                <Link
                  href={`/templates/${next.id}`}
                  className="flex flex-1 items-center justify-end gap-2 rounded-xl border border-[#e0d6c2] bg-white px-4 py-3 text-sm text-[#4a443c] transition-colors hover:border-[#c9a45c]"
                >
                  <span className="truncate">{next.name}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
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