'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, Save, Tag } from 'lucide-react';
import { getOrderWhatsapp, saveSetting, SETTING_ORDER_WHATSAPP, toWaNumber, getPricing, savePricing, SETTING_BUSINESS_NAME, getBusinessName } from '@/lib/settings';
import { computeFinalPrice, isPromoExpired } from '@/lib/pricing';
import { formatRupiah } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

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

  async function loadPricing() {
    const [pricing, bn] = await Promise.all([getPricing(), getBusinessName()]);
    setSettings((s) => ({
      ...s,
      base_price: pricing.base_price,
      discount_percent: pricing.discount_percent,
      promo_code: pricing.promo_code,
      promo_expires_at: pricing.promo_expires_at,
      show_pricing: pricing.show_pricing,
      business_name: bn || defaults.business_name
    }));
  }

  useEffect(() => {
    getOrderWhatsapp()
      .then((n) => {
        setSettings((s) => ({ ...s, whatsapp: n }));
        return loadPricing();
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const [whatsAppRes, pricingRes, brandRes] = await Promise.all([
      saveSetting(SETTING_ORDER_WHATSAPP, toWaNumber(settings.whatsapp)),
      savePricing({
        base_price: settings.base_price,
        discount_percent: settings.discount_percent,
        promo_code: settings.promo_code,
        promo_expires_at: settings.promo_expires_at,
        show_pricing: settings.show_pricing
      }),
      saveSetting(SETTING_BUSINESS_NAME, settings.business_name)
    ]);

    try {
      localStorage.setItem('di_business_name', settings.business_name);
    } catch { /* ignore */ }

    setSaving(false);
    if (whatsAppRes.ok && pricingRes.ok && brandRes.ok) {
      setSettings((s) => ({ ...s, whatsapp: toWaNumber(s.whatsapp) }));
      await loadPricing();
      setMessage({ ok: true, text: 'Pengaturan berhasil disimpan.' });
    } else {
      setMessage({ ok: false, text: `Gagal menyimpan: ${whatsAppRes.error || pricingRes.error || brandRes.error}` });
    }
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Pengaturan</h2>
        <p className="mt-1 text-sm text-muted-foreground">Konfigurasi WhatsApp, harga, promo, dan branding.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* WhatsApp */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageCircle className="h-4 w-4 text-gold-strong" aria-hidden /> WhatsApp Bisnis
            </h3>
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Nomor untuk chat WhatsApp pesanan. Format internasional tanpa &quot;+&quot;.
            </p>
            <div className="relative">
              <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={settings.whatsapp}
                onChange={(e) => update('whatsapp', e.target.value)}
                inputMode="tel"
                placeholder="cth: 6281234567890"
                aria-label="Nomor WhatsApp bisnis"
                className="pl-10"
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {settings.whatsapp ? `wa.me/${toWaNumber(settings.whatsapp)}` : '(belum diset)'}
            </p>
          </section>

          {/* Branding */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Branding</h3>
            <div>
              <label htmlFor="business-name" className="mb-1 block text-xs font-medium text-foreground">Nama Bisnis (Watermark)</label>
              <Input
                id="business-name"
                type="text"
                value={settings.business_name}
                onChange={(e) => update('business_name', e.target.value)}
                placeholder="PT. Prasha Digital Indonesia"
              />
              <p className="mt-1 text-xs text-muted-foreground">Muncul di watermark &quot;Made with Love by ...&quot;</p>
            </div>
          </section>
        </div>

        {/* Harga & Promo — full width */}
        <section className="rounded-2xl border border-gold/30 bg-accent p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
              <Tag className="h-4 w-4 text-gold-strong" aria-hidden /> Harga & Promo
            </h3>
            <label className="flex items-center gap-2 text-xs font-medium text-accent-foreground">
              <Switch checked={settings.show_pricing} onCheckedChange={(v) => update('show_pricing', v)} />
              Tampilkan
            </label>
          </div>

          {settings.show_pricing && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label htmlFor="base-price" className="mb-1 block text-xs font-medium text-accent-foreground">Harga Dasar (Rp)</Label>
                <Input
                  id="base-price"
                  type="number"
                  value={settings.base_price || ''}
                  onChange={(e) => update('base_price', parseInt(e.target.value) || 0)}
                  placeholder="2500000"
                />
              </div>
              <div>
                <Label htmlFor="discount-percent" className="mb-1 block text-xs font-medium text-accent-foreground">Diskon (%)</Label>
                <Input
                  id="discount-percent"
                  type="number"
                  min={0}
                  max={100}
                  value={settings.discount_percent || ''}
                  onChange={(e) => update('discount_percent', parseInt(e.target.value) || 0)}
                  placeholder="15"
                />
              </div>
              <div>
                <Label htmlFor="promo-code" className="mb-1 block text-xs font-medium text-accent-foreground">Kode Promo</Label>
                <Input
                  id="promo-code"
                  type="text"
                  value={settings.promo_code}
                  onChange={(e) => update('promo_code', e.target.value.toUpperCase())}
                  placeholder="WEDDING15"
                  className="uppercase"
                />
              </div>
              <div>
                <Label htmlFor="promo-expires" className="mb-1 block text-xs font-medium text-accent-foreground">Berlaku Hingga</Label>
                <Input
                  id="promo-expires"
                  type="date"
                  value={settings.promo_expires_at?.split('T')[0] || ''}
                  onChange={(e) => update('promo_expires_at', e.target.value ? `${e.target.value}T23:59:59` : '')}
                />
              </div>
            </div>
          )}
          {settings.base_price > 0 && (
            <p className="mt-3 text-xs font-medium text-gold-deep">
              {settings.discount_percent > 0 && !isPromoExpired(settings.promo_expires_at) ? (
                <>
                  Harga final: {formatRupiah(computeFinalPrice(settings.base_price, settings.discount_percent))}
                  {settings.promo_code && ` (${settings.promo_code})`}
                </>
              ) : (
                <>
                  Harga: {formatRupiah(settings.base_price)}
                  {settings.discount_percent > 0 && isPromoExpired(settings.promo_expires_at) ? ' — promo kedaluwarsa' : ''}
                </>
              )}
            </p>
          )}
        </section>

        {message && (
          <p role="status" className={`rounded-md px-3 py-2 text-xs ${message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/10 text-destructive'}`}>{message.text}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || loading}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
            {saving ? 'Menyimpan...' : 'Simpan'}
          </Button>
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status" aria-live="polite">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Memuat...
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
