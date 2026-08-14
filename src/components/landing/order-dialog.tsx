'use client';

import { useState } from 'react';
import { Check, Copy, MessageCircle, X } from 'lucide-react';
import { buildOrderMessage, whatsappOrderUrl, normalizePhone, ORDER_WHATSAPP } from '@/lib/order';
import { clientSubmitOrder } from '@/lib/api/order-client';

interface OrderDialogProps {
  open: boolean;
  templateName?: string;
  onClose: () => void;
}

export default function OrderDialog({ open, templateName, onClose }: OrderDialogProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const phoneValid = normalizePhone(phone).length >= 8;

  function close() {
    setSent(false);
    setCopied(false);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneValid) return;
    const message = buildOrderMessage({
      template: templateName,
      name: name.trim(),
      whatsapp: normalizePhone(phone),
      note: note.trim() || undefined
    });
    setSent(true);
    // Simpan ke tabel orders (Kontak Masuk di dashboard) — publik, tanpa login.
    await clientSubmitOrder({
      templateName,
      name: name.trim(),
      whatsapp: normalizePhone(phone),
      note: note.trim() || undefined
    });
    const url = whatsappOrderUrl(message);
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-[#16161c] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Pesan Undangan Digital</h2>
          <button onClick={close} className="text-gray-400 hover:text-white" aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>

        {templateName && <p className="mt-1 text-xs font-medium text-amber-300">Template: {templateName}</p>}
        <p className="mt-2 text-xs leading-relaxed text-gray-400">
          Isi sederhana saja — tim kami akan menghubungi lewat WhatsApp untuk konfirmasi detail &amp; pemesanan.
        </p>

        {sent && !ORDER_WHATSAPP ? (
          <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-200">
              <Check className="h-4 w-4" /> Pesan siap dikirim
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gray-300">
              Nomor WhatsApp bisnis belum dikonfigurasi, jadi pesanan disalin ke papan klip — silakan kirim ke WhatsApp kami secara manual.
            </p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(
                  buildOrderMessage({ template: templateName, name, whatsapp: normalizePhone(phone), note: note.trim() || undefined })
                );
                setCopied(true);
              }}
              className="mt-3 flex items-center gap-2 rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-300"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Tersalin' : 'Salin pesan'}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <label htmlFor="order-name" className="text-xs font-medium text-gray-300">Nama Anda</label>
              <input
                id="order-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                placeholder="cth: Sena Putri"
                className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <div>
              <label htmlFor="order-phone" className="text-xs font-medium text-gray-300">No. WhatsApp</label>
              <input
                id="order-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                inputMode="tel"
                placeholder="cth: 081234567890"
                className="mt-1 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-amber-400/50"
              />
              {phone && !phoneValid && <p className="mt-1 text-xs text-red-400">Nomor WhatsApp tidak valid.</p>}
            </div>
            <div>
              <label htmlFor="order-note" className="text-xs font-medium text-gray-300">Catatan (opsional)</label>
              <textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="cth: butuh untuk akad & resepsi tanggal 20 Desember"
                className="mt-1 w-full resize-none rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-amber-400/50"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black hover:bg-amber-300"
            >
              <MessageCircle className="h-4 w-4" /> Kirim Pesanan
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
