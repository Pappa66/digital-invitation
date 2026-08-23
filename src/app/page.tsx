'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteOrigin } from '@/lib/site';
import PricingSection from '@/components/landing/pricing-section';
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
  Image as ImageIcon,
  Sparkles,
  Heart,
  Clock,
  Mail,
  Star,
  Camera
} from 'lucide-react';
import { DEMO_TEMPLATES, getTemplate } from '@/lib/templates';
import { CATEGORIES, categoryLabel, type TemplateCategory } from '@/lib/template-categories';
import TemplatePreview from '@/components/landing/template-preview';
import OrderDialog from '@/components/landing/order-dialog';

import { LANDING_CONTENT_DEFAULTS, type LandingContent } from '@/lib/settings';
import { listTemplateDemos, type TemplateDemo } from '@/lib/api/template-demo-client';
import type { CanvasData, TemplateMeta } from '@/lib/types';

interface CardData {
  meta: TemplateMeta;
  canvas: CanvasData;
}

const ICON_MAP: Record<string, typeof Palette> = {
  Palette,
  MessageCircle,
  CheckCircle,
  Share2,
  Gift,
  QrCode,
  Music,
  Image: ImageIcon,
  MapPin,
  Smartphone,
  Sparkles,
  Heart,
  Clock,
  Mail,
  Star,
  Camera
};

const PER_PAGE = 9;
const FEATURED = ['elegant-gold', 'blush-romance', 'ivory-dawn'];

/** Struktur konten landing yang dinamis. Fallback ke default bila kosong. */
const EMPTY_CONTENT = null as LandingContent | null;

