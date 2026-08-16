'use client';

import { useState } from 'react';
import { Type, Clapperboard } from 'lucide-react';
import ColorPicker from '@/components/builder/color-picker';
import { OrnamentArt, ORNAMENT_CATEGORIES, ORNAMENT_LABELS, type OrnamentKey } from '@/components/builder/ornaments';
import MediaLibrary from '@/components/dashboard/media-library';
import MusicPreview from '@/components/builder/music-preview';
import ImageCropTool from '@/components/builder/image-crop-tool';
import { useBuilderStore } from '@/store/builder-store';
import { RELIGIONS, type ReligionKey } from '@/lib/religions';
import { getQuotesByReligion, RELIGION_LABELS, type WeddingQuote } from '@/lib/quotes';
import type { Block, BlockProps, DecorAsset, BankAccount } from '@/lib/types';

const FONTS = [
  'Playfair Display',
  'Cormorant Garamond',
  'Montserrat',
  'Quicksand',
  'Cinzel',
  'Marcellus',
  'Great Vibes',
  'Lora',
  'Jost',
  'Poppins',
  'Nunito Sans',
  'Inter',
  'Lato',
  'Karla',
  'Dancing Script',
  'Caveat',
  'Pacifico',
  'Raleway',
  'DM Serif Display',
  'EB Garamond',
  'Alex Brush',
  'Parisienne',
  'Allura',
  'Tangerine',
  'Satisfy',
  'Cookie',
  'Bad Script',
  'Pinyon Script',
  'Sacramento',
  'Amatic SC',
  'Bebas Neue',
  'Oswald',
  'Roboto Condensed',
  'Work Sans',
  'Source Serif 4',
  'Libre Baskerville',
  'Merriweather',
  'Bodoni Moda',
  'Prata',
  'Playfair Display SC',
  'Josefin Sans',
  'Cormorant Infant',
  'Cormorant Upright',
  'Tenor Sans',
  'Spectral',
  'Fraunces',
  'Yeseva One',
  'Cardo'
];

const TITLE_PROPS: Record<string, { label: string; multiline?: boolean; url?: boolean; labelText?: string }[]> = {
  Hero: [
    { label: 'caption' },
    { label: 'groom' },
    { label: 'bride' },
    { label: 'date' },
    { label: 'place' },
    { label: 'bg_image' }
  ],
  Couple: [
    { label: 'introduction', multiline: true },
    { label: 'bismillah', multiline: true },
    { label: 'groom' },
    { label: 'groom_parents' },
    { label: 'bride' },
    { label: 'bride_parents' },
    { label: 'quote', multiline: true }
  ],
  Countdown: [{ label: 'title' }, { label: 'target_date' }],
  Story: [{ label: 'title' }, { label: 'subtitle' }],
  EventDetail: [
    { label: 'title' },
    { label: 'date' },
    { label: 'time' },
    { label: 'location' },
    { label: 'address', multiline: true },
    { label: 'maps_url', url: true, labelText: 'Link Google Maps' },
    { label: 'live_url', url: true, labelText: 'Link Siaran Langsung' }
  ],
  Gallery: [{ label: 'title' }],
  RSVP: [
    { label: 'title' },
    { label: 'note', multiline: true },
    { label: 'button_text' },
    { label: 'success_message', multiline: true }
  ],
  Envelope: [{ label: 'title' }, { label: 'note', multiline: true }],
  GiftList: [{ label: 'title' }, { label: 'note', multiline: true }],
  Maps: [{ label: 'title' }, { label: 'address' }, { label: 'embed_url', url: true, labelText: 'Link Google Maps' }],
  Thanks: [
    { label: 'title' },
    { label: 'message', multiline: true },
    { label: 'closing' },
    { label: 'names' }
  ],
  Divider: [],
  Text: [{ label: 'text', multiline: true }],
  Photo: [{ label: 'image' }, { label: 'caption' }],
  Quote: [
    { label: 'religion', labelText: 'Agama (untuk preset kutipan)' },
    { label: 'original', multiline: true, labelText: 'Teks Asli / Ayat' },
    { label: 'latin', multiline: true, labelText: 'Latin / Bacaan' },
    { label: 'translation', multiline: true, labelText: 'Terjemahan' },
    { label: 'reference', labelText: 'Referensi' }
  ],
  LiveStreaming: [{ label: 'title' }, { label: 'embed_url', url: true, labelText: 'Link YouTube/Vimeo' }, { label: 'note', multiline: true }],
  Empty: []
};

const VARIANTS: Partial<Record<string, { key: string; options: string[] }>> = {
  Hero: { key: 'variant', options: ['center', 'left'] },
  Couple: { key: 'variant', options: ['vertical', 'side'] },
  Countdown: { key: 'variant', options: ['circles', 'cards', 'line'] },
  EventDetail: { key: 'variant', options: ['card', 'band'] },
  Divider: { key: 'variant', options: ['line', 'dots', 'diamond', 'hearts', 'leaves'] },
  Thanks: { key: 'variant', options: ['center', 'elegant', 'minimal'] },
  Quote: { key: 'variant', options: ['center', 'card'] },
  Text: { key: 'variant', options: ['plain', 'card', 'accent'] },
  Story: { key: 'variant', options: ['timeline', 'cards', 'minimal'] },
  Maps: { key: 'variant', options: ['full', 'card'] },
  LiveStreaming: { key: 'variant', options: ['full', 'minimal'] },
  RSVP: { key: 'variant', options: ['centered', 'card', 'minimal'] },
  Envelope: { key: 'variant', options: ['standard', 'minimal'] },
  GiftList: { key: 'variant', options: ['grid', 'list'] },
};

const GALLERY_LAYOUTS: { key: string; label: string; desc: string }[] = [
  { key: 'grid', label: 'Grid', desc: 'Susunan kolom 2 dengan foto besar' },
  { key: 'grid3', label: 'Grid 3 Kolom', desc: 'Kolom 3 dengan foto persegi rapi' },
  { key: 'masonry', label: 'Masonry', desc: 'Kolom menurun dengan tinggi beragam' },
  { key: 'mosaic', label: 'Kolase', desc: 'Kuadran mosaik dengan foto besar pertama' },
  { key: 'polaroid', label: 'Polaroid', desc: 'Foto dengan bingkai seperti foto kenangan' },
  { key: 'arch', label: 'Lengkung (Arch)', desc: 'Foto utama lengkung atas — ikonik undangan Indonesia' },
  { key: 'column', label: 'Ke Bawah', desc: 'Foto tersusun menurun penuh lebar' },
  { key: 'carousel', label: 'Carousel Otomatis', desc: 'Slide berganti otomatis' }
];

const GALLERY_ANIMATIONS = [
  ['fade', 'Fade'],
  ['zoom', 'Zoom In'],
  ['zoom-out', 'Zoom Out'],
  ['slide-left', 'Slide Kiri'],
  ['slide-right', 'Slide Kanan'],
  ['slide-up', 'Slide Atas'],
  ['slide-down', 'Slide Bawah'],
  ['flip', 'Flip 3D'],
  ['flip-x', 'Flip Vertikal'],
  ['blur', 'Blur'],
  ['rise', 'Muncul Naik'],
  ['swing', 'Ayun'],
  ['pop', 'Pop'],
  ['ken-burns', 'Ken Burns'],
  ['drop', 'Drop'],
  ['reveal', 'Reveal Kanan'],
  ['reveal-up', 'Reveal Atas'],
  ['rotate', 'Rotate'],
  ['shrink', 'Shrink'],
  ['blur-up', 'Blur + Naik']
] as const;

