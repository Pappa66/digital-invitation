'use client';

import { useState } from 'react';
import { Type, Clapperboard } from 'lucide-react';
import ColorPicker from '@/components/builder/color-picker';
import MediaLibrary from '@/components/dashboard/media-library';
import { useBuilderStore } from '@/store/builder-store';
import { RELIGIONS } from '@/lib/religions';
import type { BlockProps } from '@/lib/types';

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

const TITLE_PROPS: Record<string, { label: string; multiline?: boolean }[]> = {
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
    { label: 'maps_url' }
  ],
  Gallery: [{ label: 'title' }],
  RSVP: [
    { label: 'title' },
    { label: 'note', multiline: true },
    { label: 'deadline' },
    { label: 'button_text' },
    { label: 'success_message', multiline: true },
    { label: 'envelope_note', multiline: true },
    { label: 'bank_name' },
    { label: 'account_number' },
    { label: 'account_holder' }
  ],
  Maps: [{ label: 'title' }, { label: 'address' }],
  Thanks: [
    { label: 'title' },
    { label: 'message', multiline: true },
    { label: 'closing' },
    { label: 'names' }
  ],
  Divider: []
};

const VARIANTS: Partial<Record<string, { key: string; options: string[] }>> = {
  Hero: { key: 'variant', options: ['center', 'left'] },
  Couple: { key: 'variant', options: ['vertical', 'side'] },
  Countdown: { key: 'variant', options: ['circles', 'cards', 'line'] },
  EventDetail: { key: 'variant', options: ['card', 'band'] },
  Divider: { key: 'variant', options: ['line', 'dots', 'diamond', 'hearts', 'leaves'] }
};

const GALLERY_LAYOUTS: { key: string; label: string; desc: string }[] = [
  { key: 'grid', label: 'Grid', desc: 'Susunan kolom 2 dengan foto besar' },
  { key: 'grid3', label: 'Grid 3 Kolom', desc: 'Kolom 3 dengan foto persegi rapi' },
  { key: 'masonry', label: 'Masonry', desc: 'Kolom menurun dengan tinggi beragam' },
  { key: 'mosaic', label: 'Kolase', desc: 'Kuadran mosaik dengan foto besar pertama' },
  { key: 'polaroid', label: 'Polaroid', desc: 'Foto dengan bingkai seperti foto kenangan' },
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
  ['flip', 'Flip 3D'],
  ['blur', 'Blur'],
  ['rise', 'Muncul Naik'],
  ['swing', 'Ayun'],
  ['pop', 'Pop'],
  ['ken-burns', 'Ken Burns']
] as const;

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
  const setFlow = useBuilderStore((s) => s.setFlow);
  const setReligion = useBuilderStore((s) => s.setReligion);

  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaMode, setMediaMode] = useState<'hero' | 'gallery' | 'bg' | null>(null);

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
                  <label className="block text-xs font-medium text-[#4a443c]">Layout</label>
                  <div className="flex gap-2">
                    {(['center', 'left', 'right'] as const).map((l) => (
                      <button
                        key={l}
                        onClick={() => setTheme({ layout: l })}
                        className={`flex-1 rounded-md border px-2 py-1.5 text-xs capitalize ${
                          canvas.theme.layout === l ? 'border-[#c9a45c] bg-[#c9a45c] text-white' : 'border-[#e0d6c2] text-[#6b5f4d]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
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
                  <p className="text-[11px] leading-relaxed text-[#8a7a66]">
                    Autoplay pada beberapa browser baru berfungsi setelah ada interaksi; tombol musik tetap tersedia di pojok kiri bawah undangan.
                  </p>
                </div>
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
                      label={humanize(prop.label)}
                      value={(block.props[prop.label] as string) ?? ''}
                      multiline={prop.multiline}
                      onChange={(v) => setBlockProps(block.id, { [prop.label]: v })}
                    />
                  ))}
                  {block.type === 'Hero' && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-[#4a443c]">Gambar Hero</p>
                      <button
                        onClick={() => {
                          setMediaMode('hero');
                          setMediaOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded-md border border-[#e0d6c2] bg-[#faf7f2] px-3 py-2 text-sm text-[#6b5f4d] hover:border-[#c9a45c]"
                      >
                        {block.props.bg_image ? 'Change Image' : 'Pilih Gambar'}
                      </button>
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
                        </div>
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
                            <p className="mb-1 text-xs font-medium text-[#4a443c]">Gambar Latar</p>
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
                          <button
                            onClick={() => clearBlockStyle(block.id)}
                            className="w-full rounded-md border border-[#e0d6c2] py-1.5 text-xs text-[#6b5f4d] hover:border-red-300 hover:text-red-600"
                          >
                            Reset style section
                          </button>
                        </div>
                      }
                    />
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
      </div>

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
  onChange
}: {
  label: string;
  value: string;
  multiline?: boolean;
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
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