'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Check,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  Music,
  PenTool,
  Send,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { TEMPLATE_LIST, getTemplate } from '@/lib/templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import TemplatePreview from '@/components/landing/template-preview';
import OrderDialog from '@/components/landing/order-dialog';
import type { CanvasData, TemplateMeta } from '@/lib/types';

interface CardData {
  meta: TemplateMeta;
  canvas: CanvasData;
}

const SYARAT = [
  'Konten (teks, foto, video, musik) yang dimasukkan sepenuhnya milik pemesan atau telah memiliki izin penggunaan; platform tidak bertanggung jawab atas pelanggaran hak cipta.',
  'Template bawaan bebas dipakai dan boleh dimodifikasi; seluruh desain dibuat oleh Prasha Digital Indonesia.',
  'Data tamu dari halaman RSVP/buku tamu hanya dipakai untuk keperluan undangan dan tidak dibagikan kepada pihak ketiga.',
  'Musik latar wajib bebas hak cipta atau berlisensi; file MP3/tautan video di luar itu menjadi tanggung jawab pemesan.',
  'Foto wajib beresolusi tinggi (min. 1200 px) agar tampil tajam di semua perangkat.',
  'Jadwal penyerahan materi akhir, jumlah revisi, dan masa tampil link undangan ditentukan dalam kesepakatan sebelum produksi.',
  'Pesanan dianggap sah setelah konfirmasi diterima; revisi besar di luar paket dapat dikenakan biaya tambahan.',
  'Platform tidak bertanggung jawab atas kendala akses akibat perangkat, jaringan, atau pemblokiran di sisi tamu.'
];

const BAHAN = [
  {
    icon: Users,
    title: 'Data & Identitas',
    items: ['Nama lengkap calon mempelai pria & wanita', 'Nama orang tua atau keluarga (jika ditampilkan)', 'Tanggal, waktu, dan tempat acara (akad dan resepsi)']
  },
  {
    icon: MapPin,
    title: 'Lokasi Acara',
    items: ['Alamat lengkap venue', 'Link Google Maps untuk tombol "Petunjuk Arah" pada undangan']
  },
  {
    icon: Camera,
    title: 'Foto',
    items: ['Foto hero (1, rasio vertikal/potret)', 'Foto mempelai atau prewedding (disarankan 5–10)', 'Foto galeri tambahan (opsional)', 'Format JPG/PNG, resolusi min. 1200 px agar tajam']
  },
  {
    icon: Music,
    title: 'Musik Latar',
    items: ['File MP3 (maks. ±10 MB) atau link YouTube/Spotify', 'Wajib lagu bebas hak cipta atau yang sudah berlisensi', 'Tentukan mulai otomatis atau di section tertentu']
  },
  {
    icon: MessageCircle,
    title: 'Konfirmasi & Amplop Digital',
    items: ['Nomor WhatsApp untuk RSVP konfirmasi kehadiran', 'Nomor rekening + atas nama untuk tanda kasih', 'Teks ucapan terima kasih & nama keluarga']
  },
  {
    icon: Sparkles,
    title: 'Pelengkap (Opsional)',
    items: ['Logo pasangan / monogram', 'Video prewedding singkat', 'Teks doa dan sambutan', 'URL / QR untuk berbagi undangan']
  }
];

const STEPS = [
  { icon: Check, title: 'Pilih Template', body: 'Jelajahi 32 desain, lihat hasil aslinya, lalu pilih favorit Anda untuk diproses tim kami.' },
  { icon: PenTool, title: 'Sesuaikan Sesuai Selera', body: 'Ganti foto, nama, jadwal, musik latar, dan warna tanpa perlu menulis kode.' },
  { icon: Send, title: 'Bagikan & Pantau', body: 'Terbitkan link, kirim ucapan per tamu via WhatsApp, dan pantau konfirmasi kehadiran.' }
];

const FITUR = [
  { icon: Music, title: 'Musik latar', body: 'MP3 atau YouTube, autoplay dan mulai di section tertentu.' },
  { icon: Camera, title: 'Galeri animasi', body: 'Grid, kolom, atau carousel dengan 12 pilihan efek foto.' },
  { icon: Users, title: 'RSVP & buku tamu', body: 'Konfirmasi kehadiran dan ucapan tamu tampil di undangan.' },
  { icon: MapPin, title: 'Petunjuk arah', body: 'Tombol Maps satu klik ke lokasi acara.' },
  { icon: Heart, title: 'Amplop digital', body: 'Nomor rekening untuk tanda kasih tamu.' },
  { icon: MessageCircle, title: 'Kelola & kirim tamu', body: 'Ucapan per tamu dan tandai yang sudah menerima.' }
];