const GRADIENTS: { name: string; value: string }[] = [
  { name: 'Emerald Khaki', value: 'linear-gradient(160deg, #046A38 0%, #B5A27C 60%, #F7F5EF 130%)' },
  { name: 'Emerald Muda', value: 'linear-gradient(160deg, #7C9885 0%, #A9B7A6 55%, #F7F6F2 130%)' },
  { name: 'Gold Muda', value: 'linear-gradient(160deg, #D4AF37 0%, #FAF6EF 70%, #F7F5EF 130%)' },
  { name: 'Biru Malam', value: 'linear-gradient(160deg, #1F3A5F 0%, #C9A227 120%)' },
  { name: 'Sage Hijau', value: 'linear-gradient(160deg, #324F43 0%, #A9C5B4 100%)' },
  { name: 'Bali Tropis', value: 'linear-gradient(160deg, #2F5D50 0%, #C77B4E 100%)' },
  { name: 'Terracotta', value: 'linear-gradient(160deg, #B0413E 0%, #F6D365 120%)' },
  { name: 'Olive', value: 'linear-gradient(160deg, #606C38 0%, #DDA15E 120%)' }
];

/** Generate gradient presets based on theme colors */
function makeThemeGradients(primary: string, secondary: string, background: string): { name: string; value: string }[] {
  return [
    { name: 'Primer → Sekunder', value: `linear-gradient(160deg, ${primary} 0%, ${secondary} 100%)` },
    { name: 'Primer → Latar', value: `linear-gradient(160deg, ${primary} 0%, ${background} 120%)` },
    { name: 'Sekunder → Latar', value: `linear-gradient(160deg, ${secondary} 0%, ${background} 100%)` },
    { name: 'Latar → Primer', value: `linear-gradient(160deg, ${background} 0%, ${primary} 120%)` },
    { name: 'Primer solid', value: `linear-gradient(160deg, ${primary} 0%, ${primary} 100%)` },
    { name: 'Sekunder solid', value: `linear-gradient(160deg, ${secondary} 0%, ${secondary} 100%)` },
  ];
}

const SECTION_TRIGGERS: { value: string; label: string }[] = [
  { value: '', label: 'Mulai di awal halaman' },
  { value: 'Hero', label: 'Saat masuk Hero' },
  { value: 'Couple', label: 'Saat masuk Mempelai' },
  { value: 'EventDetail', label: 'Saat masuk Detail Acara' },
  { value: 'Story', label: 'Saat masuk Our Story' },
  { value: 'Gallery', label: 'Saat masuk Galeri' },
  { value: 'Maps', label: 'Saat masuk Maps' },
  { value: 'Thanks', label: 'Saat masuk Penutup' }
];