export default function LandingPage() {
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [category, setCategory] = useState<TemplateCategory | 'semua'>('semua');
  const [page, setPage] = useState(1);
  const [orderOpen, setOrderOpen] = useState(false);
  const [orderTemplate, setOrderTemplate] = useState<string | undefined>(undefined);
  const [pricing, setPricing] = useState({ base_price: 0, discount_percent: 0, promo_code: '', promo_expires_at: '', show_pricing: false });
  const [landingContent, setLandingContent] = useState<LandingContent | null>(EMPTY_CONTENT);
  const [demoIds, setDemoIds] = useState<Set<string> | null>(null);
  const [demos, setDemos] = useState<TemplateDemo[]>([]);
  const [landingReady, setLandingReady] = useState(false);

  // Fallback: bila Supabase redirect ke /?code=... (whitelist belum berisi /auth/callback), lempar ke handler yang benar
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get('code');
    if (code) {
      setAuthRedirecting(true);
      const next = sp.get('next') ?? '/dashboard';
      const q = new URLSearchParams({ code, next });
      const err = sp.get('error');
      const desc = sp.get('error_description');
      if (err) q.set('error', err);
      if (desc) q.set('error_description', desc);
      const origin = getSiteOrigin();
      window.location.replace(`${origin}/auth/callback?${q.toString()}`);
    }
  }, []);

  useEffect(() => {
    import('@/lib/settings').then(({ getPricing }) => getPricing().then(setPricing)).catch(() => {});
    import('@/lib/settings').then(({ getLandingContent }) => getLandingContent().then(setLandingContent)).catch(() => {});
  }, []);

  useEffect(() => {
    import('@/lib/demo/demo-templates').then(({ demoReadEnabledIds }) => setDemoIds(demoReadEnabledIds())).catch(() => setDemoIds(null));
  }, []);

  useEffect(() => {
    let alive = true;
    listTemplateDemos().then((rows) => {
      if (alive) setDemos(rows);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setLandingReady(true), 400);
    return () => clearTimeout(t);
  }, [demoIds, demos]);

  function openOrder(templateName?: string) {
    setOrderTemplate(templateName);
    setOrderOpen(true);
  }

  const isLandingLoading = !landingReady && demoIds === null;
  const cards = useMemo<CardData[]>(
    () => {
      const source = demoIds === null ? DEMO_TEMPLATES : DEMO_TEMPLATES.filter((t) => demoIds.has(t.id));
      return source.map((meta) => ({ meta, canvas: getTemplate(meta.id)! }));
    },
    [demoIds]
  );

  const filtered = useMemo(() => {
    if (category === 'semua') return cards;
    return cards.filter((c) => (c.meta.category ?? '').toLowerCase() === category);
  }, [cards, category]);

  const featuredCards = useMemo(
    () => DEMO_TEMPLATES.filter((t) => FEATURED.includes(t.id)).map((meta) => ({ meta, canvas: getTemplate(meta.id)! })).slice(0, 3),
    []
  );

  const demosByTemplate = useMemo(() => {
    const map = new Map<string, TemplateDemo>();
    for (const d of demos) map.set(d.template_id, d);
    return map;
  }, [demos]);

  /** Gambar demo untuk 3 template unggulan (kolase hero) bila demo_image ada. */
  const featuredDemoImages = useMemo(
    () =>
      featuredCards.map(({ meta }) => {
        const demo = demosByTemplate.get(meta.id);
        return demo?.demo_image || null;
      }),
    [featuredCards, demosByTemplate]
  );

  const content = landingContent ?? LANDING_CONTENT_DEFAULTS;
  const heroImages = content.hero.images.filter((img) => img.url.trim().length > 0).slice(0, 3);
  const collageImages = heroImages;
  const collagePreviews = featuredCards.slice(0, 3);

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

  if (authRedirecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-strong border-t-transparent" aria-hidden />
        <p className="text-sm font-medium">Memverifikasi login...</p>
        <p className="text-xs text-muted-foreground">Mengalihkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* SEO: JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'Prasha Digital Indonesia',
            description: 'Undangan digital mewah dan personal untuk hari bahagia Anda.',
            url: 'https://undangan-digital.prashadigitalindonesia.com',
            logo: 'https://undangan-digital.prashadigitalindonesia.com/logo/prasha.png',
            areaServed: 'ID',
            serviceType: 'Undangan Digital Pernikahan',
            priceRange: '$$',
            sameAs: [
              'https://instagram.com/prashadigitalindonesia',
              'https://prashadigitalindonesia.com'
            ],
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer service',
              availableLanguage: 'Indonesian',
              url: `https://wa.me/${content.footer.whatsapp || '6281234567890'}`
            },
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Template Undangan Digital',
              itemListElement: DEMO_TEMPLATES.slice(0, 10).map((t) => ({
                '@type': 'Offer',
                itemOffered: {
                  '@type': 'Product',
                  name: t.name,
                  description: `Template undangan digital ${t.name}`
                }
              }))
            }
          })
        }}
      />

      {/* BG */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsla(40,50%,57%,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(200,155,138,0.07),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
            <a href="https://prashadigitalindonesia.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-foreground ring-1 ring-foreground/20">
                <Image src="/logo/prasha.png" width={40} height={40} alt="Prasha Digital Indonesia" className="h-10 w-10 object-cover" />
              </span>
              <div className="leading-tight">
                <p className="font-script text-2xl text-gold-strong">Prasha</p>
                <p className="-mt-1 text-[9px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Digital Indonesia</p>
              </div>
            </a>
            <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Navigasi halaman">
              <a href="#catalog" className="transition-colors hover:text-foreground">Demo Template</a>
              <a href="#cara" className="transition-colors hover:text-foreground">Cara Kerja</a>
              <a href="#fitur" className="transition-colors hover:text-foreground">Fitur</a>
              <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
            </nav>
            <button
              onClick={() => openOrder()}
              className="rounded-md bg-gradient-to-r from-gold to-gold-strong px-4 py-2 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Pesan Undangan
            </button>
          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="text-center lg:text-left">
              <p className="font-script text-3xl text-gold-deep sm:text-4xl lg:text-5xl">{content.hero.kicker}</p>
              <h1 className="mt-6 font-heading text-display-xl font-medium leading-[1.1] tracking-tight sm:text-display-2xl lg:text-[3.5rem] lg:leading-[1.08]">
                {content.hero.title_a}
                <span className="block">
                  <em className="bg-gradient-to-r from-gold-deep to-gold-ink bg-clip-text font-semibold italic text-transparent">{content.hero.title_b}</em>
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground lg:mx-0 lg:max-w-lg lg:text-base">
                {content.hero.subtitle}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <a
                  href="#catalog"
                  className="flex min-h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-gold to-gold-strong px-7 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] lg:min-h-14 lg:px-9 lg:text-base"
                >
                  {content.hero.cta_primary} <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
                <button
                  onClick={() => openOrder()}
                  className="min-h-12 rounded-lg border border-gold/60 px-7 py-3 text-sm font-medium text-gold-deep transition-colors hover:bg-gold/10 lg:min-h-14 lg:px-9 lg:text-base"
                >
                  {content.hero.cta_secondary}
                </button>
              </div>
              <p className="mt-7 text-xs text-muted-foreground lg:text-sm">
                {DEMO_TEMPLATES.length} demo siap dilihat &middot; Pilih desain, isi form, kami kerjakan sisanya.
              </p>
            </div>
            {/* KOLASE 3 GAMBAR — larger on desktop */}
            <div className="relative mx-auto w-full max-w-md min-w-0 lg:max-w-lg xl:max-w-xl" aria-hidden>
              <div className="grid min-w-0 grid-cols-12 grid-rows-2 gap-4 lg:gap-5" style={{ height: 460 }}>
                {/* foto besar kiri */}
                <div className="relative col-span-7 row-span-2 min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card">
                  {collageImages[0] ? (
                    <Image src={collageImages[0].url} alt={collageImages[0].alt || 'Undangan'} fill className="object-cover" sizes="(max-width: 768px) 60vw, 320px" />
                  ) : featuredDemoImages[0] ? (
                    <Image src={featuredDemoImages[0]} alt="Demo undangan" fill className="object-cover" sizes="(max-width: 768px) 60vw, 320px" />
                  ) : collagePreviews[0] ? (
                    <TemplatePreview canvas={collagePreviews[0].canvas} bg={collagePreviews[0].canvas.theme.background} />
                  ) : null}
                </div>
                {/* foto kecil kanan atas */}
                <div className="relative col-span-5 min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {collageImages[1] ? (
                    <Image src={collageImages[1].url} alt={collageImages[1].alt || 'Undangan'} fill className="object-cover" sizes="(max-width: 768px) 40vw, 220px" />
                  ) : featuredDemoImages[1] ? (
                    <Image src={featuredDemoImages[1]} alt="Demo undangan" fill className="object-cover" sizes="(max-width: 768px) 40vw, 220px" />
                  ) : collagePreviews[1] ? (
                    <TemplatePreview canvas={collagePreviews[1].canvas} bg={collagePreviews[1].canvas.theme.background} />
                  ) : null}
                </div>
                {/* foto kecil kanan bawah */}
                <div className="relative col-span-5 min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                  {collageImages[2] ? (
                    <Image src={collageImages[2].url} alt={collageImages[2].alt || 'Undangan'} fill className="object-cover" sizes="(max-width: 768px) 40vw, 220px" />
                  ) : featuredDemoImages[2] ? (
                    <Image src={featuredDemoImages[2]} alt="Demo undangan" fill className="object-cover" sizes="(max-width: 768px) 40vw, 220px" />
                  ) : collagePreviews[2] ? (
                    <TemplatePreview canvas={collagePreviews[2].canvas} bg={collagePreviews[2].canvas.theme.background} />
                  ) : null}
                </div>
              </div>
              {/* aksen sudut halus */}
              <div className="absolute -right-3 -top-3 -z-10 h-24 w-24 rounded-full bg-gradient-to-br from-gold/20 to-transparent lg:-right-4 lg:-top-4 lg:h-28 lg:w-28" />
              <div className="absolute -bottom-5 -left-5 -z-10 h-32 w-32 rounded-full border border-gold/20 lg:-bottom-6 lg:-left-6 lg:h-36 lg:w-36" />
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF BAR */}
        <section className="border-y border-border bg-gradient-to-r from-gold/5 via-background to-gold/5">
          <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 px-4 py-10 sm:px-6 lg:gap-8 lg:py-14">
            {content.stats.map((stat) => (
              <div key={stat.label || String(stat.value)} className="text-center">
                <p className="font-heading text-3xl font-bold text-gold-deep sm:text-4xl lg:text-5xl">
                  {stat.value.toLocaleString('id-ID')}{stat.suffix}
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm lg:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        {pricing.show_pricing && pricing.base_price > 0 && (
          <section className="border-t border-border bg-card/50">
            <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
              <p className="text-center font-script text-3xl text-gold-deep">Investasi</p>
              <h2 className="mt-3 text-center font-heading text-display-lg font-medium text-foreground">Harga Undangan Digital</h2>
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
        <section id="catalog" className="scroll-mt-20 border-t border-border bg-card/50">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="text-center">
              <p className="font-script text-3xl text-gold-deep">Lihat Demo</p>
              <h2 className="mt-5 font-heading text-display-lg font-medium text-foreground sm:text-display-xl">Demo Undangan</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground lg:text-base">Pratinjau asli setiap desain — klik untuk melihat detail, lalu pesan.</p>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <FilterPill active={category === 'semua'} onClick={() => { setCategory('semua'); setPage(1); }} label="Semua" />
              {CATEGORIES.map((c) => (
                <FilterPill key={c.key} active={category === c.key} onClick={() => { setCategory(c.key); setPage(1); }} label={c.label} />
              ))}
            </div>
            {isLandingLoading ? (
              <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse overflow-hidden rounded-3xl border bg-card">
                    <div className="h-64 bg-muted" />
                    <div className="space-y-2 p-6">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : paged.length === 0 ? (
              <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
                <p className="font-heading text-lg font-medium text-foreground">Belum ada template pada kategori ini</p>
                <p className="mt-1 text-sm text-muted-foreground">Coba pilih kategori lain atau kembali ke “Semua”.</p>
                <button
                  onClick={() => { setCategory('semua'); setPage(1); }}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-gold to-gold-strong px-6 py-2.5 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02]"
                >
                  Lihat Semua Template
                </button>
              </div>
            ) : (
              <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
                {paged.map(({ meta, canvas }) => {
                  const number = cards.findIndex((c) => c.meta.id === meta.id) + 1;
                  const demo = demosByTemplate.get(meta.id) ?? null;
                  return <CatalogCard key={meta.id} meta={meta} canvas={canvas} number={number} demo={demo} />;
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} aria-label="Halaman sebelumnya" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:border-gold disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden /></button>
                {Array.from({ length: totalPages }, (_, n) => n + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    aria-label={`Halaman ${n}`}
                    aria-current={n === safePage ? 'page' : undefined}
                    className={`h-11 w-11 rounded-xl text-sm transition-colors ${
                      n === safePage ? 'bg-gradient-to-r from-gold to-gold-strong font-semibold text-foreground shadow-gold' : 'border border-border bg-card text-foreground hover:border-gold'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} aria-label="Halaman berikutnya" className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:border-gold disabled:opacity-40"><ChevronRight className="h-4 w-4" aria-hidden /></button>
              </div>
            )}
          </div>
        </section>

        {/* CARA KERJA */}
        <section id="cara" className="scroll-mt-20 border-t border-border bg-muted/60">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="mb-14 text-center">
              <p className="font-script text-3xl text-gold-deep">Mudah &amp; Cepat</p>
              <h2 className="mt-3 font-heading text-display-lg font-medium text-foreground sm:text-display-xl">4 Langkah Saja</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
              {content.steps.map((s, i) => {
                const IconTrail = ICON_MAP[s.icon] ?? Sparkles;
                return (
                  <div key={i} className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-soft lg:p-8">
                    <span className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-gold to-gold-strong text-[11px] font-bold text-foreground shadow-gold">{i + 1}</span>
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background text-gold-strong"><IconTrail className="h-5 w-5" aria-hidden /></span>
                    <h3 className="mt-4 font-heading text-base font-medium text-foreground">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FITUR */}
        <section id="fitur" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="text-center">
              <p className="font-script text-3xl text-gold-deep">Fitur Lengkap</p>
              <h2 className="mt-3 font-heading text-display-lg font-medium text-foreground sm:text-display-xl">Semua Kebutuhan Undangan</h2>
            </div>
            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {content.features.map((f) => {
                const IconTrail = ICON_MAP[f.icon] ?? Sparkles;
                return (
                  <div key={f.title} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-gold-strong"><IconTrail className="h-5 w-5" aria-hidden /></span>
                    <h3 className="mt-3 font-heading text-sm font-medium text-foreground">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t border-border bg-muted/60">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-24">
            <div className="text-center">
              <p className="font-script text-3xl text-gold-deep">Pertanyaan Umum</p>
              <h2 className="mt-3 font-heading text-display-lg font-medium text-foreground sm:text-display-xl">FAQ</h2>
            </div>
            <div className="mt-12 space-y-3">
              {content.faq.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} defaultOpen={i === 0} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border">
          <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-32">
            <p className="font-script text-4xl text-gold-deep lg:text-5xl">{content.cta.kicker}</p>
            <h2 className="mx-auto mt-5 max-w-2xl font-heading text-display-lg font-medium leading-snug text-foreground sm:text-display-xl">
              {content.cta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground lg:text-base">
              {content.cta.body}
            </p>
            <button
              onClick={() => openOrder()}
              className="mt-9 inline-flex min-h-12 items-center gap-2 rounded-lg bg-gradient-to-r from-gold to-gold-strong px-8 py-3.5 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] lg:min-h-14 lg:px-10 lg:text-base"
            >
              {content.cta.button_text} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <p className="mt-5 text-xs text-muted-foreground lg:text-sm">Dibalas lewat WhatsApp — tanpa perlu membuat akun.</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border bg-background">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
            <div className="grid gap-8 sm:grid-cols-3 lg:gap-12">
              {/* Brand */}
              <div>
                <a href="https://prashadigitalindonesia.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                  <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-foreground ring-1 ring-foreground/20">
                    <Image src="/logo/prasha.png" width={36} height={36} alt="Prasha Digital Indonesia" className="h-9 w-9 object-cover" />
                  </span>
                  <div className="leading-tight">
                    <p className="font-script text-xl text-gold-strong">Prasha</p>
                    <p className="-mt-1 text-[8px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">Digital Indonesia</p>
                  </div>
                </a>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground lg:text-sm">{content.footer.description}</p>
              </div>

              {/* Links */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">Menu</p>
                <nav className="flex flex-col gap-2 text-xs text-muted-foreground" aria-label="Menu footer">
                  <a href="#catalog" className="transition-colors hover:text-foreground">Demo Template</a>
                  <a href="#cara" className="transition-colors hover:text-foreground">Cara Kerja</a>
                  <a href="#fitur" className="transition-colors hover:text-foreground">Fitur</a>
                  <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
                </nav>
              </div>

              {/* Contact */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-foreground">Hubungi Kami</p>
                <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                  <a href={`https://wa.me/${content.footer.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">WhatsApp</a>
                  <a href={`https://instagram.com/${content.footer.instagram}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Instagram</a>
                  <a href={content.footer.website} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">Website</a>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-border pt-5 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{content.footer.tagline}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">&copy; {new Date().getFullYear()} Prasha Digital Indonesia. Hak cipta dilindungi.</p>
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

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm transition-colors ${
        active
          ? 'bg-gradient-to-r from-gold to-gold-strong font-semibold text-foreground shadow-gold'
          : 'border border-input bg-card text-foreground/80 hover:border-gold hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function FAQItem({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-2xl border border-border bg-card/70 shadow-soft">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-heading text-base font-medium text-foreground">{q}</span>
        <span aria-hidden className={`text-gold-strong transition-transform duration-300 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? `${contentRef.current?.scrollHeight ?? 200}px` : '0px' }}
      >
        <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{a}</p>
      </div>
    </div>
  );
}

/** Kartu katalog demo template — spec `docs/design/demo-card.md` (pola CTA-hanya). */
function CatalogCard({
  meta,
  canvas,
  number,
  demo
}: {
  meta: TemplateMeta;
  canvas: CanvasData;
  number: number;
  demo: TemplateDemo | null;
}) {
  const detailHref = `/templates/${meta.id}`;
  const demoImage = demo?.demo_image || null;
  const demoLink = demo?.demo_link || null;

  const cta = (() => {
    // demo_image + demo_link → "Lihat Demo" (tab baru). demo_image saja → "Lihat Detail".
    // tanpa demo_image → "Preview" (outline) ke halaman detail.
    if (demoImage && demoLink) {
      return (
        <a
          href={demoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-strong px-5 py-2.5 text-sm font-semibold text-foreground shadow-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Eye className="h-4 w-4" aria-hidden /> Lihat Demo
        </a>
      );
    }
    const gold = !!demoImage;
    return (
      <Link
        href={detailHref}
        className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-transform ${
          gold
            ? 'bg-gradient-to-r from-gold to-gold-strong text-foreground shadow-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] hover:scale-[1.02] active:scale-[0.98]'
            : 'border border-gold/50 bg-background text-gold-deep transition-colors hover:bg-gold/10 active:scale-[0.98]'
        }`}
      >
        <Eye className="h-4 w-4" aria-hidden /> {gold ? 'Lihat Detail' : 'Preview'}
      </Link>
    );
  })();

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card">
      <div className="relative px-6 pt-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-muted shadow-soft ring-1 ring-foreground/5">
          {demoImage ? (
            <DemoCardMedia src={demoImage} alt={`Pratinjau template ${meta.name}`} canvas={canvas} eager={number === 1} />
          ) : (
            <TemplatePreview canvas={canvas} bg={canvas.theme.background} />
          )}
          <span
            className={`absolute left-3 top-3 z-10 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm ${
              demoImage ? 'border-white/25 bg-black/40 text-white' : 'border-gold/60 bg-card/90 text-gold-deep'
            }`}
          >
            {categoryLabel(meta.category)}
          </span>
          <span className="absolute right-4 top-4 z-10 rounded-full border border-border bg-card/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground backdrop-blur-sm">
            {String(number).padStart(2, '0')}
          </span>
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" aria-hidden>
            <span className="mt-2 h-[18px] w-20 rounded-full bg-foreground/90 ring-1 ring-white/10" />
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 pt-5">
        <div className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: meta.primary }} />
          <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ background: meta.secondary }} />
          <Link href={detailHref} className="ml-1 truncate font-heading text-base font-medium text-foreground transition-colors hover:text-gold-deep">
            {meta.name}
          </Link>
        </div>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{meta.description}</p>
        {cta}
      </div>
    </article>
  );
}

/** Thumbnail `demo_image` kartu katalog. Bila gambar gagal dimuat, swap otomatis
 *  ke render live `TemplatePreview` (spec demo-card.md §1 row 4). */
function DemoCardMedia({
  src,
  alt,
  canvas,
  eager
}: {
  src: string;
  alt: string;
  canvas: CanvasData;
  eager?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) return <TemplatePreview canvas={canvas} bg={canvas.theme.background} />;

  return (
    <div className="relative aspect-[3/4] bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        loading={eager ? undefined : 'lazy'}
        sizes="(max-width:640px) 92vw, (max-width:1024px) 46vw, 30vw"
        className="object-cover object-[center_30%]"
        onError={() => setBroken(true)}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,8,5,0.08) 0%, rgba(11,8,5,0) 30%, rgba(11,8,5,0.45) 72%, rgba(11,8,5,0.62) 100%)'
        }}
      />
    </div>
  );
}
