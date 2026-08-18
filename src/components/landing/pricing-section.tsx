'use client';

import { useState, useEffect } from 'react';
import { Tag, Clock, CheckCircle } from 'lucide-react';

interface PricingSectionProps {
  basePrice: number;
  discountPercent: number;
  promoCode: string;
  promoExpiresAt: string;
  onOrder?: () => void;
}

import { formatRupiah } from '@/lib/format';

function getTimeRemaining(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes, total: diff };
}

export default function PricingSection({ basePrice, discountPercent, promoCode, promoExpiresAt, onOrder }: PricingSectionProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(promoExpiresAt));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(promoExpiresAt)), 60000);
    return () => clearInterval(timer);
  }, [promoExpiresAt]);

  const hasDiscount = discountPercent > 0 && timeLeft;
  const discountedPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;

  function copyCode() {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!basePrice || basePrice <= 0) return null;

  return (
    <section className="px-6 py-10 text-center">
      <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-card">
        <div className="bg-gradient-to-br from-gold/15 via-card to-gold/10 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Mulai dari</p>
          {hasDiscount ? (
            <div className="mt-2 flex items-baseline justify-center gap-3">
              <span className="text-lg text-muted-foreground line-through">{formatRupiah(basePrice)}</span>
              <span className="text-4xl font-heading font-medium text-foreground">{formatRupiah(discountedPrice)}</span>
            </div>
          ) : (
            <p className="mt-2 text-4xl font-heading font-medium text-foreground">{formatRupiah(basePrice)}</p>
          )}
        </div>

        {hasDiscount && (
          <div className="border-t border-border bg-gold/5 px-6 py-5">
            <div className="flex items-center justify-center gap-2 text-gold-deep">
              <Tag className="h-4 w-4" aria-hidden />
              <span className="text-sm font-semibold">Diskon {discountPercent}%</span>
            </div>
            {promoCode && (
              <button
                onClick={copyCode}
                aria-live="polite"
                className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-gold/70 bg-card px-4 py-2 text-xs font-semibold text-gold-deep transition-colors hover:bg-gold/15"
              >
                {copied ? <CheckCircle className="h-3 w-3" aria-hidden /> : <Tag className="h-3 w-3" aria-hidden />}
                {copied ? 'Tersalin!' : `Gunakan kode: ${promoCode}`}
              </button>
            )}
            {timeLeft && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" aria-hidden />
                <span>Berakhir dalam {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m</span>
              </div>
            )}
          </div>
        )}
        {onOrder && (
          <div className="border-t border-border px-6 py-5">
            <button
              onClick={onOrder}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-8 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Pesan Sekarang
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
