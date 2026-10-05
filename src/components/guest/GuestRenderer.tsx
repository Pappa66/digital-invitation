'use client';

import { useEffect, useRef, useState } from 'react';

import type { CanvasData } from '@/lib/types';
import BlockView from '@/components/guest/BlockView';
import MusicPlayer from '@/components/guest/music-player';
import GuestBookWall from '@/components/guest/guest-book';
import CheckIn from '@/components/guest/check-in';
import ShareBar from '@/components/guest/share-bar';
import { PreviewContext } from '@/components/guest/preview-context';
import { ThemeContext } from '@/components/guest/theme-context';
import { GuestFrame } from '@/components/guest/guest-frame';
import GuestNav from '@/components/guest/guest-nav';
import CoverModal from '@/components/guest/cover-modal';
import SectionHeading from '@/components/guest/section-heading';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';

interface GuestRendererProps {
  canvas: CanvasData;
  projectId?: string;
  greetingName?: string;
  preview?: boolean;
  demo?: boolean;
  width?: 'mobile' | 'desktop';
}

const CANVAS_W = 420;

function isLightHex(hex: string): boolean {
  const h = (hex || '').replace('#', '').trim();
  if (h.length !== 6 && h.length !== 3) return false;
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return false;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

function SectionGap() {
  return <div className="h-4" aria-hidden />;
}

/**
 * Section penutup sederhana: ucapan terima kasih + nama pasangan (dari Hero).
 * Rendering kondisional (tanpa setting baru) dan padding bawah ekstra agar
 * tidak bertabrakan dengan ShareBar yang mengambang.
 */
function ClosingSection({ names }: { names: string }) {
  return (
    <section aria-label="Terima kasih" className="relative px-6 pb-28 pt-16 text-center sm:pt-20">
      <SectionHeading kicker="Terima Kasih" title={names || 'Terima Kasih'} />
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed opacity-70">
        Merupakan suatu kebahagiaan dan kehormatan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
      </p>
      <span className="mx-auto mt-6 flex items-center justify-center gap-3 opacity-40" aria-hidden>
        <span className="h-px w-12 bg-current" />
        <span className="h-1.5 w-1.5 rotate-45" style={{ background: 'var(--color-primary)' }} />
        <span className="h-px w-12 bg-current" />
      </span>
    </section>
  );
}

export default function GuestRenderer({ canvas, projectId, greetingName, preview, demo, width = 'mobile' }: GuestRendererProps) {
  const immersive = !preview || !!demo;
  const flow = canvas.flow ?? 'stack';
  const heroBlock = canvas.blocks.find((b) => b.type === 'Hero');
  const coupleNames = [heroBlock?.props.bride, heroBlock?.props.groom].filter(Boolean).join(' & ');
  const showCover = canvas.settings.show_cover !== false;
  const shareMeta = {
    coupleNames,
    date: typeof heroBlock?.props.date === 'string' ? heroBlock.props.date : undefined,
    theme: { primary: canvas.theme.primary, secondary: canvas.theme.secondary, background: canvas.theme.background },
    heroImage: typeof heroBlock?.props.bg_image === 'string' ? heroBlock.props.bg_image : undefined,
    cardBg: canvas.settings.share_card_bg,
    cardCaption: canvas.settings.share_card_caption
  };
  const revealAnim = canvas.theme.scroll_anim ?? 'fade-up';
  const revealIntensity = Math.max(0, Math.min(100, Number(canvas.theme.scroll_intensity ?? 60)));

  const coverHasImage = !!(canvas.settings.cover_bg_image || (typeof heroBlock?.props.bg_image === 'string' && heroBlock.props.bg_image));
  const coverTextColor =
    canvas.theme.cover_text || (coverHasImage ? '#ffffff' : isLightHex(canvas.theme.background) ? '#2b2620' : '#ffffff');

  const styleVars = {
    '--color-primary': canvas.theme.primary,
    '--color-secondary': canvas.theme.secondary,
    '--color-background': canvas.theme.background,
    '--color-text': canvas.theme.text,
    '--cover-text': coverTextColor,
    '--reveal-dist': `${(12 + revealIntensity * 0.36).toFixed(0)}px`,
    '--reveal-dur': `${(0.4 + revealIntensity * 0.006).toFixed(2)}s`,
    '--font-heading': `'${canvas.theme.font_heading}', serif`,
    '--font-body': `'${canvas.theme.font_body}', sans-serif`
  } as React.CSSProperties;

  const rootClass =
    'guest-root relative w-full min-w-0 overflow-x-clip box-border ' +
    (canvas.theme.card_style ? 'guest-card-style ' : '') +
    (width === 'desktop' ? 'mx-auto max-w-[430px] sm:max-w-[430px]' : 'mx-auto w-full max-w-none sm:max-w-[430px]');

  const rootRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);
  const [revealOn, setRevealOn] = useState(false);

  /**
   * Read-receipt: tandai undangan tamu benar-benar dibuka (bukan preview
   * builder / demo) SEKALI PER SESI per project. Fire-and-forget — tidak
   * memblokir render dan error diabaikan agar tidak mengganggu tamu.
   */
  useEffect(() => {
    if (viewedRef.current) return;
    if (preview || demo || !projectId || demoIsDemoMode()) return;
    viewedRef.current = true;
    const key = `di_viewed_${projectId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* sessionStorage tidak tersedia — tetap coba catat */
    }
    void supabase
      .rpc('record_invitation_view', { p_project_id: projectId })
      .then(
        () => undefined,
        () => undefined
      );
  }, [preview, demo, projectId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!els.length || typeof IntersectionObserver === 'undefined') return;
    setRevealOn(true);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-reveal-visible', '');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [canvas.blocks.length, preview]);

  const coverProps = {
    caption: typeof heroBlock?.props.caption === 'string' ? heroBlock.props.caption : 'Undangan Pernikahan',
    bride: typeof heroBlock?.props.bride === 'string' ? heroBlock.props.bride : '',
    groom: typeof heroBlock?.props.groom === 'string' ? heroBlock.props.groom : '',
    date: typeof heroBlock?.props.date === 'string' ? heroBlock.props.date : '',
    bgImage: typeof heroBlock?.props.bg_image === 'string' ? heroBlock.props.bg_image : undefined,
    greetingName,
    primary: canvas.theme.primary,
    secondary: canvas.theme.secondary,
    background: canvas.theme.background,
    text: canvas.theme.text,
    ornament: typeof canvas.theme.ornament === 'string' ? canvas.theme.ornament : undefined,
    coverGreeting: canvas.settings.cover_greeting,
    coverButtonText: canvas.settings.cover_button_text,
    coverBgImage: canvas.settings.cover_bg_image,
    coverStyle: canvas.theme.cover_style,
    coverValign: canvas.theme.cover_valign
  };

  if (flow === 'free') {
    const height = canvas.blocks.reduce((m, b) => (b.layout ? Math.max(m, b.layout.y) : m), 0) + 900;
    return (
      <PreviewContext.Provider value={!!preview}>
        <ThemeContext.Provider value={canvas.theme}>
        <div className={`${rootClass} relative`} style={{ ...styleVars, minHeight: Math.max(height, 1200) }}>
          {canvas.blocks.map((block) =>
            block.layout ? (
              <div
                key={block.id}
                style={{ position: 'absolute', left: block.layout.x, top: block.layout.y, width: block.layout.width, maxWidth: CANVAS_W }}
              >
                <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} checkinEnabled={canvas.settings.checkin_enabled !== false} />
              </div>
            ) : (
              <BlockView key={block.id} block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} checkinEnabled={canvas.settings.checkin_enabled !== false} />
            )
          )}
          {immersive && <MusicPlayer settings={canvas.settings} />}
          {immersive && <ShareBar {...shareMeta} />}
          {/* nav dihilangkan */}
          <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />
          {immersive && showCover && <CoverModal {...coverProps} />}
        </div>
        </ThemeContext.Provider>
      </PreviewContext.Provider>
    );
  }

  return (
    <PreviewContext.Provider value={!!preview}>
      <ThemeContext.Provider value={canvas.theme}>
      <div ref={rootRef} className={`${rootClass}${revealOn && revealAnim !== "none" ? " js-reveal" : ""}`} style={styleVars}>
        {canvas.blocks.map((block, i) => (
          <div key={block.id} data-reveal={revealAnim}>
            <BlockView block={block} projectId={projectId} greetingName={greetingName} cardStyle={canvas.theme.card_style} demo={immersive && !!demo} showCoverButton={!showCover} checkinEnabled={canvas.settings.checkin_enabled !== false} />
            {i < canvas.blocks.length - 1 && <SectionGap />}
          </div>
        ))}
        {!preview && canvas.settings.guest_book_enabled && <GuestBookWall projectId={projectId} background={canvas.settings.guest_book_bg} backgroundImage={canvas.settings.guest_book_bg_image} backgroundFit={canvas.settings.guest_book_bg_fit} backgroundPosition={canvas.settings.guest_book_bg_position} backgroundBlur={canvas.settings.guest_book_bg_blur} />}
        {!preview && projectId && canvas.settings.checkin_enabled !== false && (
          <CheckIn
            projectId={projectId}
            greetingName={greetingName}
            preview={preview}
            showSeatInfo={!!canvas.settings.show_seat_info}
            tableLabel={typeof canvas.settings.table_label === 'string' ? canvas.settings.table_label : undefined}
            seatLabel={typeof canvas.settings.seat_label === 'string' ? canvas.settings.seat_label : undefined}
          />
        )}
        <ClosingSection names={coupleNames} />
        {immersive && <MusicPlayer settings={canvas.settings} />}
        {immersive && <ShareBar {...shareMeta} />}
        {/* nav dihilangkan */}
        <GuestFrame mode={canvas.theme.frame} color={canvas.theme.secondary} fixed={!preview} />
        {immersive && showCover && <CoverModal {...coverProps} />}
      </div>
      </ThemeContext.Provider>
    </PreviewContext.Provider>
  );
}
