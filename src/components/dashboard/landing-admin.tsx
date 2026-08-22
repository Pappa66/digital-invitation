'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import {
  getLandingContent,
  saveLandingContent,
  LANDING_CONTENT_DEFAULTS,
  type LandingContent,
  type LandingItem
} from '@/lib/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Patch = React.Dispatch<React.SetStateAction<LandingContent>>;

export default function LandingAdmin() {
  const [content, setContent] = useState<LandingContent>(LANDING_CONTENT_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getLandingContent()
      .then(setContent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await saveLandingContent(content);
    setSaving(false);
    setMessage(res.ok ? { ok: true, text: 'Konten landing berhasil disimpan.' } : { ok: false, text: `Gagal menyimpan: ${res.error}` });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Landing Page</h2>
          <p className="mt-1 text-sm text-gray-500">Konten halaman depan publik.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>

      {message && (
        <p className={`mb-4 rounded-md px-3 py-2 text-xs ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </p>
      )}

      <div className="space-y-5">
        {/* HERO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4 text-[#c9a45c]" /> Hero
            </CardTitle>
            <CardDescription>Titik pembuka, judul, dan kolase gambar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Kicker (script)</Label>
              <Input value={content.hero.kicker} onChange={(e) => setHero(content.hero.kicker, { kicker: e.target.value })} className="mt-1" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Judul bagian 1</Label>
                <Input value={content.hero.title_a} onChange={(e) => setHero(content.hero.title_a, { title_a: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Judul bagian 2 (italic)</Label>
                <Input value={content.hero.title_b} onChange={(e) => setHero(content.hero.title_b, { title_b: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subjudul</Label>
              <textarea
                value={content.hero.subtitle}
                onChange={(e) => setHero(content.hero.subtitle, { subtitle: e.target.value })}
                rows={2}
                className="mt-1 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Teks tombol utama</Label>
                <Input value={content.hero.cta_primary} onChange={(e) => setHero(content.hero.cta_primary, { cta_primary: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Teks tombol kedua</Label>
                <Input value={content.hero.cta_secondary} onChange={(e) => setHero(content.hero.cta_secondary, { cta_secondary: e.target.value })} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs">Kolase Gambar (maks 3)</Label>
              <div className="mt-1 space-y-1.5">
                {(content.hero.images.length > 0 ? content.hero.images : [{ url: '', alt: '' }]).map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={img.url}
                      onChange={(e) => updateHeroImage(i, 'url', e.target.value)}
                      placeholder="https://.../foto.jpg"
                      className="flex-1"
                    />
                    <Input
                      value={img.alt}
                      onChange={(e) => updateHeroImage(i, 'alt', e.target.value)}
                      placeholder="Alt"
                      className="w-28"
                    />
                    {content.hero.images.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHeroImage(i)} aria-label="Hapus" className="shrink-0">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {content.hero.images.length < 3 && (
                <Button type="button" variant="outline" size="sm" className="mt-1.5" onClick={() => setHero(content.hero.images, { images: [...content.hero.images, { url: '', alt: '' }] })}>
                  <Plus className="h-4 w-4" /> Tambah
                </Button>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">Kosongkan = template default.</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* STATS */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Statistik</CardTitle>
              <CardDescription>Angka sosial proof.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {content.stats.map((stat, i) => (
                <div key={i} className="flex items-end gap-1.5">
                  <Input type="number" value={stat.value} onChange={(e) => updateStatValue(i, parseInt(e.target.value) || 0)} className="w-16" />
                  <Input value={stat.suffix} onChange={(e) => updateStat(i, 'suffix', e.target.value)} className="w-10" placeholder="+" />
                  <Input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} placeholder="Label" className="flex-1" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)} className="shrink-0">
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addStat()}>
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">CTA Akhir</CardTitle>
              <CardDescription>Ajakan sebelum footer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs">Kicker</Label>
                  <Input value={content.cta.kicker} onChange={(e) => setCta(content.cta.kicker, { kicker: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Judul</Label>
                  <Input value={content.cta.title} onChange={(e) => setCta(content.cta.title, { title: e.target.value })} className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Body</Label>
                <Input value={content.cta.body} onChange={(e) => setCta(content.cta.body, { body: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Teks tombol</Label>
                <Input value={content.cta.button_text} onChange={(e) => setCta(content.cta.button_text, { button_text: e.target.value })} className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* STEPS */}
        <AccordionCard title="Cara Kerja" items={content.steps} patch={setContent} targetKey="steps" />

        {/* FEATURES */}
        <AccordionCard title="Fitur" items={content.features} patch={setContent} targetKey="features" />

        {/* FAQ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {content.faq.map((f, i) => (
              <div key={i} className="flex items-start gap-2 rounded-md border border-border p-2.5">
                <div className="flex-1 space-y-1.5">
                  <Input value={f.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} placeholder="Pertanyaan" className="text-sm font-medium" />
                  <textarea value={f.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} rows={2} placeholder="Jawaban" className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(i)} className="shrink-0">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addFaq()}>
              <Plus className="h-4 w-4" /> Tambah FAQ
            </Button>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Footer</CardTitle>
            <CardDescription>Brand, kontak, tagline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Deskripsi brand</Label>
              <Input value={content.footer.description} onChange={(e) => setFooter(content.footer.description, { description: e.target.value })} className="mt-1" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">WhatsApp</Label>
                <Input value={content.footer.whatsapp} onChange={(e) => setFooter(content.footer.whatsapp, { whatsapp: e.target.value })} placeholder="628..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Instagram</Label>
                <Input value={content.footer.instagram} onChange={(e) => setFooter(content.footer.instagram, { instagram: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Website</Label>
                <Input value={content.footer.website} onChange={(e) => setFooter(content.footer.website, { website: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Tagline</Label>
              <Input value={content.footer.tagline} onChange={(e) => setFooter(content.footer.tagline, { tagline: e.target.value })} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan'}
        </Button>
        {loading && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Memuat...
          </span>
        )}
      </div>
    </div>
  );

  function setHero(_prev: unknown, patch: Partial<LandingContent['hero']>) {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, ...patch } }));
  }

  function updateHeroImage(index: number, key: 'url' | 'alt', value: string) {
    setContent((prev) => {
      const images = prev.hero.images.map((img, i) => (i === index ? { ...img, [key]: value } : img));
      return { ...prev, hero: { ...prev.hero, images } };
    });
  }

  function removeHeroImage(index: number) {
    setContent((prev) => ({ ...prev, hero: { ...prev.hero, images: prev.hero.images.filter((_, i) => i !== index) } }));
  }

  function updateStatValue(index: number, value: number) {
    setContent((prev) => ({ ...prev, stats: prev.stats.map((s, i) => (i === index ? { ...s, value } : s)) }));
  }

  function updateStat(index: number, key: 'label' | 'suffix', value: string) {
    setContent((prev) => ({ ...prev, stats: prev.stats.map((s, i) => (i === index ? { ...s, [key]: value } : s)) }));
  }

  function removeStat(index: number) {
    setContent((prev) => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  }

  function addStat() {
    setContent((prev) => ({ ...prev, stats: [...prev.stats, { value: 0, suffix: '+', label: '' }] }));
  }

  function updateFaq(index: number, key: 'q' | 'a', value: string) {
    setContent((prev) => ({ ...prev, faq: prev.faq.map((f, i) => (i === index ? { ...f, [key]: value } : f)) }));
  }

  function removeFaq(index: number) {
    setContent((prev) => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
  }

  function addFaq() {
    setContent((prev) => ({ ...prev, faq: [...prev.faq, { q: '', a: '' }] }));
  }

  function setCta(_prev: unknown, patch: Partial<LandingContent['cta']>) {
    setContent((prev) => ({ ...prev, cta: { ...prev.cta, ...patch } }));
  }

  function setFooter(_prev: unknown, patch: Partial<LandingContent['footer']>) {
    setContent((prev) => ({ ...prev, footer: { ...prev.footer, ...patch } }));
  }
}

interface AccordionCardProps {
  title: string;
  items: LandingItem[];
  patch: Patch;
  targetKey: 'steps' | 'features';
}

function AccordionCard({ title, items, patch, targetKey }: AccordionCardProps) {
  function setItems(next: LandingItem[]) {
    patch((prev) => ({ ...prev, [targetKey]: next }));
  }

  function update(index: number, key: 'title' | 'desc', value: string) {
    setItems(items.map((it, i) => (i === index ? { ...it, [key]: value } : it)));
  }

  function updateIcon(index: number, icon: string) {
    setItems(items.map((it, i) => (i === index ? { ...it, icon } : it)));
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2.5">
            <Label className="h-7 w-7 shrink-0 rounded-md bg-muted text-center text-xs leading-7">{i + 1}</Label>
            <div className="flex-1 space-y-1.5">
              <Input value={item.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Judul" />
              <Select value={item.icon} onChange={(v) => updateIcon(i, v)} />
              <textarea value={item.desc} onChange={(e) => update(i, 'desc', e.target.value)} rows={2} placeholder="Deskripsi" className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))} className="shrink-0">
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { icon: 'Sparkles', title: '', desc: '' }])}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

const ICON_CHOICES = ['Palette', 'MessageCircle', 'CheckCircle', 'Share2', 'Gift', 'QrCode', 'Music', 'Image', 'MapPin', 'Smartphone', 'Sparkles', 'Heart', 'Clock', 'Mail', 'Star', 'Camera'];

function Select({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {ICON_CHOICES.map((icon) => (
        <option key={icon} value={icon}>
          {icon}
        </option>
      ))}
    </select>
  );
}
