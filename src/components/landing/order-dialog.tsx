'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, X, Tag } from 'lucide-react';
import { buildOrderMessage, normalizePhone, whatsappOrderUrl } from '@/lib/order';
import { getOrderWhatsapp, toWaNumber } from '@/lib/settings';
import { clientSubmitOrder } from '@/lib/api/order-client';

interface OrderDialogProps {
  templateName?: string;
  basePrice?: number;
  discountPercent?: number;
  promoCode?: string;
  onClose: () => void;
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function OrderDialog({ templateName, basePrice = 0, discountPercent = 0, promoCode, onClose }: OrderDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    getOrderWhatsapp().then((n) => setWaNumber(n));
  }, []);

  const phoneValid = normalizePhone(phone).length >= 8;
  const hasDiscount = promoApplied && discountPercent > 0 && promoCode;
  const finalPrice = hasDiscount ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;

  function applyPromo() {
    if (!promoCode) return;
    if (promoInput.trim().toUpperCase() === promoCode.toUpperCase()) {
      setPromoApplied(true);
      setPromoError('');
    } else {
      setPromoApplied(false);
      setPromoError('Kode promo tidak valid');
    }
  }

  function close() {
    setSent(false);
    setCopied(false);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneValid) return;
    const wa = toWaNumber(phone);
    const priceInfo = hasDiscount ? `\nHarga: ${formatPrice(finalPrice)} (diskon ${discountPercent}%)` : basePrice > 0 ? `\nHarga: ${formatPrice(basePrice)}` : '';
    const message = buildOrderMessage({
      template: templateName,
      name: name.trim(),
      whatsapp: wa,
      note: (note.trim() || '') + priceInfo
    });
    try {
      await clientSubmitOrder({
        templateName,
        name: name.trim(),
        whatsapp: wa,
        email: email.trim() || undefined,
        note: (note.trim() || '') + priceInfo
      });
    } catch { /* order save failed, still open WA */ }
    setSent(true);
    const url = whatsappOrderUrl(message, waNumber);
    if (url) {
      window.open(url, '_blank', 'noopener');
      close();
      return;
    }
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2b2620]/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-[#e7ddcc] bg-[#faf7f2] p-6 shadow-2xl shadow-[#2b2620]/20">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-[#2b2620]">Pesan Undangan Digital</h2>
          <button onClick={close} className="text-[#8a7a66] transition-colors hover:text-[#2b2620]" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        {templateName && <p className="mt-1 text-xs font-medium text-[#b98a3e]">Template: {templateName}</p>}
        <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-[#d9c795] to-transparent" />
        <p className="text-xs leading-relaxed text-[#8a7a66]">
          Isi sederhana saja — tim kami akan menghubungi lewat WhatsApp untuk konfirmasi detail &amp; pemesanan.
        </p>

        {sent && !waNumber ? (
          <div className="mt-5 rounded-xl border border-[#d9c795] bg-[#f3ecd9] p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-[#8a6d2f]">
              <Check className="h-4 w-4" /> Pesan siap dikirim
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8a7a66]">
              Nomor WhatsApp bisnis belum dikonfigurasi di dashboard, jadi pesanan disalin ke papan klip — silakan kirim ke WhatsApp kami secara manual.
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  buildOrderMessage({ template: templateName, name, whatsapp: toWaNumber(phone), note: note.trim() || undefined })
                );
                setCopied(true);
              }}
              className="mt-3 flex items-center gap-2 rounded-md bg-[#b98a3e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#a87c34]"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Tersalin' : 'Salin pesan'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="order-name" className="text-xs font-medium text-[#4a443c]">Nama Anda</label>
              <input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="cth: Sena Putri"
                className="mt-1 w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm text-[#2b2620] outline-none placeholder:text-[#b3a69a] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/30"
              />
            </div>
            <div>
              <label htmlFor="order-phone" className="text-xs font-medium text-[#4a443c]">No. WhatsApp</label>
              <input
                id="order-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                placeholder="cth: 081234567890"
                className="mt-1 w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm text-[#2b2620] outline-none placeholder:text-[#b3a69a] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/30"
              />
              {phone && !phoneValid && <p className="mt-1 text-xs text-red-500">Nomor WhatsApp tidak valid.</p>}
            </div>
            <div>
              <label htmlFor="order-email" className="text-xs font-medium text-[#4a443c]">Email (opsional)</label>
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth: email@contoh.com"
                className="mt-1 w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm text-[#2b2620] outline-none placeholder:text-[#b3a69a] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/30"
              />
            </div>

            {basePrice > 0 && (
              <div className="rounded-lg border border-[#e0d6c2] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#8a7a66]">Harga</span>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-[#8a7a66] line-through">{formatPrice(basePrice)}</span>
                      <span className="text-lg font-semibold text-[#2b2620]">{formatPrice(finalPrice)}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-[#2b2620]">{formatPrice(basePrice)}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="mt-1 text-xs text-[#c9a45c]">Diskon {discountPercent}% dengan kode {promoCode}</p>
                )}
              </div>
            )}

            {basePrice > 0 && promoCode && (
              <div>
                <label htmlFor="order-promo" className="text-xs font-medium text-[#4a443c]">Kode Promo</label>
                <div className="mt-1 flex gap-2">
                  <input
                    id="order-promo"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); setPromoApplied(false); }}
                    placeholder="Masukkan kode promo"
                    className="flex-1 rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm text-[#2b2620] outline-none placeholder:text-[#b3a69a] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/30"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    className="rounded-md border border-[#c9a45c] bg-[#c9a45c]/10 px-3 py-2 text-xs font-medium text-[#c9a45c] hover:bg-[#c9a45c]/20"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                </div>
                {promoError && <p className="mt-1 text-xs text-red-500">{promoError}</p>}
                {promoApplied && <p className="mt-1 text-xs text-green-600">Kode promo berhasil diterapkan!</p>}
              </div>
            )}

            <div>
              <label htmlFor="order-note" className="text-xs font-medium text-[#4a443c]">Catatan (opsional)</label>
              <textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="cth: butuh untuk akad & resepsi tanggal 20 Desember"
                className="mt-1 w-full resize-none rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm text-[#2b2620] outline-none placeholder:text-[#b3a69a] focus:border-[#b98a3e] focus:ring-2 focus:ring-[#b98a3e]/30"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
            >
              <MessageCircle className="h-4 w-4" /> {basePrice > 0 ? `Pesan - ${formatPrice(finalPrice)}` : 'Kirim Pesanan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}