const PER_PAGE = 8;

function useFontsLink() {
  useEffect(() => {
    const families = Array.from(
      new Set(
        TEMPLATE_LIST.flatMap((t) => {
          const c = getTemplate(t.id);
          return c ? [c.theme.font_heading, c.theme.font_body] : [];
        })
      )
    );
    const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f)}`).join('&')}&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
}

export default function LandingPage() {
  const [category, setCategory] = useState<TemplateCategory | 'semua'>('semua');
  const [page, setPage] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderTemplate, setOrderTemplate] = useState<string | undefined>(undefined);

  function openOrder(templateName?: string) {
    setOrderTemplate(templateName);
    setOrderOpen(true);
  }

  const cards = useMemo<CardData[]>(
    () => TEMPLATE_LIST.map((meta) => ({ meta, canvas: getTemplate(meta.id)! })),
    []
  );

  const filtered = useMemo(() => {
    if (category === 'semua') return cards;
    return cards.filter((c) => (c.meta.category ?? '').toLowerCase() === category);
  }, [cards, category]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function selectCategory(cat: TemplateCategory | 'semua') {
    setCategory(cat);
    setPage(1);
  }

  useFontsLink();

  return (
    <div className="min-h-screen bg-[#0e0e13] text-gray-100 antialiased">
      {/* ORNAMENT BACKGROUND */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(212,175,55,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(90,60,20,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      </div>

      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0e0e13]/85 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-black">
                <Heart className="h-4 w-4" />
              </span>
              <span className="text-sm font-semibold tracking-wide sm:text-base">Undangan Digital</span>
            </div>
            <nav className="hidden items-center gap-6 text-sm text-gray-400 md:flex">
              <a href="#template" className="hover:text-white">Template</a>
              <a href="#cara" className="hover:text-white">Cara Kerja</a>
              <a href="#syarat" className="hover:text-white">Syarat & Ketentuan</a>
              <a href="#bahan" className="hover:text-white">Bahan Pendukung</a>
            </nav>
            <div className="flex items-center gap-2">
              <Link href="/login" className="rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-white/5">
                Masuk
              </Link>
              <button onClick={() => openOrder()} className="rounded-md bg-amber-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-amber-300">
                Pesan Undangan
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-20 text-center sm:px-6 sm:pt-24">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5" /> {TEMPLATE_LIST.length} template siap pakai · 4 kategori
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Undangan digital yang{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              mewah
            </span>{' '}
            dan personal
          </h1>
          <div className="mx-auto mt-6 flex max-w-[240px] items-center gap-3 text-amber-400/70">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/60" />
            <Heart className="h-4 w-4" />
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            Jelajahi semua template, lihat hasil desainnya secara langsung, lalu sesuaikan foto, teks, musik, dan terbitkan link undangan dalam hitungan menit.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#template" className="flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">
              Lihat Template <ArrowRight className="h-4 w-4" />
            </a>
            <button onClick={() => openOrder()} className="rounded-xl border border-white/15 px-6 py-3 text-sm font-medium text-gray-200 hover:bg-white/5">
              Pesan Undangan
            </button>
          </div>
        </section>

        {/* TEMPLATE CATALOG */}
        <section id="template" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-14 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Katalog Template</h2>
              <p className="mt-1 text-sm text-gray-400">
                Pratinjau asli setiap desain — klik untuk melihat detail lalu pakai di Builder.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
              {filtered.length} template
            </span>
          </div>

          {/* FILTER KATEGORI */}
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => selectCategory('semua')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                category === 'semua' ? 'bg-amber-400 text-black' : 'border border-white/15 text-gray-300 hover:bg-white/5'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => selectCategory(c.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  category === c.key ? 'bg-amber-400 text-black' : 'border border-white/15 text-gray-300 hover:bg-white/5'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="mb-9 max-w-3xl rounded-2xl border border-amber-400/15 bg-gradient-to-r from-amber-400/[0.06] to-transparent px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-400/90">
              {category === 'semua' ? 'Filosofi Kategori' : `Makna ${categoryLabel(category)}`}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-300">
              {category === 'semua'
                ? 'Setiap gaya membawa makna dan suasana tersendiri — pilih kategori yang paling dekat dengan cerita cinta kalian, lalu lihat apa yang dilambangkannya.'
                : CATEGORIES.find((c) => c.key === category)?.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map(({ meta, canvas }) => {
              const number = cards.findIndex((c) => c.meta.id === meta.id) + 1;
              return (
                <Link
                  key={meta.id}
                  href={`/templates/${meta.id}`}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  <div className="relative">
                    <TemplatePreview canvas={canvas} bg={canvas.theme.background} />
                    <span className="pointer-events-none absolute -left-1 bottom-0 select-none text-7xl font-bold text-white/[0.07] transition-colors group-hover:text-white/15">
                      {String(number).padStart(2, '0')}
                    </span>
                    <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                      {categoryLabel(meta.category)}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: meta.primary }} />
                      <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: meta.secondary }} />
                      <p className="ml-1 truncate text-sm font-semibold text-white">{meta.name}</p>
                    </div>
                    <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-gray-400">{meta.description}</p>
                    <span className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-2 text-sm font-semibold text-black">
                      <Eye className="h-4 w-4" /> Lihat Template
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-gray-300 hover:bg-white/5 disabled:opacity-40"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-9 w-9 rounded-lg text-sm ${
                    n === safePage ? 'bg-amber-400 font-semibold text-black' : 'border border-white/15 text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-gray-300 hover:bg-white/5 disabled:opacity-40"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </section>

        {/* CARA KERJA + FITUR */}
        <section id="cara" className="scroll-mt-20 border-t border-white/10 bg-[#12121a]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold">Mulai dalam Tiga Langkah</h2>
              <div className="mx-auto mt-4 flex max-w-[200px] items-center gap-3 text-amber-400/60">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-400/60" />
                <Heart className="h-4 w-4" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-400/60" />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={s.title} className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <span className="pointer-events-none absolute right-5 top-4 select-none text-5xl font-bold text-white/[0.06]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 text-black">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold text-white">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{s.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-20">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="text-2xl font-bold">Semua kebutuhan undangan dalam satu tempat</h2>
                <p className="mt-1 text-sm text-gray-400">Fitur yang dipakai setiap hari oleh keluarga mempelai.</p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FITUR.map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-amber-400/30">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-400">{f.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* SYARAT & KETENTUAN */}
        <section id="syarat" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-bold">Syarat & Ketentuan</h2>
            <p className="mt-1 text-sm text-gray-400">Hal-hal yang perlu dipahami sebelum membuat undangan digital bersama kami.</p>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SYARAT.map((s, i) => (
              <li key={i} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm leading-relaxed text-gray-300">{s}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* BAHAN PENDUKUNG */}
        <section id="bahan" className="scroll-mt-20 border-t border-white/10 bg-[#12121a]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-10 max-w-2xl">
              <h2 className="text-2xl font-bold">Bahan Pendukung</h2>
              <p className="mt-1 text-sm text-gray-400">File dan informasi yang perlu disiapkan sebagai materi pembuatan undangan digital.</p>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {BAHAN.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="text-sm font-semibold text-white">{g.title}</h3>
                    </div>
                    <ul className="space-y-2">
                      {g.items.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm leading-relaxed text-gray-400">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-dashed border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-gray-400">
              <FileText className="h-4 w-4 shrink-0 text-amber-300" />
              Rasio &amp; format yang dianjurkan: foto JPG/PNG min. 1200 px, musik MP3 maks. ±10 MB, dan teks siap salin (copy-paste) dari undangan fisik jika ada.
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Siap membuat undangan{' '}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">impian</span> Anda?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-400">Pilih template favorit, dan tim kami yang menyusun, menyesuaikan, dan mengirim link undangannya.</p>
          <button onClick={() => openOrder()} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-7 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.02]">
            Pesan Undangan <ArrowRight className="h-4 w-4" />
          </button>
        </section>

        <footer className="border-t border-white/10 bg-[#0a0a0f]">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-gray-500 sm:px-6">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-amber-400" /> Prasha Digital Indonesia
            </div>
            <div className="flex items-center gap-4">
              <a href="#template" className="hover:text-white">Template</a>
              <a href="#cara" className="hover:text-white">Cara Kerja</a>
              <a href="#syarat" className="hover:text-white">Syarat & Ketentuan</a>
              <a href="#bahan" className="hover:text-white">Bahan Pendukung</a>
            </div>
          </div>
        </footer>
      </div>

      <OrderDialog open={orderOpen} templateName={orderTemplate} onClose={() => setOrderOpen(false)} />
    </div>
  );
}