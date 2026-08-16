'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatRupiah } from '@/lib/format';
import PricingSection from '@/components/landing/pricing-section';
import PhoneFrame from '@/components/ui/phone-frame';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Eye,
  Palette,
  Smartphone,
  Share2,
  Music,
  MapPin,
  MessageCircle,
  Gift,
  CheckCircle,
  QrCode,
  Image as ImageIcon
} from 'lucide-react';
import { DEMO_TEMPLATES, getTemplate } from '@/lib/templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import TemplatePreview from '@/components/landing/template-preview';
import OrderDialog from '@/components/landing/order-dialog';
import type { CanvasData, TemplateMeta } from '@/lib/types';

interface CardData {
  meta: TemplateMeta;
  canvas: CanvasData;
}

const STEPS = [
  { icon: Palette, title: 'Pilih Desain', body: 'Jelajahi demo kami, pilih yang paling dekat dengan cerita Anda.' },
  { icon: MessageCircle, title: 'Isi Form & Bayar', body: 'Isi data mempelai, acara, dan foto. Konfirmasi pembayaran via WhatsApp.' },
  { icon: CheckCircle, title: 'Kami Kerjakan', body: 'Tim kami menyusun teks, foto, musik, dan link undangan — siap dalam 2-5 hari kerja.' },
  { icon: Share2, title: 'Bagikan', body: 'Terbitkan link, kirim per tamu lewat WhatsApp, pantau RSVP dari dasbor.' }
];

const FEATURES = [
  { icon: MessageCircle, title: 'RSVP & Buku Tamu', desc: 'Konfirmasi kehadiran dalam sekali ketuk, ucapan & doa tampil langsung.' },
  { icon: Gift, title: 'Amplop Digital', desc: 'Nomor rekening tersembunyi, muncul saat tombol "Beri Kado" ditekan.' },
  { icon: QrCode, title: 'QR Check-in', desc: 'Tamu memindai QR di venue untuk absen masuk — daftar kehadiran siap diunduh.' },
  { icon: Music, title: 'Musik Latar', desc: 'Autoplay atau on-demand, dengan offset untuk mulai dari bagian tertentu.' },
  { icon: ImageIcon, title: 'Galeri Animasi', desc: '20 efek foto termasuk ken-burns, flip, carousel, dan zoom.' },
  { icon: MapPin, title: 'Detail Acara & Peta', desc: 'Tombol Maps satu klik, "Simpan ke Kalender", dan opsi live streaming.' },
  { icon: Smartphone, title: 'Responsif Mobile', desc: 'Optimal di semua ukuran layar — tamu buka dari HP tanpa masalah.' },
  { icon: Palette, title: 'Bingkai & Gaya Kartu', desc: '9 pilihan frame dekoratif, 6 gaya kartu, animasi masuk.' }
];

const FAQ = [
  { q: 'Bagaimana cara memesan?', a: 'Pilih demo, isi form pemesanan, lalu konfirmasi via WhatsApp. Tim kami akan menghubungi Anda untuk detail selanjutnya.' },
  { q: 'Berapa lama prosesnya?', a: '2-5 hari kerja setelah materi lengkap dan pembayaran dikonfirmasi. Revisi maksimal 2x sudah termasuk.' },
  { q: 'Apakah tamu perlu bayar untuk melihat undangan?', a: 'Tidak. Tamu cukup membuka link — musik, galeri, RSVP, QR check-in, dan buku tamu semuanya gratis.' },
  { q: 'Bisakah saya mengelola daftar tamu?', a: 'Bisa. Kirimkan daftar nama, dan kami personalisasikan link + ucapan WhatsApp per tamu. Anda pantau semuanya dari dasbor.' },
  { q: 'Apa yang saya terima?', a: 'Link undangan digital yang sudah diisi lengkap dengan panel kelola tamu, RSVP, dan daftar kehadiran hari-H.' }
];

const PER_PAGE = 9;
const FEATURED = ['elegant-gold', 'blush-romance', 'ivory-dawn'];

