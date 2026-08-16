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
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Landing Page</h2>
          <p className="mt-1 text-sm text-gray-500">Konten halaman depan publik — hero, statistik, fitur, FAQ, CTA, footer.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Konten'}
        </Button>
      </div>

      {message && (
        <p className={`mb-4 rounded-md px-3 py-2 text-xs ${message.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </p>
      )}

      <div className="space-y-6">
        {/* HERO */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-[#c9a45c]" /> Hero
            </CardTitle>
            <CardDescription>Titik pembuka, judul, dan kolase 3 gambar di samping teks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Titik pembuka (script)</Label>
              <Input value={content.hero.kicker} onChange={(e) => setHero(content.hero.kicker, { kicker: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Judul — bagian 1</Label>
                <Input value={content.hero.title_a} onChange={(e) => setHero(content.hero.title_a, { title_a: e.target.value })} />
              </div>
              <div>
                <Label>Judul — bagian 2 (italic)</Label>
                <Input value={content.hero.title_b} onChange={(e) => setHero(content.hero.title_b, { title_b: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Subjudul</Label>
              <textarea
                value={content.hero.subtitle}
                onChange={(e) => setHero(content.hero.subtitle, { subtitle: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teks tombol utama</Label>
                <Input value={content.hero.cta_primary} onChange={(e) => setHero(content.hero.cta_primary, { cta_primary: e.target.value })} />
              </div>
              <div>
                <Label>Teks tombol kedua</Label>
                <Input value={content.hero.cta_secondary} onChange={(e) => setHero(content.hero.cta_secondary, { cta_secondary: e.target.value })} />
              </div>
            </div>

            <div>
              <Label>Kolase Gambar (maks 3)</Label>
              <div className="space-y-2">
                {(content.hero.images.length > 0 ? content.hero.images : [{ url: '', alt: '' }]).map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      value={img.url}
                      onChange={(e) => updateHeroImage(i, 'url', e.target.value)}
                      placeholder="https://.../foto.jpg (biarkan kosong untuk tema default)"
                    />
                    <Input
                      value={img.alt}
                      onChange={(e) => updateHeroImage(i, 'alt', e.target.value)}
                      placeholder="Alt teks"
                      className="w-40"
                    />
                    {content.hero.images.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeHeroImage(i)}
                        aria-label="Hapus gambar"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {content.hero.images.length < 3 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setHero(content.hero.images, { images: [...content.hero.images, { url: '', alt: '' }] })}
                >
                  <Plus className="h-4 w-4" /> Tambah Gambar
                </Button>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Jika kosong, landing menampilkan kolase 3 foto template unggulan secara otomatis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* STATS */}
        <Card>
          <CardHeader>
            <CardTitle>Statistik</CardTitle>
            <CardDescription>Angka yang tampil di bilah sosial proof.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.stats.map((stat, i) => (
              <div key={i} className="flex items-end gap-2">
                <div className="flex-1">
                  <Label>Label statistik {i + 1}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={stat.value}
                      onChange={(e) => updateStatValue(i, parseInt(e.target.value) || 0)}
                      className="w-32"
                    />
                    <Input value={stat.suffix} onChange={(e) => updateStat(i, 'suffix', e.target.value)} className="w-16" placeholder="+" />
                  </div>
                </div>
                <Input
                  value={stat.label}
                  onChange={(e) => updateStat(i, 'label', e.target.value)}
                  placeholder="Undangan Dikirim"
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeStat(i)} aria-label="Hapus statistik">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addStat()}>
              <Plus className="h-4 w-4" /> Tambah Statistik
            </Button>
          </CardContent>
        </Card>

        {/* STEPS */}
        <AccordionCard title="Cara Kerja (4 langkah)" items={content.steps} patch={setContent} targetKey="steps" />

        {/* FEATURES */}
        <AccordionCard title="Fitur (kisi keunggulan)" items={content.features} patch={setContent} targetKey="features" />

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ</CardTitle>
            <CardDescription>Pertanyaan yang sering diajukan tamu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {content.faq.map((f, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <Input value={f.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} placeholder="Pertanyaan" className="font-medium" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeFaq(i)} aria-label="Hapus FAQ">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
                <textarea
                  value={f.a}
                  onChange={(e) => updateFaq(i, 'a', e.target.value)}
                  rows={2}
                  placeholder="Jawaban"
                  className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addFaq()}>
              <Plus className="h-4 w-4" /> Tambah FAQ
            </Button>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>CTA Akhir</CardTitle>
            <CardDescription>Bagian ajakan sebelum footer.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label>Titik pembuka</Label>
              <Input value={content.cta.kicker} onChange={(e) => setCta(content.cta.kicker, { kicker: e.target.value })} />
            </div>
            <div>
              <Label>Judul</Label>
              <Input value={content.cta.title} onChange={(e) => setCta(content.cta.title, { title: e.target.value })} />
            </div>
            <div className="col-span-2">
              <Label>Body</Label>
              <Input value={content.cta.body} onChange={(e) => setCta(content.cta.body, { body: e.target.value })} />
            </div>
            <div>
              <Label>Teks tombol</Label>
              <Input value={content.cta.button_text} onChange={(e) => setCta(content.cta.button_text, { button_text: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* FOOTER */}
        <Card>
          <CardHeader>
            <CardTitle>Footer</CardTitle>
            <CardDescription>Deskripsi brand, kontak, dan tagline.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Deskripsi brand</Label>
              <Input value={content.footer.description} onChange={(e) => setFooter(content.footer.description, { description: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>WhatsApp (angka)</Label>
                <Input value={content.footer.whatsapp} onChange={(e) => setFooter(content.footer.whatsapp, { whatsapp: e.target.value })} placeholder="628..." />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input value={content.footer.instagram} onChange={(e) => setFooter(content.footer.instagram, { instagram: e.target.value })} />
              </div>
              <div>
                <Label>Website</Label>
                <Input value={content.footer.website} onChange={(e) => setFooter(content.footer.website, { website: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={content.footer.tagline} onChange={(e) => setFooter(content.footer.tagline, { tagline: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={saving || loading} className="w-full sm:w-auto">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Menyimpan...' : 'Simpan Konten'}
        </Button>
      </div>

      {loading && (
        <p className="mt-4 flex items-center gap-2 text-sm text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Memuat konten...
        </p>
      )}
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
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-md border border-border p-3">
            <div className="flex items-center gap-2">
              <Label className="h-8 w-8 shrink-0 rounded-md bg-muted text-center leading-8">{i + 1}</Label>
              <Input value={item.title} onChange={(e) => update(i, 'title', e.target.value)} placeholder="Judul" />
              <Button type="button" variant="ghost" size="icon" onClick={() => setItems(items.filter((_, j) => j !== i))} aria-label="Hapus">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Select value={item.icon} onChange={(v) => updateIcon(i, v)} />
            </div>
            <textarea
              value={item.desc}
              onChange={(e) => update(i, 'desc', e.target.value)}
              rows={2}
              placeholder="Deskripsi"
              className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
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
      className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {ICON_CHOICES.map((icon) => (
        <option key={icon} value={icon}>
          {icon}
        </option>
      ))}
    </select>
  );
}