'use client';

import { useState, useEffect } from 'react';
import { Tag, Clock, CheckCircle } from 'lucide-react';

interface PricingSectionProps {
  basePrice: number;
  discountPercent: number;
  promoCode: string;
  promoExpiresAt: string;
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

export default function PricingSection({ basePrice, discountPercent, promoCode, promoExpiresAt }: PricingSectionProps) {
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
      <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-current/10 bg-current/[0.03]">
        <div className="bg-gradient-to-r from-[#c9a45c]/10 to-[#b98a3e]/10 px-6 py-5">
          <p className="text-xs uppercase tracking-widest opacity-60">Mulai dari</p>
          {hasDiscount ? (
            <div className="mt-2 flex items-baseline justify-center gap-3">
              <span className="text-lg text-current/40 line-through">{formatRupiah(basePrice)}</span>
              <span className="text-3xl font-heading font-medium">{formatRupiah(discountedPrice)}</span>
            </div>
          ) : (
            <p className="mt-2 text-3xl font-heading font-medium">{formatRupiah(basePrice)}</p>
          )}
        </div>

        {hasDiscount && (
          <div className="border-t border-current/10 px-6 py-4">
            <div className="flex items-center justify-center gap-2 text-[#c9a45c]">
              <Tag className="h-4 w-4" />
              <span className="text-sm font-semibold">Diskon {discountPercent}%</span>
            </div>
            {promoCode && (
              <button
                onClick={copyCode}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#c9a45c]/50 bg-[#c9a45c]/5 px-3 py-1.5 text-xs font-medium text-[#c9a45c] transition-colors hover:bg-[#c9a45c]/10"
              >
                {copied ? <CheckCircle className="h-3 w-3" /> : <Tag className="h-3 w-3" />}
                {copied ? 'Tersalin!' : `Gunakan kode: ${promoCode}`}
              </button>
            )}
            {timeLeft && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  Berakhir dalam {timeLeft.days}h {timeLeft.hours}j {timeLeft.minutes}m
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