export default function LandingPage() {
  const [category, setCategory] = useState<TemplateCategory | 'semua'>('semua');
  const [page, setPage] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderTemplate, setOrderTemplate] = useState<string | undefined>(undefined);
  const [pricing, setPricing] = useState({ base_price: 0, discount_percent: 0, promo_code: '', promo_expires_at: '', show_pricing: false });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('di_landing_pricing');
      if (stored) setPricing(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  function openOrder(templateName?: string) {
    setOrderTemplate(templateName);
    setOrderOpen(true);
  }

  const cards = useMemo<CardData[]>(
    () => DEMO_TEMPLATES.map((meta) => ({ meta, canvas: getTemplate(meta.id)! })),
    []
  );

  const filtered = useMemo(() => {
    if (category === 'semua') return cards;
    return cards.filter((c) => (c.meta.category ?? '').toLowerCase() === category);
  }, [cards, category]);

  const featuredCards = useMemo(
    () => DEMO_TEMPLATES.filter((t) => FEATURED.includes(t.id)).map((meta) => ({ meta, canvas: getTemplate(meta.id)! })).slice(0, 3),
    []
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => {
    const families = Array.from(new Set(DEMO_TEMPLATES.flatMap((t) => { const c = getTemplate(t.id); return c ? [c.theme.font_heading, c.theme.font_body] : []; })));
    const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${encodeURIComponent(f)}`).join('&')}&display=swap`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#2b2620] antialiased">
      {/* BG */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,138,0.06),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-[#e7ddcc]/80 bg-[#faf7f2]/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <a href="https://prashadigitalindonesia.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-[#3a332b]">
                <Image src="/logo/prasha.png" width={40} height={40} alt="Prasha Digital Indonesia" className="h-10 w-10 object-cover" />
              </span>
              <div className="leading-tight">
                <p className="font-script text-2xl text-[#b98a3e]">Prasha</p>
                <p className="-mt-1 text-[9px] font-semibold uppercase tracking-[0.35em] text-[#8a7a66]">Digital Indonesia</p>
              </div>
            </a>
            <nav className="hidden items-center gap-6 text-sm text-[#8a7a66] md:flex">
              <a href="#catalog" className="transition-colors hover:text-[#2b2620]">Demo</a>
              <a href="#cara" className="transition-colors hover:text-[#2b2620]">Cara Kerja</a>
              <a href="#fitur" className="transition-colors hover:text-[#2b2620]">Fitur</a>
              <a href="#faq" className="transition-colors hover:text-[#2b2620]">FAQ</a>
            </nav>
            <button onClick={() => openOrder()} className="rounded-md bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]">
              Pesan Undangan
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <p className="font-script text-3xl text-[#b98a3e] sm:text-4xl">Undangan Digital Pernikahan</p>
              <h1 className="mt-6 font-heading text-4xl font-medium leading-[1.15] tracking-tight text-[#2b2620] sm:text-6xl">
                Merayakan cinta,<br />
                <em className="bg-gradient-to-r from-[#b98a3e] to-[#8a6d2f] bg-clip-text font-semibold italic text-transparent">dalam karya yang abadi.</em>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[#8a7a66] lg:mx-0">
                Pilih desain favorit, isi form pemesanan, dan tim kami menyusun teks, foto, musik, serta link undangannya — Anda tinggal terima hasilnya.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a href="#catalog" className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]">
                  Jelajahi Demo <ArrowRight className="h-4 w-4" />
                </a>
                <button onClick={() => openOrder()} className="rounded-lg border border-[#c9a45c] px-7 py-3 text-sm font-medium text-[#8a6d2f] transition-colors hover:bg-[#c9a45c]/10">
                  Pesan Undangan
                </button>
              </div>
              <p className="mt-7 text-xs text-[#b3a69a]">
                {DEMO_TEMPLATES.length} demo siap dilihat &middot; Pilih desain, isi form, kami kerjakan sisanya.
              </p>
            </div>
            {/* PREVIEW PHONE MOCKUP */}
            <div className="relative mx-auto hidden w-full max-w-md lg:block" aria-hidden>
              <PhoneFrame accent={featuredCards[0]?.canvas.theme.primary}>
                {featuredCards[0] && (
                  <TemplatePreview canvas={featuredCards[0].canvas} bg={featuredCards[0].canvas.theme.background} />
                )}
              </PhoneFrame>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <section className="border-y border-[#e7ddcc] bg-gradient-to-r from-[#c9a45c]/5 via-[#faf7f2] to-[#c9a45c]/5">
          <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 px-4 py-10 sm:px-6">
            {[
              { value: 500, suffix: '+', label: 'Undangan Dikirim' },
              { value: 10000, suffix: '+', label: 'Tamu Hadir' },
              { value: 39, suffix: '+', label: 'Demo Tersedia' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl font-bold text-[#c9a45c] sm:text-4xl">
                  {stat.value.toLocaleString('id-ID')}{stat.suffix}
                </p>
                <p className="mt-1 text-xs text-[#8a7a66] sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        {pricing.show_pricing && pricing.base_price > 0 && (
          <section className="border-t border-[#e7ddcc] bg-white/40">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <p className="text-center font-script text-3xl text-[#b98a3e]">Investasi</p>
              <h2 className="mt-3 text-center font-heading text-3xl font-medium text-[#2b2620]">Harga Undangan Digital</h2>
              <div className="mt-8 flex justify-center">
                <PricingSection
                  basePrice={pricing.base_price}
                  discountPercent={pricing.discount_percent}
                  promoCode={pricing.promo_code}
                  promoExpiresAt={pricing.promo_expires_at}
                  onOrder={() => openOrder()}
                />
              </div>
            </div>
          </section>
        )}

        {/* KATALOG */}
        <section id="catalog" className="scroll-mt-20 border-t border-[#e7ddcc] bg-white/40">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Lihat Demo</p>
              <h2 className="mt-5 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Demo Undangan</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#8a7a66]">Pratinjau asli setiap desain — klik untuk melihat detail, lalu pesan.</p>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => { setCategory('semua'); setPage(1); }} className={`rounded-full px-5 py-1.5 text-sm transition-colors ${category === 'semua' ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm' : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'}`}>Semua</button>
              {CATEGORIES.map((c) => (
                <button key={c.key} onClick={() => { setCategory(c.key); setPage(1); }} className={`rounded-full px-5 py-1.5 text-sm transition-colors ${category === c.key ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm' : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'}`}>{c.label}</button>
              ))}
            </div>
            <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {paged.map(({ meta, canvas }) => {
                const number = cards.findIndex((c) => c.meta.id === meta.id) + 1;
                return (
                  <Link key={meta.id} href={`/templates/${meta.id}`} className="group relative flex flex-col overflow-hidden rounded-xl border border-[#e7ddcc] bg-white transition-all hover:-translate-y-1.5 hover:border-[#c9a45c] hover:shadow-xl hover:shadow-[#b98a3e]/10">
                    <div className="relative overflow-hidden">
                      <TemplatePreview canvas={canvas} bg={canvas.theme.background} />
                      <span className="pointer-events-none absolute -left-1 bottom-0 select-none font-heading text-7xl font-semibold text-[#b98a3e]/[0.08] transition-colors group-hover:text-[#b98a3e]/20">{String(number).padStart(2, '0')}</span>
                      <span className="absolute right-3 top-3 rounded-full border border-[#d9c795]/70 bg-white/85 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-[#8a6d2f] backdrop-blur-sm">{categoryLabel(meta.category)}</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-[#e0d6c2]" style={{ background: meta.primary }} />
                        <span className="h-3.5 w-3.5 rounded-full border border-[#e0d6c2]" style={{ background: meta.secondary }} />
                        <p className="ml-1 font-heading text-base font-medium text-[#2b2620]">{meta.name}</p>
                      </div>
                      <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-[#8a7a66]">{meta.description}</p>
                      <span className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[#d9c795] bg-[#faf7f2] px-3 py-2 text-sm font-medium text-[#8a6d2f] transition-colors group-hover:bg-gradient-to-r group-hover:from-[#c9a45c] group-hover:to-[#b98a3e] group-hover:text-white">
                        <Eye className="h-4 w-4" /> Lihat Demo
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c] disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
                {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                  <button key={n} onClick={() => setPage(n)} className={`h-9 w-9 rounded-lg text-sm transition-colors ${n === safePage ? 'bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] font-medium text-white shadow-sm' : 'border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c]'}`}>{n}</button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e0d6c2] bg-white text-[#4a443c] hover:border-[#c9a45c] disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
              </div>
            )}
          </div>
        </section>

        {/* CARA KERJA */}
        <section id="cara" className="scroll-mt-20 border-t border-[#e7ddcc] bg-[#f4eee1]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="mb-14 text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Mudah & Cepat</p>
              <h2 className="mt-3 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">4 Langkah Saja</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="relative rounded-xl border border-[#e7ddcc] bg-white p-6 text-center shadow-sm">
                    <span className="absolute -top-3 left-6 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] text-[10px] font-bold text-white">{i + 1}</span>
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#faf7f2] text-[#b98a3e]"><Icon className="h-5 w-5" /></span>
                    <h3 className="mt-4 font-heading text-base font-medium text-[#2b2620]">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#8a7a66]">{s.body}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FITUR */}
        <section id="fitur" className="scroll-mt-20 border-t border-[#e7ddcc]">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Fitur Lengkap</p>
              <h2 className="mt-3 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">Semua Kebutuhan Undangan</h2>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="rounded-xl border border-[#e7ddcc] bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#faf7f2] text-[#b98a3e]"><Icon className="h-5 w-5" /></span>
                    <h3 className="mt-3 font-heading text-sm font-medium text-[#2b2620]">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-[#8a7a66]">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-[#e7ddcc] bg-[#f4eee1]">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <p className="font-script text-3xl text-[#b98a3e]">Pertanyaan Umum</p>
              <h2 className="mt-3 font-heading text-3xl font-medium text-[#2b2620] sm:text-4xl">FAQ</h2>
            </div>
            <div className="mt-12 space-y-3">
              {FAQ.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#e7ddcc]">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6">
            <p className="font-script text-4xl text-[#b98a3e]">Undangan Anda menanti.</p>
            <h2 className="mx-auto mt-5 max-w-2xl font-heading text-3xl font-medium leading-snug text-[#2b2620] sm:text-5xl">
              Siap merayakan hari besar dengan <em className="italic">elegan</em>?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-[#8a7a66]">
              Pilih demo, isi form, bayar — kami kerjakan sisanya.
            </p>
            <button onClick={() => openOrder()} className="mt-9 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#b98a3e]/20 transition-transform hover:scale-[1.02]">
              Pesan Undangan <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-5 text-xs text-[#b3a69a]">Dibalas lewat WhatsApp — tanpa perlu membuat akun.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#e7ddcc] bg-[#faf7f2]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid gap-8 sm:grid-cols-3">
              {/* Brand */}
              <div>
                <a href="https://prashadigitalindonesia.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-black ring-1 ring-[#3a332b]">
                    <Image src="/logo/prasha.png" width={36} height={36} alt="Prasha Digital Indonesia" className="h-9 w-9 object-cover" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-script text-xl text-[#b98a3e]">Prasha</p>
                    <p className="-mt-1 text-[8px] font-semibold uppercase tracking-[0.35em] text-[#8a7a66]">Digital Indonesia</p>
                  </div>
                </a>
                <p className="mt-3 text-xs leading-relaxed text-[#8a7a66]">Undangan digital mewah dan personal untuk hari istimewa Anda.</p>
              </div>

              {/* Links */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#2b2620]">Menu</p>
                <nav className="flex flex-col gap-2 text-xs text-[#8a7a66]">
                  <a href="#catalog" className="transition-colors hover:text-[#2b2620]">Demo Template</a>
                  <a href="#cara" className="transition-colors hover:text-[#2b2620]">Cara Kerja</a>
                  <a href="#fitur" className="transition-colors hover:text-[#2b2620]">Fitur</a>
                  <a href="#faq" className="transition-colors hover:text-[#2b2620]">FAQ</a>
                </nav>
              </div>

              {/* Contact */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#2b2620]">Hubungi Kami</p>
                <div className="flex flex-col gap-2 text-xs text-[#8a7a66]">
                  <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#2b2620]">WhatsApp</a>
                  <a href="https://instagram.com/prashadigitalindonesia" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#2b2620]">Instagram</a>
                  <a href="https://prashadigitalindonesia.com" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#2b2620]">Website</a>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-[#e7ddcc] pt-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#b3a69a]">Made with Love by PT. Prasha Digital Indonesia</p>
              <p className="mt-1 text-[10px] text-[#b3a69a]">&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
      {orderOpen && (
        <OrderDialog
          templateName={orderTemplate}
          basePrice={pricing.base_price}
          discountPercent={pricing.discount_percent}
          promoCode={pricing.promo_code}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </div>
  );
}

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden rounded-xl border border-[#e7ddcc] bg-white/70">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-heading text-base font-medium text-[#2b2620]">{q}</span>
        <span className={`text-[#b98a3e] transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-[#8a7a66]">{a}</p>}
    </div>
  );
}