export default function PropertiesPanel() {
  const canvas = useBuilderStore((s) => s.canvas);
  const selectedBlockId = useBuilderStore((s) => s.selectedBlockId);
  const block = canvas.blocks.find((b) => b.id === selectedBlockId) ?? null;
  const setTheme = useBuilderStore((s) => s.setTheme);
  const setBlockProps = useBuilderStore((s) => s.setBlockProps);
  const setSettings = useBuilderStore((s) => s.setSettings);
  const setBlockLayout = useBuilderStore((s) => s.setBlockLayout);
  const setBlockStyle = useBuilderStore((s) => s.setBlockStyle);
  const clearBlockStyle = useBuilderStore((s) => s.clearBlockStyle);
  const setBlockTextSize = useBuilderStore((s) => s.setBlockTextSize);
  const setBlockTextFont = useBuilderStore((s) => s.setBlockTextFont);
  const setSelectedText = useBuilderStore((s) => s.setSelectedText);
  const selectedText = useBuilderStore((s) => s.selectedText);
  const setFlow = useBuilderStore((s) => s.setFlow);
  const setReligion = useBuilderStore((s) => s.setReligion);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'hero' | 'gallery' | 'bg' | 'photo' | 'decor' | 'couple_groom' | 'couple_bride' | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  function updateAccount(blockId: string, index: number, key: 'bank_name' | 'account_number' | 'account_holder', value: string) {
    const b = canvas.blocks.find((x) => x.id === blockId);
    const accounts = Array.isArray(b?.props.accounts) ? (b.props.accounts as BankAccount[]) : [];
    const next = accounts.map((a, i) => (i === index ? { ...a, [key]: value } : a));
    setBlockProps(blockId, { accounts: next });
  }
  const selectedDecor = useBuilderStore((s) => s.selectedDecor);
  const updateDecor = useBuilderStore((s) => s.updateDecor);
  const removeDecor = useBuilderStore((s) => s.removeDecor);
  const selectDecor = useBuilderStore((s) => s.selectDecor);

  const activeDecor: { block: Block; asset: DecorAsset } | null = (() => {
    if (!selectedDecor) return null;
    const [bid, aid] = selectedDecor.split('::');
    const b = canvas.blocks.find((x) => x.id === bid);
    const asset = b?.decor?.find((d) => d.id === aid);
    return b && asset ? { block: b, asset } : null;
  })();

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-[#e7ddcc] bg-white">
      <div className="border-b border-[#e7ddcc] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#2b2620]">{block ? `Edit ${block.type}` : 'Pengaturan Halaman'}</h3>
      </div>

      <div className="flex-1 space-y-5 overflow-auto p-4">
        {!block && (
          <>
            <Section
              title="Warna Tema"
              desc="Menggantikan token warna global"
              render={
                <>
                  <ColorPicker label="Primary" value={canvas.theme.primary} onChange={(c) => setTheme({ primary: c })} />
                  <ColorPicker label="Secondary" value={canvas.theme.secondary} onChange={(c) => setTheme({ secondary: c })} />
                  <ColorPicker label="Background" value={canvas.theme.background} onChange={(c) => setTheme({ background: c })} />
                  <ColorPicker label="Teks" value={canvas.theme.text} onChange={(c) => setTheme({ text: c })} />
                </>
              }
            />

            <Section
              title="Tipografi"
              desc="Font heading dan body"
              render={
                <div className="space-y-3">
                  <FontSelect label="Font Heading" value={canvas.theme.font_heading} onChange={(v) => setTheme({ font_heading: v })} />
                  <FontSelect label="Font Body" value={canvas.theme.font_body} onChange={(v) => setTheme({ font_body: v })} />
                </div>
              }
            />

            <OrnamentThemePicker value={canvas.theme.ornament} onChange={(v) => setTheme({ ornament: v })} />

            <Section
              title="Penataan"
              render={
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4a443c]">Mode Kanvas</label>
                    <div className="mt-1 flex gap-2">
                      {(['stack', 'free'] as const).map((f) => (
                        <button
                          key={f}
                          onClick={() => setFlow(f)}
                          className={`flex-1 rounded-md border px-2 py-1.5 text-xs capitalize ${
                            (canvas.flow ?? 'stack') === f ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'
                          }`}
                        >
                          {f === 'stack' ? 'Vertikal' : 'Bebas'}
                        </button>
                      ))}
                    </div>
                    <p className="mt-1 text-[11px] text-[#8a7a66]">
                      {canvas.flow === 'free'
                        ? 'Seret elemen ke posisi bebas di kanvas dan atur lebarnya.'
                        : 'Elemen tersusun vertikal, bisa diurutkan dengan seret.'}
                    </p>
                  </div>
                  <label className="block text-xs font-medium text-[#4a443c]">Gaya Hero</label>
                  <div className="flex gap-2">
                    {(['image', 'solid', 'gradient'] as const).map((h) => (
                      <button
                        key={h}
                        onClick={() => setTheme({ hero_style: h })}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs capitalize ${
                          canvas.theme.hero_style === h ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                <label className="block text-xs font-medium text-[#4a443c]">Bingkai Undangan</label>
                  <div className="flex flex-wrap gap-2">
                    {(['none', 'classic', 'double', 'corner', 'arch', 'floral', 'thick', 'dashed', 'ornate'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setTheme({ frame: f })}
                        className={`rounded-md border px-2 py-1.5 text-xs capitalize ${
                          (canvas.theme.frame ?? 'none') === f
                            ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                            : 'border-[#e0d6c2] text-[#6b5f4d]'
                        }`}
                      >
                        {f === 'none' ? 'Tanpa' : f}
                      </button>
                    ))}
                  </div>
                  <label className="mt-1 flex items-center gap-2 text-xs font-medium text-[#4a443c]">
                    <input
                      type="checkbox"
                      checked={canvas.theme.card_style === true}
                      onChange={(e) => setTheme({ card_style: e.target.checked })}
                      className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
                    />
                    Gaya Kartu (tiap section berbentuk card)
                  </label>
                  {canvas.theme.card_style && (
                    <>
                      <div className="mt-2">
                        <label className="mb-1 block text-xs font-medium text-[#4a443c]">Gaya Kartu</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { value: 'shadow', label: 'Bayangan' },
                            { value: 'outline', label: 'Garis' },
                            { value: 'glass', label: 'Kaca' },
                            { value: 'minimal', label: 'Minimal' },
                            { value: 'elevated', label: 'Tinggi' },
                            { value: 'flat', label: 'Datar' },
                          ].map((v) => (
                            <button
                              key={v.value}
                              onClick={() => setTheme({ card_variant: v.value })}
                              className={`rounded-md border px-2 py-1 text-[10px] ${
                                (canvas.theme.card_variant ?? 'shadow') === v.value
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d]'
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="mb-1 block text-xs font-medium text-[#4a443c]">Animasi Masuk</label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { value: 'fade', label: 'Fade' },
                            { value: 'slide', label: 'Slide' },
                            { value: 'zoom', label: 'Zoom' },
                            { value: 'blur', label: 'Blur' },
                            { value: 'rise', label: 'Naik' },
                          ].map((v) => (
                            <button
                              key={v.value}
                              onClick={() => setTheme({ card_entrance: v.value })}
                              className={`rounded-md border px-2 py-1 text-[10px] ${
                                (canvas.theme.card_entrance ?? 'fade') === v.value
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d]'
                              }`}
                            >
                              {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <p className="mt-1 text-[11px] text-[#8a7a66]">
                    Bingkai dekoratif yang mengelilingi seluruh undangan. Sesuaikan dengan gaya tema Anda.
                  </p>
                </div>
              }
            />

            <Section
              title="Musik Latar"
              desc="Dukung file MP3 atau tautan YouTube. Bisa putar otomatis, mulai dari detik tertentu, atau saat masuk section tertentu."
              render={
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#4a443c]">Tautan Musik (MP3 / YouTube)</label>
                    <input
                      type="url"
                      value={canvas.settings.music_url}
                      onChange={(e) => setSettings({ music_url: e.target.value })}
                      placeholder="https://...mp3  atau  https://youtu.be/xxxx"
                      className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs font-medium text-[#4a443c]">
                    <input
                      type="checkbox"
                      checked={canvas.settings.music_autoplay ?? true}
                      onChange={(e) => setSettings({ music_autoplay: e.target.checked })}
                      className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
                    />
                    Putar otomatis
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a443c]">Mulai detik ke-</label>
                      <input
                        type="number"
                        min={0}
                        value={canvas.settings.music_offset_sec ?? 0}
                        onChange={(e) => setSettings({ music_offset_sec: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a443c]">Mulai saat section</label>
                      <select
                        value={canvas.settings.music_on_section ?? ''}
                        onChange={(e) => setSettings({ music_on_section: e.target.value })}
                        className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                      >
                        {SECTION_TRIGGERS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {canvas.settings.music_url.trim() && (
                    <MusicPreview
                      url={canvas.settings.music_url}
                      offsetSec={canvas.settings.music_offset_sec ?? 0}
                      onOffsetChange={(s) => setSettings({ music_offset_sec: s })}
                    />
                  )}
                  <p className="text-[11px] leading-relaxed text-[#8a7a66]">
                    Autoplay pada beberapa browser baru berfungsi setelah ada interaksi; tombol musik tetap tersedia di pojok kiri bawah undangan.
                  </p>
                </div>
              }
            />

            <Section
              title="Absensi Hari-H (QR Check-in)"
              desc="Tampilkan bagian absen dengan QR di undangan. Tamu memindai saat tiba di venue."
              render={
                <label className="flex items-center justify-between gap-3 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-[#4a443c]">Aktifkan Absensi QR</p>
                    <p className="text-[11px] text-[#8a7a66]">Data masuk ke daftar tamu hari-H Anda.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ checkin_enabled: canvas.settings.checkin_enabled === false })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      canvas.settings.checkin_enabled !== false ? 'bg-[#c9a45c]' : 'bg-[#e0d6c2]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        canvas.settings.checkin_enabled !== false ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </label>
              }
            />

            <Section
              title="Cover & Pembuka"
              desc="Layar fullscreen 'Buka Undangan' sebelum konten undangan"
              render={
                <label className="flex items-center justify-between gap-3 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-[#4a443c]">Tampilkan Cover</p>
                    <p className="text-[11px] text-[#8a7a66]">Fullscreen overlay dengan nama mempelai & tombol Buka Undangan. Musik mulai setelah diklik.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings({ show_cover: canvas.settings.show_cover === false })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      canvas.settings.show_cover !== false ? 'bg-[#c9a45c]' : 'bg-[#e0d6c2]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                        canvas.settings.show_cover !== false ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </label>
              }
            />

            <Section
              title="Agama & Ucapan"
              desc="Menyesuaikan pembuka/penutup undangan dan preset ucapan tamu"
              render={
                <div>
                  <label className="block text-xs font-medium text-[#4a443c]">Agama Undangan</label>
                  <div className="mt-1 grid grid-cols-2 gap-1.5">
                    {RELIGIONS.map((r) => (
                      <button
                        key={r.key}
                        onClick={() => setReligion(r.key)}
                        className={`rounded-md border px-2 py-1.5 text-xs ${
                          (canvas.settings.religion ?? 'islam') === r.key
                            ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                            : 'border-[#e0d6c2] text-[#6b5f4d] hover:bg-[#faf7f2]'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#8a7a66]">
                    Teks pembuka &amp; penutup yang masih bawaan akan menyesuaikan agama. Teks yang sudah diedit manual tidak diubah.
                  </p>
                </div>
              }
            />
          </>
        )}

        {block && (
          <>
            <Section
              title="Konten"
              render={
                <div className="space-y-3">
                  {TITLE_PROPS[block.type].map((prop) => (
                    <Field
                      key={prop.label}
                      blockId={block.id}
                      propKey={prop.label}
                      label={prop.labelText ?? humanize(prop.label)}
                      value={(block.props[prop.label] as string) ?? ''}
                      multiline={prop.multiline}
                      url={prop.url}
                      onChange={(v) => setBlockProps(block.id, { [prop.label]: v })}
                    />
                  ))}
                  {block.type === 'EventDetail' && (
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-[#4a443c]">
                        <input
                          type="checkbox"
                          checked={block.props.show_live !== false}
                          onChange={(e) => setBlockProps(block.id, { show_live: e.target.checked })}
                          className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
                        />
                        Tampilkan tombol Siaran Langsung
                      </label>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Ikon</p>
                        <div className="flex gap-2">
                          {(['Gem', 'Sparkles'] as const).map((icon) => (
                            <button
                              key={icon}
                              onClick={() => setBlockProps(block.id, { icon })}
                              className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${
                                (block.props.icon as string) === icon
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d]'
                              }`}
                            >
                              {icon === 'Gem' ? 'Diamond' : 'Sparkle'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {block.type === 'Hero' && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-[#4a443c]">Foto Latar Hero</p>
                      <p className="mb-2 text-[10px] text-[#8a7a66]">Gambar utama yang menutupi seluruh bagian hero</p>
                      <button
                        onClick={() => {
                          setMediaMode('hero');
                          setMediaOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                      >
                        {block.props.bg_image ? 'Ganti Foto Hero' : 'Pilih Foto Hero'}
                      </button>
                      {block.props.bg_image && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#4a443c]">Ukuran</label>
                            <select
                              value={(block.props.bg_fit as string) || 'cover'}
                              onChange={(e) => setBlockProps(block.id, { bg_fit: e.target.value })}
                              className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                            >
                              <option value="cover">Penuhi (cover)</option>
                              <option value="contain">Utuh (contain)</option>
                            </select>
                          </div>
                           <div>
                            <label className="mb-1 block text-xs font-medium text-[#4a443c]">Posisi</label>
                            {['center', 'top', 'bottom', 'left', 'right'].includes((block.props.bg_position as string) || 'center') ? (
                              <select
                                value={(block.props.bg_position as string) || 'center'}
                                onChange={(e) => setBlockProps(block.id, { bg_position: e.target.value })}
                                className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                              >
                                <option value="center">Tengah</option>
                                <option value="top">Atas</option>
                                <option value="bottom">Bawah</option>
                                <option value="left">Kiri</option>
                                <option value="right">Kanan</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={(block.props.bg_position as string) || 'center'}
                                onChange={(e) => setBlockProps(block.id, { bg_position: e.target.value })}
                                className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                placeholder="center"
                              />
                            )}
                          </div>
                        </div>
                      )}
                      {block.props.bg_image && (
                        <button
                          onClick={() => setCropOpen(true)}
                          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-[#c9a45c]/40 bg-[#c9a45c]/5 px-3 py-2 text-xs font-medium text-[#c9a45c] hover:bg-[#c9a45c]/10"
                        >
                          ✂️ Crop & Posisi Gambar
                        </button>
                      )}
                    </div>
                  )}
                  {block.type === 'Hero' && (
                    <label className="flex items-center gap-2 text-xs font-medium text-[#4a443c]">
                      <input
                        type="checkbox"
                        checked={block.props.show_ornament !== false}
                        onChange={(e) => setBlockProps(block.id, { show_ornament: e.target.checked })}
                        className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
                      />
                      Tampilkan Ornamen
                    </label>
                  )}
                  {block.type === 'Hero' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a443c]">Warna Teks Hero</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={(block.props.text_color as string) || '#ffffff'}
                          onChange={(e) => setBlockProps(block.id, { text_color: e.target.value })}
                          className="h-8 w-8 cursor-pointer rounded-md border border-[#e0d6c2]"
                        />
                        <span className="text-xs text-[#8a7a66]">
                          {(block.props.text_color as string) || '#ffffff'} (default: putih)
                        </span>
                        {(block.props.text_color as string) && (
                          <button
                            onClick={() => setBlockProps(block.id, { text_color: '' })}
                            className="text-[10px] text-red-400 hover:text-red-600"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {VARIANTS[block.type] && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-[#4a443c]">Gaya</label>
                      <div className="flex gap-2">
                        {VARIANTS[block.type]!.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setBlockProps(block.id, { [VARIANTS[block.type]!.key]: opt })}
                            className={`flex-1 rounded-md border px-2 py-1.5 text-xs capitalize ${
                              (block.props[VARIANTS[block.type]!.key] as string) === opt
                                ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                : 'border-[#e0d6c2] text-[#6b5f4d]'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {block.type === 'Quote' && <QuotePicker blockId={block.id} props={block.props} setBlockProps={setBlockProps} />}
                  {block.type === 'Couple' && (
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Bingkai Foto Mempelai</p>
                        <div className="flex flex-wrap gap-2">
                          {(['circle', 'arch', 'tilt', 'frame', 'none'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => setBlockProps(block.id, { photo_shape: s })}
                              className={`rounded-md border px-2 py-1.5 text-xs capitalize ${
                                ((block.props.photo_shape as string) || 'circle') === s
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d]'
                              }`}
                            >
                              {s === 'circle' ? 'Bulat' : s === 'arch' ? 'Lengkung' : s === 'tilt' ? 'Miring' : s === 'frame' ? 'Bingkai' : 'Tanpa'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Foto Pria</p>
                        <button
                          onClick={() => {
                            setMediaMode('couple_groom');
                            setMediaOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                        >
                          {block.props.groom_photo ? 'Ganti Foto Pria' : 'Pilih Foto Pria'}
                        </button>
                        {block.props.groom_photo && (
                          <button
                            onClick={() => setBlockProps(block.id, { groom_photo: '' })}
                            className="mt-1 text-[10px] text-red-400 hover:text-red-600"
                          >
                            Hapus foto
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Foto Wanita</p>
                        <button
                          onClick={() => {
                            setMediaMode('couple_bride');
                            setMediaOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                        >
                          {block.props.bride_photo ? 'Ganti Foto Wanita' : 'Pilih Foto Wanita'}
                        </button>
                        {block.props.bride_photo && (
                          <button
                            onClick={() => setBlockProps(block.id, { bride_photo: '' })}
                            className="mt-1 text-[10px] text-red-400 hover:text-red-600"
                          >
                            Hapus foto
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {block.type === 'Photo' && (
                    <div className="space-y-2">
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Gambar</p>
                        <button
                          onClick={() => {
                            setMediaMode('photo');
                            setMediaOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                        >
                          {block.props.image ? 'Ganti Gambar' : 'Pilih Gambar'}
                        </button>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-medium text-[#4a443c]">
                        <input
                          type="checkbox"
                          checked={block.props.rounded === true}
                          onChange={(e) => setBlockProps(block.id, { rounded: e.target.checked })}
                          className="h-4 w-4 rounded border-[#e0d6c2] accent-[#c9a45c]"
                        />
                        Sudut Membulat
                      </label>
                    </div>
                  )}
                  {block.type === 'Gallery' && (
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Tata Letak Foto</p>
                        <div className="flex flex-col gap-1.5">
                          {GALLERY_LAYOUTS.map((l) => (
                            <button
                              key={l.key}
                              onClick={() => setBlockProps(block.id, { variant: l.key })}
                              className={`rounded-md border px-3 py-1.5 text-left text-xs ${
                                (block.props.variant as string) === l.key
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d] hover:bg-[#faf7f2]'
                              }`}
                            >
                              <span className="block font-semibold">{l.label}</span>
                              <span className={`block text-[10px] ${(block.props.variant as string) === l.key ? 'text-white/80' : 'text-[#8a7a66]'}`}>
                                {l.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                      {(block.props.variant as string) === 'carousel' && (
                        <div>
                          <label className="mb-1 block text-xs font-medium text-[#4a443c]">Interval (detik)</label>
                          <input
                            type="number"
                            min={1}
                            value={Number(block.props.interval_sec) || 3}
                            onChange={(e) => setBlockProps(block.id, { interval_sec: Math.max(1, Number(e.target.value) || 1) })}
                            className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                          />
                        </div>
                      )}
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Animasi Foto</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {GALLERY_ANIMATIONS.map(([value, label]) => (
                            <button
                              key={value}
                              onClick={() => setBlockProps(block.id, { animation: value })}
                              className={`rounded-md border px-2 py-1.5 text-xs ${
                                (block.props.animation as string) === value
                                  ? 'border-[#c9a45c] bg-[#c9a45c] text-white'
                                  : 'border-[#e0d6c2] text-[#6b5f4d] hover:bg-[#faf7f2]'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium text-[#4a443c]">Galeri ({Array.isArray(block.props.images) ? block.props.images.length : 0})</p>
                        {Array.isArray(block.props.images) && block.props.images.length > 0 && (
                          <div className="mb-2 grid grid-cols-4 gap-1.5">
                            {(block.props.images as string[]).map((src, i) => (
                              <div key={i} className="group relative aspect-square overflow-hidden rounded-md border border-[#e0d6c2]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="" className="h-full w-full object-cover" />
                                <button
                                  onClick={() =>
                                    setBlockProps(block.id, { images: (block.props.images as string[]).filter((_, j) => j !== i) })
                                  }
                                  aria-label="Hapus foto"
                                  className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setMediaMode('gallery');
                            setMediaOpen(true);
                          }}
                          className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                        >
                          Tambah Gambar
                        </button>
                      </div>
                    </div>
                  )}
                  {block.type === 'Story' && <StoryChapters blockId={block.id} props={block.props} setBlockProps={setBlockProps} />}
                  {block.type === 'Envelope' && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-[#4a443c]">Rekening Amplop</p>
                      {Array.isArray(block.props.accounts) && (block.props.accounts as BankAccount[]).length > 0 && (
                        <div className="space-y-2">
                          {(block.props.accounts as BankAccount[]).map(
                            (acc, i) => (
                              <div key={i} className="rounded-md border border-[#e0d6c2] bg-[#faf7f2] p-2">
                                <div className="mb-1.5 flex items-center justify-between">
                                  <span className="text-[11px] font-medium text-[#8a7a66]">Rekening {i + 1}</span>
                                  <button
                                    onClick={() =>
                                      setBlockProps(block.id, {
                                        accounts: (block.props.accounts as BankAccount[]).filter((_, j) => j !== i)
                                      })
                                    }
                                    className="text-[11px] font-medium text-red-600 hover:underline"
                                  >
                                    Hapus
                                  </button>
                                </div>
                                <div className="space-y-1.5">
                                  <input
                                    value={acc.bank_name ?? ''}
                                    onChange={(e) => updateAccount(block.id, i, 'bank_name', e.target.value)}
                                    placeholder="Nama bank / e-wallet"
                                    className="w-full rounded-md border border-[#e0d6c2] bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                  />
                                  <input
                                    value={acc.account_number ?? ''}
                                    onChange={(e) => updateAccount(block.id, i, 'account_number', e.target.value)}
                                    placeholder="Nomor rekening"
                                    className="w-full rounded-md border border-[#e0d6c2] bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                  />
                                  <input
                                    value={acc.account_holder ?? ''}
                                    onChange={(e) => updateAccount(block.id, i, 'account_holder', e.target.value)}
                                    placeholder="Atas nama"
                                    className="w-full rounded-md border border-[#e0d6c2] bg-white px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                  />
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setBlockProps(block.id, {
                            accounts: [...(Array.isArray(block.props.accounts) ? (block.props.accounts as BankAccount[]) : []), {
                              bank_name: '',
                              account_number: '',
                              account_holder: ''
                            }]
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                      >
                        + Tambah Rekening
                      </button>
                    </div>
                  )}
                  {block.type === 'GiftList' &&
                    (() => {
                      const current = block;
                      const items = Array.isArray(current.props.items) ? (current.props.items as string[]) : [];
                      function setItem(i: number, v: string) {
                        const next = [...items];
                        next[i] = v;
                        setBlockProps(current.id, { items: next });
                      }
                      function addItem() {
                        setBlockProps(current.id, { items: [...items, ''] });
                      }
                      function removeItem(i: number) {
                        setBlockProps(current.id, { items: items.filter((_, j) => j !== i) });
                      }
                      return (
                        <div className="space-y-3">
                          <p className="text-xs font-medium text-[#4a443c]">Item Kado</p>
                          <div className="space-y-2">
                            {items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <input
                                  value={item}
                                  onChange={(e) => setItem(i, e.target.value)}
                                  placeholder={`Item ${i + 1}`}
                                  className="w-full rounded border border-[#e0d6c2] bg-[#faf7f2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#c9a45c]"
                                />
                                <button
                                  onClick={() => removeItem(i)}
                                  className="shrink-0 text-[11px] font-medium text-red-600 hover:underline"
                                >
                                  Hapus
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={addItem}
                            className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                          >
                            + Tambah Item
                          </button>
                        </div>
                      );
                    })()}
                  <Section
                    title="Warna & Background Section"
                    desc="Override warna teks, latar, atau gambar untuk section ini saja"
                    render={
                        <div className="space-y-3">
                          <ColorPicker
                            label="Warna Teks"
                            value={block.style?.textColor ?? ''}
                            onChange={(c) => setBlockStyle(block.id, { textColor: c })}
                          />
                          <ColorPicker
                            label="Warna Latar"
                            value={block.style?.bgColor ?? ''}
                            onChange={(c) => setBlockStyle(block.id, { bgColor: c })}
                          />
                           <div>
                            <p className="mb-1 text-xs font-medium text-[#4a443c]">Gradien Latar</p>
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                onClick={() => setBlockStyle(block.id, { bgGradient: undefined })}
                                className={`rounded-md border px-1 py-2 text-[10px] ${!block.style?.bgGradient ? 'border-[#c9a45c] bg-[#c9a45c]/10 text-[#8a6d2f]' : 'border-[#e0d6c2] text-[#8a7a66]'}`}
                              >
                                Tidak ada
                              </button>
                              {makeThemeGradients(canvas.theme.primary, canvas.theme.secondary, canvas.theme.background).map((g) => (
                                <button
                                  key={g.name}
                                  onClick={() => setBlockStyle(block.id, { bgGradient: g.value })}
                                  className={`h-10 rounded-md border ${block.style?.bgGradient === g.value ? 'border-[#c9a45c] ring-2 ring-[#c9a45c]' : 'border-[#e0d6c2]'}`}
                                  style={{ background: g.value }}
                                  title={g.name}
                                />
                              ))}
                            </div>
                            <p className="mt-2 mb-1 text-[10px] text-[#8a7a66]">Gradien preset:</p>
                            <div className="grid grid-cols-4 gap-1.5">
                              {GRADIENTS.map((g) => (
                                <button
                                  key={g.name}
                                  onClick={() => setBlockStyle(block.id, { bgGradient: g.value })}
                                  className={`h-8 rounded-md border ${block.style?.bgGradient === g.value ? 'border-[#c9a45c] ring-2 ring-[#c9a45c]' : 'border-[#e0d6c2]'}`}
                                  style={{ background: g.value }}
                                  title={g.name}
                                />
                              ))}
                            </div>
                          </div>
                           {block.type !== 'Hero' && (
                           <div>
                            <p className="mb-1 text-xs font-medium text-[#4a443c]">Gambar Latar Section</p>
                            <p className="mb-2 text-[10px] text-[#8a7a66]">Gambar overlay di belakang konten section ini</p>
                            <button
                              onClick={() => {
                                setMediaMode('bg');
                                setMediaOpen(true);
                              }}
                              className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                            >
                              {block.style?.bgImage ? 'Ganti Gambar Latar' : 'Pilih Gambar Latar'}
                            </button>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              <div>
                                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Ukuran</label>
                                <select
                                  value={block.style?.bgFit ?? 'cover'}
                                  onChange={(e) => setBlockStyle(block.id, { bgFit: e.target.value as 'cover' | 'contain' })}
                                  className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                >
                                  <option value="cover">Penuhi (cover)</option>
                                  <option value="contain">Utuh (contain)</option>
                                </select>
                              </div>
                              <div>
                                <label className="mb-1 block text-xs font-medium text-[#4a443c]">Posisi</label>
                                <select
                                  value={block.style?.bgPosition ?? 'center'}
                                  onChange={(e) => setBlockStyle(block.id, { bgPosition: e.target.value })}
                                  className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
                                >
                                  <option value="center">Tengah</option>
                                  <option value="top">Atas</option>
                                  <option value="bottom">Bawah</option>
                                  <option value="left">Kiri</option>
                                  <option value="right">Kanan</option>
                                </select>
                              </div>
                            </div>
                          </div>
                           )}
                          <button
                            onClick={() => clearBlockStyle(block.id)}
                            className="w-full rounded-md border border-[#e0d6c2] py-1.5 text-xs text-[#6b5f4d] hover:border-red-300 hover:text-red-600"
                          >
                            Reset style section
                          </button>
                        </div>
                      }
                    />
                  {selectedText && (
                    <Section
                      title="Font & Ukuran Teks"
                      desc={`Elemen "${humanize(selectedText)}"`}
                      render={
                        <TextStyleControl
                          key={selectedText}
                          fontSize={block.style?.textSizes?.[selectedText]}
                          fontFamily={block.style?.textFonts?.[selectedText]}
                          onCommitSize={(size) => setBlockTextSize(block.id, selectedText, size)}
                          onCommitFont={(font) => setBlockTextFont(block.id, selectedText, font)}
                          onDone={() => setSelectedText(null)}
                        />
                      }
                    />
                  )}
                  {(canvas.flow ?? 'stack') === 'free' && (
                    <Section
                      title="Posisi & Ukuran"
                      desc="Px relatif terhadap kanvas 420px"
                      render={
                        <div className="space-y-3">
                          <NumberField label="Kiri (x)" value={block.layout?.x ?? 0} onChange={(v) => setBlockLayout(block.id, { x: v })} min={0} max={420} />
                          <NumberField label="Atas (y)" value={block.layout?.y ?? 0} onChange={(v) => setBlockLayout(block.id, { y: v })} min={0} max={2000} />
                          <NumberField label="Lebar" value={block.layout?.width ?? 420} onChange={(v) => setBlockLayout(block.id, { width: v })} min={40} max={420} />
                        </div>
                      }
                    />
                  )}
                </div>
              }
            />
          </>

        )}

        {activeDecor && (
          <Section
            title={`Dekor ${activeDecor.asset.kind}`}
            desc="Layer tambahan di atas blok"
            render={
              <DecorSettings
                key={activeDecor.asset.id}
                blockId={activeDecor.block.id}
                asset={activeDecor.asset}
                updateDecor={updateDecor}
                removeDecor={removeDecor}
                selectDecor={selectDecor}
                onPickImage={() => {
                  setMediaMode('decor');
                  setMediaOpen(true);
                }}
              />
            }
          />
        )}
      </div>

      {cropOpen && block?.type === 'Hero' && typeof block.props.bg_image === 'string' && block.props.bg_image && (
        <ImageCropTool
          src={block.props.bg_image}
          initialPosition={(block.props.bg_position as string) || 'center'}
          initialFit={(block.props.bg_fit as string) || 'cover'}
          onApply={(position, fit) => {
            setBlockProps(block.id, { bg_position: position, bg_fit: fit });
            setCropOpen(false);
          }}
          onClose={() => setCropOpen(false)}
        />
      )}

      <MediaLibrary
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(url) => {
          if (mediaMode === 'hero' && block?.type === 'Hero') setBlockProps(block.id, { bg_image: url });
          if (mediaMode === 'gallery' && block?.type === 'Gallery') {
            const imgs = Array.isArray(block.props.images) ? (block.props.images as string[]) : [];
            setBlockProps(block.id, { images: [...imgs, url] });
          }
          if (mediaMode === 'bg' && block) setBlockStyle(block.id, { bgImage: url });
          if (mediaMode === 'photo' && block?.type === 'Photo') setBlockProps(block.id, { image: url });
          if (mediaMode === 'couple_groom' && block?.type === 'Couple') setBlockProps(block.id, { groom_photo: url });
          if (mediaMode === 'couple_bride' && block?.type === 'Couple') setBlockProps(block.id, { bride_photo: url });
          if (mediaMode === 'decor' && activeDecor)
            updateDecor(activeDecor.block.id, activeDecor.asset.id, { imageUrl: url });
          setMediaMode(null);
          setMediaOpen(false);
        }}
      />
    </aside>
  );
}

function StoryChapters({
  blockId,
  props,
  setBlockProps
}: {
  blockId: string;
  props: BlockProps;
  setBlockProps: (blockId: string, p: Partial<BlockProps>) => void;
}) {
  const titles = Array.isArray(props.ev_title) ? (props.ev_title as string[]) : [];
  const dates = Array.isArray(props.ev_date) ? (props.ev_date as string[]) : [];
  const descs = Array.isArray(props.ev_desc) ? (props.ev_desc as string[]) : [];
  const count = Math.max(1, titles.length);

  function setArr(key: string, index: number, value: string) {
    const cur = Array.isArray(props[key]) ? [...(props[key] as string[])] : [];
    while (cur.length <= index) cur.push('');
    cur[index] = value;
    setBlockProps(blockId, { [key]: cur });
  }

  return (
    <Section
      title="Cerita"
      desc="Urutan timeline kisah kalian"
      render={
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-md border border-[#e0d6c2] bg-[#faf7f2] p-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#b39a65]">Bab {i + 1}</span>
                {titles.length > 1 && (
                  <button
                    onClick={() => {
                      setBlockProps(blockId, {
                        ev_title: titles.filter((_, j) => j !== i),
                        ev_date: dates.filter((_, j) => j !== i),
                        ev_desc: descs.filter((_, j) => j !== i)
                      });
                    }}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                )}
              </div>
              <input
                value={titles[i] ?? ''}
                onChange={(e) => setArr('ev_title', i, e.target.value)}
                placeholder="Judul bab"
                className="mb-2 w-full rounded border border-[#e0d6c2] bg-[#faf7f2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#c9a45c]"
              />
              <input
                value={dates[i] ?? ''}
                onChange={(e) => setArr('ev_date', i, e.target.value)}
                placeholder="Tahun / tanggal"
                className="mb-2 w-full rounded border border-[#e0d6c2] bg-[#faf7f2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#c9a45c]"
              />
              <textarea
                value={descs[i] ?? ''}
                onChange={(e) => setArr('ev_desc', i, e.target.value)}
                placeholder="Cerita singkat"
                rows={2}
                className="w-full rounded border border-[#e0d6c2] bg-[#faf7f2] px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-[#c9a45c]"
              />
            </div>
          ))}
          <button
            onClick={() =>
              setBlockProps(blockId, {
                ev_title: [...titles, 'Bab baru'],
                ev_date: [...dates, ''],
                ev_desc: [...descs, 'Tulis ceritanya di sini.']
              })
            }
            className="w-full rounded-md border border-dashed border-[#e0d6c2] py-1.5 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
          >
            + Tambah Bab
          </button>
        </div>
      }
    />
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#4a443c]">{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const n = Math.min(max, Math.max(min, Number(e.target.value) || 0));
          onChange(n);
        }}
        className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
      />
    </div>
  );
}

const DECOR_SHAPES: { key: string; label: string }[] = [
  { key: 'circle', label: 'Bulat' },
  { key: 'square', label: 'Kotak' },
  { key: 'triangle', label: 'Segitiga' },
  { key: 'star', label: 'Bintang' },
  { key: 'heart', label: 'Hati' },
  { key: 'leaf', label: 'Daun' },
  { key: 'diamond', label: 'Ketupat' },
  { key: 'ring', label: 'Cincin' }
];
const DECOR_PHOTO_SHAPES = [
  { key: 'square', label: 'Persegi' },
  { key: 'rounded', label: 'Sudut Bulat' },
  { key: 'circle', label: 'Bulat' },
  { key: 'miring', label: 'Miring' }
];

function DecorSettings({
  blockId,
  asset,
  updateDecor,
  removeDecor,
  selectDecor,
  onPickImage
}: {
  blockId: string;
  asset: DecorAsset;
  updateDecor: (blockId: string, decorId: string, partial: Partial<DecorAsset>) => void;
  removeDecor: (blockId: string, decorId: string) => void;
  selectDecor: (key: string | null) => void;
  onPickImage: () => void;
}) {
  const set = (partial: Partial<DecorAsset>) => updateDecor(blockId, asset.id, partial);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="Kiri (x)" value={asset.x} min={0} max={420} onChange={(v) => set({ x: v })} />
        <NumberField label="Atas (y)" value={asset.y} min={0} max={2000} onChange={(v) => set({ y: v })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4a443c]">Rotasi (°)</label>
          <input
            type="number"
            value={asset.rotation ?? 0}
            min={0}
            max={360}
            onChange={(e) => set({ rotation: Math.min(360, Math.max(0, Number(e.target.value) || 0)) })}
            className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4a443c]">Lapisan</label>
          <div className="flex gap-1">
            {[0, 1].map((l) => (
              <button
                key={l}
                onClick={() => set({ layer: l })}
                className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${(asset.layer ?? 0) === l ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
              >
                {l === 0 ? 'Belakang' : 'Depan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {asset.kind === 'shape' && (
        <>
          <div>
            <p className="mb-1 text-xs font-medium text-[#4a443c]">Bentuk</p>
            <div className="flex flex-wrap gap-1.5">
              {DECOR_SHAPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => set({ shape: s.key as DecorAsset['shape'] })}
                  className={`rounded-md border px-2 py-1 text-xs ${asset.shape === s.key ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <NumberField label="Ukuran (px)" value={asset.size ?? 48} min={8} max={200} onChange={(v) => set({ size: v })} />
          <ColorPicker label="Warna" value={asset.color ?? '#c9a45c'} onChange={(c) => set({ color: c })} />
        </>
      )}

      {asset.kind === 'text' && (
        <>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4a443c]">Teks</label>
            <textarea
              value={asset.text ?? ''}
              onChange={(e) => set({ text: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Ukuran (px)" value={asset.fontSize ?? 14} min={8} max={96} onChange={(v) => set({ fontSize: v })} />
            <ColorPicker label="Warna" value={asset.color ?? '#ffffff'} onChange={(c) => set({ color: c })} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Rata</label>
              <div className="flex gap-1">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => set({ align: a })}
                    className={`flex-1 rounded-md border px-2 py-1.5 text-xs ${asset.align === a ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                  >
                    {a === 'left' ? 'R' : a === 'center' ? 'T' : 'K'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-[#4a443c]">Gaya</label>
              <div className="flex gap-1">
                <button
                  onClick={() => set({ fontWeight: asset.fontWeight === 'bold' ? 'normal' : 'bold' })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-bold ${asset.fontWeight === 'bold' ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                >
                  B
                </button>
                <button
                  onClick={() => set({ underline: !asset.underline })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs underline ${asset.underline ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                >
                  U
                </button>
                <button
                  onClick={() => set({ italic: !asset.italic })}
                  className={`flex-1 rounded-md border px-2 py-1.5 text-xs italic ${asset.italic ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                >
                  I
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {asset.kind === 'image' && (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={onPickImage}
              className="flex-1 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
            >
              {asset.imageUrl ? 'Ganti Gambar' : 'Pilih Gambar'}
            </button>
            {asset.imageUrl && (
              <button
                onClick={() => set({ imageUrl: '' })}
                className="rounded-md border border-[#e0d6c2] px-2 py-2 text-xs text-[#6b5f4d] hover:border-red-300 hover:text-red-600"
              >
                Hapus
              </button>
            )}
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-[#4a443c]">Bentuk Foto</p>
            <div className="flex flex-wrap gap-1.5">
              {DECOR_PHOTO_SHAPES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => set({ photoShape: s.key as DecorAsset['photoShape'] })}
                  className={`rounded-md border px-2 py-1 text-xs ${asset.photoShape === s.key ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <NumberField label="Lebar (px)" value={asset.width ?? 100} min={24} max={420} onChange={(v) => set({ width: v })} />
        </>
      )}

      <NumberField
        label="Opacity (%)"
        value={Math.round((asset.opacity ?? 1) * 100)}
        min={5}
        max={100}
        onChange={(v) => set({ opacity: v / 100 })}
      />

      <div className="flex gap-2 pt-1">
        <button
          onClick={() => removeDecor(blockId, asset.id)}
          className="flex-1 rounded-md border border-red-200 py-1.5 text-xs text-red-600 hover:bg-red-50"
        >
          Hapus Asset
        </button>
        <button
          onClick={() => selectDecor(null)}
          className="flex-1 rounded-md border border-[#c9a45c] bg-[#c9a45c] py-1.5 text-xs text-white"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  render
}: {
  title: string;
  desc?: string;
  render: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-[#b39a65]">{title}</h4>
      {desc && <p className="mb-2 text-[11px] text-[#8a7a66]">{desc}</p>}
      <div className="mt-2">{render}</div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline,
  url,
  onChange
}: {
  label: string;
  value: string;
  multiline?: boolean;
  url?: boolean;
  blockId?: string;
  propKey?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#4a443c]">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
        />
      ) : (
        <input
          type={url ? 'url' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={url ? 'https://maps.app.goo.gl/... atau link share Google Maps' : undefined}
          className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
        />
      )}
    </div>
  );
}

function FontSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[#4a443c]">{label}</label>
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 shrink-0 text-[#8a7a66]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-[#8a7a66]">
        <Clapperboard className="h-3 w-3" /> Otomatis dimuat via Google Fonts pada output.
      </p>
    </div>
  );
}

function humanize(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function parsePx(v?: string) {
  if (!v) return undefined;
  const n = parseFloat(v);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

/** Kontrol font + ukuran per elemen teks. value = CSS fontSize (mis. "32px") & nama font. */
function TextStyleControl({
  fontSize,
  fontFamily,
  onCommitSize,
  onCommitFont,
  onDone
}: {
  fontSize?: string;
  fontFamily?: string;
  onCommitSize: (size: string) => void;
  onCommitFont: (font: string) => void;
  onDone: () => void;
}) {
  const current = parsePx(fontSize);
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-[#4a443c]">Font</label>
        <select
          value={fontFamily ?? ''}
          onChange={(e) => onCommitFont(e.target.value)}
          className="w-full rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a45c]"
        >
          <option value="">Ikuti tema (default)</option>
          {FONTS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-[#4a443c]">
          Ukuran (px){current !== undefined ? ` · ${current}px` : ''}
        </label>
        <input
          type="range"
          min={8}
          max={96}
          value={current ?? 16}
          onChange={(e) => onCommitSize(`${e.target.value}px`)}
          className="w-full accent-[#c9a45c]"
        />
      </div>
      <p className="text-[11px] leading-relaxed text-[#8a7a66]">
        Font &amp; ukuran ini hanya berlaku untuk elemen teks ini saja. Font otomatis dimuat via Google Fonts.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onCommitSize('');
            onCommitFont('');
          }}
          className="flex-1 rounded-md border border-[#e0d6c2] py-1.5 text-xs text-[#6b5f4d] hover:border-red-300 hover:text-red-600"
        >
          Reset ke default
        </button>
        <button
          onClick={onDone}
          className="flex-1 rounded-md border border-[#c9a45c] bg-[#c9a45c] py-1.5 text-xs text-white"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}

/**
 * Pilih ornamen SVG global undangan, dikelompokkan per kategori template
 * (klasik/outdoor/romantis/modern). Dipakai di cover, hero, dan pembagi section.
 */
function OrnamentThemePicker({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  return (
    <Section
      title="Ornamen & Aset"
      desc="Ornamen dekoratif SVG yang mengikuti tema & kategori"
      render={
        <div className="space-y-3">
          {Object.entries(ORNAMENT_CATEGORIES).map(([cat, { label, keys }]) => (
            <div key={cat}>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#8a7a66]">{label}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {keys.map((k) => {
                  const active = (value || undefined) === k;
                  return (
                    <button
                      key={k}
                      title={ORNAMENT_LABELS[k]}
                      onClick={() => onChange(active ? '' : k)}
                      className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-colors ${
                        active ? 'border-[#c9a45c] bg-[#c9a45c]/10' : 'border-[#e0d6c2] bg-white hover:border-[#c9a45c]'
                      }`}
                    >
                      <OrnamentArt ornament={k as OrnamentKey} width={64} className="text-[#6b5f4d]" />
                      <span className={`w-full truncate text-center text-[9px] ${active ? 'text-[#c9a45c]' : 'text-[#8a7a66]'}`}>
                        {ORNAMENT_LABELS[k]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {value && (
            <p className="text-[11px] leading-relaxed text-[#8a7a66]">
              Ornamen aktif: <span className="font-medium text-[#4a443c]">{ORNAMENT_LABELS[value as OrnamentKey] ?? value}</span>. Klik lagi untuk hapus (kembali ke preset klasik).
            </p>
          )}
        </div>
      }
    />
  );
}

/**
 * Pilih agama & kutipan untuk blok Kutipan/Ayat.
 * - Pindah agama → menampilkan preset ayat/kutipan agama tsb.
 * - Klik kutipan → mengisi original/latin/translation/reference sekaligus.
 */
function QuotePicker({
  blockId,
  props,
  setBlockProps
}: {
  blockId: string;
  props: BlockProps;
  setBlockProps: (id: string, p: Partial<BlockProps>) => void;
}) {
  const religion = (props.religion as ReligionKey) || ('islam' as ReligionKey);
  const quotes = getQuotesByReligion(religion);

  function apply(q: WeddingQuote) {
    setBlockProps(blockId, {
      religion: q.religion,
      original: q.original,
      latin: q.latin ?? '',
      translation: q.translation,
      reference: q.reference
    });
  }

  return (
    <div className="space-y-3 rounded-md border border-[#e7ddcc] bg-[#faf7f2] p-3">
      <div>
        <p className="mb-1 text-xs font-medium text-[#4a443c]">Agama Kutipan</p>
        <div className="grid grid-cols-2 gap-1.5">
          {RELIGIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => setBlockProps(blockId, { religion: r.key })}
              className={`rounded-md border px-2 py-1.5 text-xs ${
                religion === r.key ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d] hover:bg-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[#8a7a66]">
          {RELIGION_LABELS[religion]} — {quotes.length} kutipan tersedia. Klik untuk memakai.
        </p>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-[#4a443c]">Pilih Kutipan</p>
        <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
          {quotes.map((q) => {
            const active = (props.reference as string) === q.reference && (props.original as string) === q.original;
            return (
              <button
                key={q.id}
                onClick={() => apply(q)}
                title={q.translation}
                className={`flex w-full flex-col gap-0.5 rounded-md border px-2.5 py-2 text-left ${
                  active ? 'border-[#c9a45c] bg-[#c9a45c]/10' : 'border-[#e0d6c2] bg-white hover:border-[#c9a45c]'
                }`}
              >
                <span className="text-[11px] font-semibold text-[#4a443c]">{q.reference}</span>
                <span className="truncate text-[11px] text-[#8a7a66]">{q.original}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}