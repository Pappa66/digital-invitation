'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  FileText,
  MapPin,
  MessageCircle,
  Music,
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
  {
    numeral: 'I',
    title: 'Pilih Desain',
    body: 'Jelajahi puluhan template, lihat hasil aslinya langsung, dan pilih yang paling dekat dengan cerita Anda.'
  },
  {
    numeral: 'II',
    title: 'Kami yang Menyusun',
    body: 'Tim desainer menyetel foto, nama, jadwal, musik latar, dan warna — tanpa perlu menulis kode.'
  },
  {
    numeral: 'III',
    title: 'Bagikan & Rayakan',
    body: 'Terbitkan link undangan, kirim ucapan per tamu lewat WhatsApp, dan pantau konfirmasi kehadiran.'
  }
];

const FITUR = [
  { title: 'Musik latar', body: 'MP3 atau YouTube, autoplay dan mulai di section tertentu.' },
  { title: 'Galeri animasi', body: 'Grid, kolom, atau carousel dengan 12 pilihan efek foto.' },
  { title: 'RSVP & buku tamu', body: 'Konfirmasi kehadiran dan ucapan tamu tampil di undangan.' },
  { title: 'Petunjuk arah', body: 'Tombol Maps satu klik ke lokasi acara.' },
  { title: 'Amplop digital', body: 'Nomor rekening untuk tanda kasih tamu.' },
  { title: 'Kelola & kirim tamu', body: 'Ucapan per tamu dan tandai yang sudah menerima.' }
];

