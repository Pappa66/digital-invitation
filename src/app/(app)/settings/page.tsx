'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, Save } from 'lucide-react';
import { getOrderWhatsapp, saveSetting, SETTING_ORDER_WHATSAPP, toWaNumber } from '@/lib/settings';

export default function SettingsPage() {
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getOrderWhatsapp()
      .then((n) => setWhatsapp(n))
      .catch(() => setWhatsapp(''))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await saveSetting(SETTING_ORDER_WHATSAPP, toWaNumber(whatsapp));
    setSaving(false);
    if (res.ok) {
      setWhatsapp(toWaNumber(whatsapp));
      setMessage({ ok: true, text: 'Pengaturan berhasil disimpan.' });
    } else {
      setMessage({ ok: false, text: `Gagal menyimpan: ${res.error}` });
    }
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Pengaturan</h2>
        <p className="mt-1 text-sm text-gray-500">Konfigurasi yang dipakai halaman publik (landing &amp; form pemesanan).</p>
      </div>

      <form onSubmit={handleSave} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="wa-number" className="text-sm font-medium text-gray-900">
          Nomor WhatsApp Bisnis (penerima pesanan)
        </label>
        <p className="mt-1 text-xs leading-relaxed text-gray-500">
          Nomor yang akan membuka chat WhatsApp saat pengunjung mengirim pemesanan. Format internasional tanpa &quot;+&quot;, tanpa spasi. Kosongkan untuk
          menonaktifkan (form akan menyalin pesan ke papan klip).
        </p>
        <div className="relative mt-3">
          <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="wa-number"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            inputMode="tel"
            placeholder="cth: 6281234567890"
            className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Tersimpan sebagai: {whatsapp ? `https://wa.me/${toWaNumber(whatsapp)}` : '(belum diset)'}</p>

        {message && (
          <p className={`mt-3 rounded-md px-3 py-2 text-xs ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>
        )}

        <button
          type="submit"
          disabled={saving || loading}
          className="mt-4 flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </form>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat pengaturan...
        </p>
      )}
    </div>
  );
}