'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, Save, Tag, Eye, EyeOff } from 'lucide-react';
import { getOrderWhatsapp, saveSetting, SETTING_ORDER_WHATSAPP, toWaNumber } from '@/lib/settings';

interface SiteSettings {
  whatsapp: string;
  base_price: number;
  discount_percent: number;
  promo_code: string;
  promo_expires_at: string;
  show_pricing: boolean;
  business_name: string;
}

const defaults: SiteSettings = {
  whatsapp: '',
  base_price: 0,
  discount_percent: 0,
  promo_code: '',
  promo_expires_at: '',
  show_pricing: true,
  business_name: 'PT. Prasha Digital Indonesia'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getOrderWhatsapp()
      .then((n) => {
        setSettings((s) => ({ ...s, whatsapp: n }));
        loadPricing();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function loadPricing() {
    try {
      const stored = localStorage.getItem('di_landing_pricing');
      if (stored) {
        const p = JSON.parse(stored);
        setSettings((s) => ({
          ...s,
          base_price: p.base_price ?? defaults.base_price,
          discount_percent: p.discount_percent ?? defaults.discount_percent,
          promo_code: p.promo_code ?? defaults.promo_code,
          promo_expires_at: p.promo_expires_at ?? defaults.promo_expires_at,
          show_pricing: p.show_pricing ?? defaults.show_pricing
        }));
      }
    } catch { /* ignore */ }
    try {
      const bn = localStorage.getItem('di_business_name');
      if (bn) setSettings((s) => ({ ...s, business_name: bn }));
    } catch { /* ignore */ }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await saveSetting(SETTING_ORDER_WHATSAPP, toWaNumber(settings.whatsapp));
    localStorage.setItem('di_landing_pricing', JSON.stringify({
      base_price: settings.base_price,
      discount_percent: settings.discount_percent,
      promo_code: settings.promo_code,
      promo_expires_at: settings.promo_expires_at,
      show_pricing: settings.show_pricing
    }));
    localStorage.setItem('di_business_name', settings.business_name);

    setSaving(false);
    if (res.ok) {
      setSettings((s) => ({ ...s, whatsapp: toWaNumber(s.whatsapp) }));
      setMessage({ ok: true, text: 'Pengaturan berhasil disimpan.' });
    } else {
      setMessage({ ok: false, text: `Gagal menyimpan: ${res.error}` });
    }
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Pengaturan</h2>
        <p className="mt-1 text-sm text-gray-500">Konfigurasi WhatsApp, harga, promo, dan branding.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
            <MessageCircle className="h-4 w-4" /> WhatsApp Bisnis
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-gray-500">
            Nomor yang akan membuka chat WhatsApp saat pengunjung mengirim pesanan. Format internasional tanpa &quot;+&quot;, tanpa spasi.
          </p>
          <div className="relative">
            <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={settings.whatsapp}
              onChange={(e) => update('whatsapp', e.target.value)}
              inputMode="tel"
              placeholder="cth: 6281234567890"
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Tersimpan sebagai: {settings.whatsapp ? `https://wa.me/${toWaNumber(settings.whatsapp)}` : '(belum diset)'}
          </p>
        </section>

        {/* Harga & Promo */}
        <section className="rounded-xl border border-[#c9a45c]/30 bg-[#faf7f2] p-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#4a443c]">
            <Tag className="h-4 w-4 text-[#c9a45c]" /> Harga & Promo Landing Page
          </h3>
          <p className="mb-4 text-xs text-[#8a7a66]">
            Harga dan promo ini ditampilkan di halaman depan publik (jika diaktifkan).
          </p>

          <div className="mb-4 flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-[#4a443c]">
              <input
                type="checkbox"
                checked={settings.show_pricing}
                onChange={(e) => update('show_pricing', e.target.checked)}
                className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
              />
              Tampilkan harga di landing page
            </label>
          </div>

          {settings.show_pricing && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  value={settings.base_price || ''}
                  onChange={(e) => update('base_price', parseInt(e.target.value) || 0)}
                  className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                  placeholder="2500000"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Diskon (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={settings.discount_percent || ''}
                  onChange={(e) => update('discount_percent', parseInt(e.target.value) || 0)}
                  className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                  placeholder="15"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Kode Promo</label>
                <input
                  type="text"
                  value={settings.promo_code}
                  onChange={(e) => update('promo_code', e.target.value.toUpperCase())}
                  className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm uppercase outline-none focus:ring-2 focus:ring-[#c9a45c]"
                  placeholder="WEDDING15"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Berlaku Hingga</label>
                <input
                  type="date"
                  value={settings.promo_expires_at?.split('T')[0] || ''}
                  onChange={(e) => update('promo_expires_at', e.target.value ? `${e.target.value}T23:59:59` : '')}
                  className="w-full rounded-md border border-[#e0d6c2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                />
              </div>
            </div>
          )}
          {settings.base_price > 0 && settings.discount_percent > 0 && (
            <p className="mt-3 text-xs text-[#c9a45c]">
              Harga final: Rp {(Math.round(settings.base_price * (1 - settings.discount_percent / 100))).toLocaleString('id-ID')}
              {settings.promo_code && ` (kode: ${settings.promo_code})`}
            </p>
          )}
        </section>

        {/* Business Name */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Branding</h3>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Nama Bisnis (untuk Watermark)</label>
            <input
              type="text"
              value={settings.business_name}
              onChange={(e) => update('business_name', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              placeholder="PT. Prasha Digital Indonesia"
            />
            <p className="mt-1 text-xs text-gray-400">Muncul di watermark &quot;Made with Love by ...&quot; di bagian akhir undangan.</p>
          </div>
        </section>

        {message && (
          <p className={`rounded-md px-3 py-2 text-xs ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{message.text}</p>
        )}

        <button
          type="submit"
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
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
