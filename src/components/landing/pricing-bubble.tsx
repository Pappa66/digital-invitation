'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle, Clock, Tag } from 'lucide-react';
import { formatRupiah } from '@/lib/format';
import { computeFinalPrice, getTimeRemaining, isPromoExpired } from '@/lib/pricing';

interface PricingBubbleProps {
  basePrice: number;
  discountPercent: number;
  promoCode: string;
  promoExpiresAt?: string;
  onOrder?: () => void;
}

/**
 * Bubble harga/promo di dalam hero — spec `docs/design/hero-pricing-bubble.md`.
 * Presentational: logika diskon & countdown identik dengan alur pemesanan
 * (lihat `src/lib/pricing.ts`). Harga normal ditampilkan saat promo kedaluwarsa.
 */
export default function PricingBubble({
  basePrice,
  discountPercent,
  promoCode,
  promoExpiresAt,
  onOrder
}: PricingBubbleProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(promoExpiresAt));
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(promoExpiresAt)), 60000);
    return () => clearInterval(timer);
  }, [promoExpiresAt]);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  // Harga normal saat tidak ada diskon ATAU diskon sudah kedaluwarsa.
  const hasDiscount = basePrice > 0 && discountPercent > 0 && !isPromoExpired(promoExpiresAt);
  const finalPrice = hasDiscount ? computeFinalPrice(basePrice, discountPercent) : basePrice;

  function copyCode() {
    if (!promoCode) return;
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  if (!basePrice || basePrice <= 0) return null;

  return (
    <div
      role="group"
      aria-label="Harga dan promo"
      className="pricing-bubble-enter relative z-10 mx-auto w-full max-w-sm overflow-hidden rounded-3xl border border-gold/25 bg-card/95 p-5 text-center shadow-card backdrop-blur sm:p-6 lg:mx-0 lg:text-left"
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-gold/15 via-transparent to-gold/5" />
      <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 -z-10 h-24 w-24 rounded-full bg-gold/20 blur-2xl lg:h-28 lg:w-28" />

      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 lg:justify-start">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Mulai dari</p>
        {hasDiscount && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-deep ring-1 ring-gold/30">
            <Tag className="h-3 w-3" aria-hidden /> Diskon {discountPercent}%
          </span>
        )}
      </div>

      {hasDiscount ? (
        <div
          className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 lg:justify-start"
          aria-label={`Harga awal ${formatRupiah(basePrice)}, harga promo ${formatRupiah(finalPrice)}`}
        >
          <span className="text-base text-muted-foreground line-through decoration-gold-strong/60">{formatRupiah(basePrice)}</span>
          <span className="font-heading text-3xl font-medium tabular-nums text-foreground sm:text-4xl">{formatRupiah(finalPrice)}</span>
        </div>
      ) : (
        <p className="mt-2 font-heading text-3xl font-medium tabular-nums text-foreground sm:text-4xl">{formatRupiah(basePrice)}</p>
      )}

      <div className="my-4 border-t border-border" role="presentation" />

      {hasDiscount && (
        <div className="space-y-3">
          {promoCode && (
            <button
              type="button"
              onClick={copyCode}
              className={`inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-gold/70 px-4 py-2 text-xs font-semibold text-gold-deep transition-colors hover:bg-gold/15 active:scale-[0.98] motion-reduce:active:scale-100 lg:w-auto ${
                copied ? 'bg-gold/15 ring-1 ring-gold/40' : 'bg-card'
              }`}
            >
              {copied ? <CheckCircle className="h-3 w-3" aria-hidden /> : <Tag className="h-3 w-3" aria-hidden />}
              {copied ? 'Tersalin!' : `Gunakan kode: ${promoCode}`}
            </button>
          )}
          {timeLeft && (
            <div className="flex items-center justify-center gap-1.5 text-xs tabular-nums text-muted-foreground lg:justify-start">
              <Clock className="h-3 w-3" aria-hidden />
              <span>
                Berakhir dalam {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m
              </span>
            </div>
          )}
        </div>
      )}

      {onOrder && (
        <div className={hasDiscount ? 'mt-4 border-t border-border pt-4' : ''}>
          <button
            type="button"
            onClick={onOrder}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-6 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            Pesan Sekarang <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {/* Live region tetap ter-mount agar perubahan teks memicu pengumuman. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? 'Kode promo tersalin' : ''}
      </span>
    </div>
  );
}
