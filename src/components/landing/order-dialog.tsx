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

import { formatRupiah } from '@/lib/format';

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
    const priceInfo = hasDiscount ? `\nHarga: ${formatRupiah(finalPrice)} (diskon ${discountPercent}%)` : basePrice > 0 ? `\nHarga: ${formatRupiah(basePrice)}` : '';
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Form pemesanan undangan">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-background p-6 shadow-dialog">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Pesan Undangan Digital</h2>
          <button onClick={close} className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Tutup dialog">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {templateName && <p className="mt-1 text-xs font-semibold text-gold-deep">Template: {templateName}</p>}
        <div className="my-3 h-px w-full bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Isi sederhana saja — tim kami akan menghubungi lewat WhatsApp untuk konfirmasi detail &amp; pemesanan.
        </p>

        {sent && !waNumber ? (
          <div className="mt-5 rounded-2xl border border-gold/60 bg-gold/15 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-gold-deep">
              <Check className="h-4 w-4" aria-hidden /> Pesan siap dikirim
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
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
              className="mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-gold-strong px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-gold-deep hover:text-background"
            >
              {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copied ? 'Tersalin' : 'Salin pesan'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="order-name" className="text-xs font-semibold text-foreground">Nama Anda</label>
              <input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="cth: Sena Putri"
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold-strong focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label htmlFor="order-phone" className="text-xs font-semibold text-foreground">No. WhatsApp</label>
              <input
                id="order-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                placeholder="cth: 081234567890"
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold-strong focus:ring-2 focus:ring-ring/30"
              />
              {phone && !phoneValid && <p className="mt-1.5 text-xs text-destructive">Nomor WhatsApp tidak valid.</p>}
            </div>
            <div>
              <label htmlFor="order-email" className="text-xs font-semibold text-foreground">Email (opsional)</label>
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cth: email@contoh.com"
                className="mt-1.5 w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold-strong focus:ring-2 focus:ring-ring/30"
              />
            </div>

            {basePrice > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Harga</span>
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-muted-foreground line-through">{formatRupiah(basePrice)}</span>
                      <span className="text-lg font-semibold text-foreground">{formatRupiah(finalPrice)}</span>
                    </div>
                  ) : (
                    <span className="text-lg font-semibold text-foreground">{formatRupiah(basePrice)}</span>
                  )}
                </div>
                {hasDiscount && (
                  <p className="mt-1 text-xs font-medium text-gold-deep">Diskon {discountPercent}% dengan kode {promoCode}</p>
                )}
              </div>
            )}

            {basePrice > 0 && promoCode && (
              <div>
                <label htmlFor="order-promo" className="text-xs font-semibold text-foreground">Kode Promo</label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="order-promo"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); setPromoApplied(false); }}
                    placeholder="Masukkan kode promo"
                    className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold-strong focus:ring-2 focus:ring-ring/30"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    aria-label="Terapkan kode promo"
                    className="flex min-h-11 w-12 items-center justify-center rounded-lg border border-gold/60 bg-gold/10 text-gold-deep transition-colors hover:bg-gold/20"
                  >
                    <Tag className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                {promoError && <p className="mt-1.5 text-xs text-destructive">{promoError}</p>}
                {promoApplied && <p className="mt-1.5 text-xs font-medium text-green-700">Kode promo berhasil diterapkan!</p>}
              </div>
            )}

            <div>
              <label htmlFor="order-note" className="text-xs font-semibold text-foreground">Catatan (opsional)</label>
              <textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="cth: butuh untuk akad & resepsi tanggal 20 Desember"
                className="mt-1.5 w-full resize-none rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-gold-strong focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <button
              type="submit"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-5 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> {basePrice > 0 ? `Pesan - ${formatRupiah(finalPrice)}` : 'Kirim Pesanan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}