const FEATURED = ['elegant-gold', 'blush-romance', 'ivory-dawn'];

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

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#c9a45c] sm:w-20" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="#c9a45c" />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#c9a45c] sm:w-20" />
    </div>
  );
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

  const featuredCards = useMemo(
    () =>
      TEMPLATE_LIST.filter((t) => FEATURED.includes(t.id))
        .map((meta) => ({ meta, canvas: getTemplate(meta.id)! }))
        .slice(0, 3),
    []
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function selectCategory(cat: TemplateCategory | 'semua') {
    setCategory(cat);
    setPage(1);
  }

  useFontsLink();

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2b2620] antialiased">
      {/* ORNAMEN LATAR */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,138,0.08),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-[#e7ddcc]/80 bg-[#faf7f2]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#d9c795]">
                <Image src="/logo/prasha.png" width={40} height={40} alt="Prasha Digital" className="h-10 w-10 object-cover" />
              </span>
              <div className="leading-tight">
                <p className="font-script text-2xl text-[#b98a3e]">Prasha</p>
                <p className="-mt-1 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8a7a66]">Digital</p>
              </div>
            </div>
            <nav className="hidden items-center gap-8 text-sm text-[#8a7a66] md:flex">
              <a href="#catalog" className="transition-colors hover:text-[#2b2620]">Template</a>
              <a href="#cara" className="transition-colors hover:text-[#2b2620]">Cara Kerja</a>
              <a href="#bahan" className="transition-colors hover:text-[#2b2620]">Bahan</a>
              <a href="#syarat" className="transition-colors hover:text-[#2b2620]">Syarat</a>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="rounded-md border border-[#e0d6c2] bg-white px-4 py-1.5 text-sm font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c]">
                Masuk
              </Link>
              <button
                onClick={() => openOrder()}
                className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
              >
                Pesan Undangan
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="font-script text-3xl text-[#b98a3e] sm:text-4xl">Undangan Digital Pernikahan</p>
              <Ornament className="mt-3 lg:justify-start" />

              <h1 className="mt-6 font-heading text-4xl font-medium leading-[1.15] tracking-tight text-[#2b2620] sm:text-6xl">
                Merayakan cinta,
                <br />
                <em className="bg-gradient-to-r from-[#b98a3e] to-[#8a6d2f] bg-clip-text font-semibold italic text-transparent">
                  dalam karya yang abadi.
                </em>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#8a7a66] lg:mx-0">
                Pilih desain favorit, isi form pemesanan singkat, dan tim kami yang menyusun teks, foto, musik, serta link undangannya — Anda tinggal
                menerima hasilnya dan membagikannya kepada para tamu.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href="#catalog"
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  Jelajahi Template <ArrowRight className="h-4 w-4" />
                </a>
                <button
                  onClick={() => openOrder()}
                  className="rounded-lg border border-[#c9a45c] px-7 py-3 text-sm font-medium text-[#8a6d2f] transition-colors hover:bg-[#c9a45c]/10"
                >
                  Pesan Undangan
                </button>
              </div>

              <p className="mt-7 text-xs text-[#b3a69a]">
                {TEMPLATE_LIST.length} template siap pakai &middot; 4 tema &middot; dipesan lewat form, dibalas via WhatsApp — tanpa perlu akun.
              </p>
            </div>

            {/* KOMPOSISI PRATINJAU */}
            <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
              <div className="relative h-[540px]">
                {featuredCards.map(({ meta, canvas }, i) => {
                  const positions = [
                    'absolute left-1/2 top-1/2 z-20 aspect-[3/4] w-64 -translate-x-[78%] -translate-y-1/2 rotate-[-6deg]',
                    'absolute left-1/2 top-1/2 z-30 aspect-[3/4] w-72 -translate-x-1/2 -translate-y-[55%]',
                    'absolute left-1/2 top-1/2 z-10 aspect-[3/4] w-60 -translate-x-[2%] -translate-y-[30%] rotate-[7deg]'
                  ];
                  return (
                    <div key={meta.id} className={`${positions[i]} overflow-hidden rounded-lg bg-white p-2 shadow-xl shadow-[#2b2620]/15 ring-1 ring-[#d9c795]`}>
                      <div className="overflow-hidden rounded-[4px]">
                        <TemplatePreview canvas={canvas} bg={canvas.theme.background} />
                      </div>
                      <p className="mt-1.5 truncate text-center font-heading text-xs italic text-[#8a7a66]">{meta.name}</p>
                    </div>
                  );
                })}
              </div>
              <span className="pointer-events-none absolute -bottom-4 left-1/2 select-none -translate-x-1/2 text-[11px] uppercase tracking-[0.4em] text-[#c9a45c]/70">
                Prasha Digital
              </span>
            </div>
          </div>
        </section>

        {/* KATALOG TEMPLATE */}
        <section id="catalog" className="scroll-mt-20 border-t border-[#e7ddcc] bg-white/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Koleksi Kami</p>
              <Ornament className="mt-3" />
              <h2 className="mt-5 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Katalog Template</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#8a7a66]">
                Pratinjau asli setiap desain — klik untuk melihat detail, lalu pesan untuk dikerjakan tim kami.
              </p>
            </div>

            {/* FILTER KATEGORI */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => selectCategory('semua')}
                className={`rounded-full px-5 py-1.5 text-sm transition-colors ${
                  category === 'semua'
                    ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm'
                    : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'
                }`}
              >
                Semua
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => selectCategory(c.key)}
                  className={`rounded-full px-5 py-1.5 text-sm transition-colors ${
                    category === c.key
                      ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm'
                      : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* DESKRIPSI KATEGORI */}
            <p className="mx-auto mt-6 max-w-2xl text-center font-heading text-[15px] italic leading-relaxed text-[#8a7a66]">
              {category === 'semua'
                ? 'Setiap gaya membawa makna dan suasana tersendiri — pilih kategori yang paling dekat dengan cerita cinta Anda.'
                : CATEGORIES.find((c) => c.key === category)?.desc}
            </p>

            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map(({ meta, canvas }) => {
                const number = cards.findIndex((c) => c.meta.id === meta.id) + 1;
                return (
                  <Link
                    key={meta.id}
                    href={`/templates/${meta.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-[#e7ddcc] bg-white transition-all hover:-translate-y-1.5 hover:border-[#c9a45c] hover:shadow-xl hover:shadow-[#b98a3e]/10"
                  >
                    <div className="relative overflow-hidden">
                      <TemplatePreview canvas={canvas} bg={canvas.theme.background} />
                      <span className="pointer-events-none absolute -left-1 bottom-0 select-none font-heading text-7xl font-semibold text-[#b98a3e]/[0.08] transition-colors group-hover:text-[#b98a3e]/20">
                        {String(number).padStart(2, '0')}
                      </span>
                      <span className="absolute right-3 top-3 rounded-full border border-[#d9c795]/70 bg-white/85 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#8a6d2f] backdrop-blur-sm">
                        {categoryLabel(meta.category)}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-[#e0d6c2]" style={{ background: meta.primary }} />
                        <span className="h-3.5 w-3.5 rounded-full border border-[#e0d6c2]" style={{ background: meta.secondary }} />
                        <p className="ml-1 font-heading text-base font-medium text-[#2b2620]">{meta.name}</p>
                      </div>
                      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#8a7a66]">{meta.description}</p>
                      <span className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#d9c795] bg-[#faf7f2] px-3 py-2 text-sm font-medium text-[#8a6d2f] transition-colors group-hover:bg-gradient-to-r group-hover:from-[#c9a45c] group-hover:to-[#b98a3e] group-hover:text-white">
                        <Eye className="h-4 w-4" /> Lihat Template
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0d6c2] bg-white text-[#4a443c] transition-colors hover:border-[#c9a45c] disabled:opacity-40"
                  aria-label="Halaman sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-9 w-9 rounded-lg text-sm transition-colors ${
                      n === safePage
                        ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm'
                        : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0d6c2] bg-white text-[#4a443c] transition-colors hover:border-[#c9a45c] disabled:opacity-40"
                  aria-label="Halaman berikutnya"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CARA KERJA */}
        <section id="cara" className="scroll-mt-20 border-t border-[#e7ddcc] bg-[#f4eee1]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-14 text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Mari memulai</p>
              <Ornament className="mt-3" />
              <h2 className="mt-5 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Tiga Langkah yang Ringan</h2>
            </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.numeral} className="relative border-t border-[#c9a45c]/50 pt-7">
                  <span className="font-script text-5xl text-[#c9a45c]" aria-hidden>
                    {s.numeral}
                  </span>
                  <h3 className="mt-3 font-heading text-xl font-medium text-[#2b2620]">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#8a7a66]">{s.body}</p>
                </div>
              ))}
            </div>

            {/* FITUR */}
            <div className="mt-24 grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-2">
              <div>
                <p className="font-script text-3xl text-[#b98a3e]">Yang menyempurnakan</p>
                <h3 className="mt-3 font-heading text-3xl font-medium text-[#2b2620]">
                  Semua kebutuhan undangan, <em className="italic">dalam satu tempat.</em>
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8a7a66]">
                  Fitur yang dipakai setiap hari oleh keluarga mempelai — dipasang dengan rapi oleh tim kami.
                </p>
              </div>
              <ul className="divide-y divide-[#e7ddcc]">
                {FITUR.map((f) => (
                  <li key={f.title} className="flex items-start gap-4 py-4">
                    <span className="mt-1 h-2 w-2 shrink-0 rotate-45 border border-[#c9a45c] bg-[#f4eee1]" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-[#2b2620]">{f.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-[#8a7a66]">{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* BAHAN PENDUKUNG */}
        <section id="bahan" className="scroll-mt-20 border-t border-[#e7ddcc]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="font-script text-3xl text-[#b98a3e]">Persiapan</p>
                <Ornament className="mt-3 justify-start" />
                <h2 className="mt-5 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Bahan Pendukung</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8a7a66]">
                  File dan informasi yang perlu disiapkan sebagai materi pembuatan undangan digital Anda.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
                {BAHAN.map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.title}>
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c795] bg-white text-[#8a6d2f]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a6d2f]">{g.title}</p>
                      </div>
                      <ul className="mt-3 space-y-2">
                        {g.items.map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[#8a7a66]">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rotate-45 border border-[#c9a45c]/70" aria-hidden />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 rounded-lg border border-[#d9c795] bg-[#faf7f2] px-5 py-4 text-sm text-[#8a7a66]">
              <FileText className="h-4 w-4 shrink-0 text-[#b98a3e]" />
              Rasio &amp; format yang dianjurkan: foto JPG/PNG min. 1200 px, musik MP3 maks. ±10 MB, dan teks siap salin dari undangan fisik jika ada.
            </div>
          </div>
        </section>

        {/* SYARAT & KETENTUAN */}
        <section id="syarat" className="scroll-mt-20 border-t border-[#e7ddcc] bg-[#f4eee1]">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Sebelum memesan</p>
              <Ornament className="mt-3" />
              <h2 className="mt-5 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Syarat &amp; Ketentuan</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#8a7a66]">
                Hal-hal yang perlu dipahami sebelum membuat undangan digital bersama kami.
              </p>
            </div>

            <ol className="mt-12 space-y-5">
              {SYARAT.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#c9a45c]/60 font-heading text-sm text-[#8a6d2f]">
                    {i + 1}
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-[#4a443c]">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e7ddcc]">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
            <p className="font-script text-4xl text-[#b98a3e]">Undangan Anda menanti.</p>
            <h2 className="mx-auto mt-5 max-w-2xl font-heading text-3xl font-medium leading-snug text-[#2b2620] sm:text-5xl">
              Siap merayakan hari besar Anda dengan <em className="italic">elegan</em>?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#8a7a66]">
              Pilih template favorit — tim kami yang menyusun, menyesuaikan, dan mengirimkan link undangannya kepada Anda.
            </p>
            <button
              onClick={() => openOrder()}
              className="mt-9 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#b98a3e]/20 transition-transform hover:scale-[1.02]"
            >
              Pesan Undangan <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-xs text-[#b3a69a]">Dibalas lewat WhatsApp — tanpa perlu membuat akun.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#e7ddcc] bg-[#faf7f2]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white ring-1 ring-[#d9c795]">
                  <Image src="/logo/prasha.png" width={36} height={36} alt="Prasha Digital" className="h-9 w-9 object-cover" />
                </span>
                <div className="leading-tight">
                  <p className="font-script text-xl text-[#b98a3e]">Prasha</p>
                  <p className="-mt-1 text-[8px] font-semibold uppercase tracking-[0.35em] text-[#8a7a66]">Digital Indonesia</p>
                </div>
              </div>
              <nav className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#8a7a66]">
                <a href="#catalog" className="transition-colors hover:text-[#2b2620]">Template</a>
                <a href="#cara" className="transition-colors hover:text-[#2b2620]">Cara Kerja</a>
                <a href="#bahan" className="transition-colors hover:text-[#2b2620]">Bahan</a>
                <a href="#syarat" className="transition-colors hover:text-[#2b2620]">Syarat</a>
              </nav>
            </div>
            <div className="mt-8 border-t border-[#e7ddcc] pt-5 text-center">
              <Ornament className="mb-3" />
              <p className="text-xs text-[#b3a69a]">
                &copy; {new Date().getFullYear()} Prasha Digital Indonesia &middot; Undangan digital mewah dan personal.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {orderOpen && <OrderDialog templateName={orderTemplate} onClose={() => setOrderOpen(false)} />}
    </div>
  );
}