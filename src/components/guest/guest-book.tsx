'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { demoListRsvps, demoSetRsvpListener } from '@/lib/demo/demo-store';
import { demoIsDemoMode } from '@/lib/env';
import type { Rsvp } from '@/lib/types';

interface GuestBookWallProps {
  projectId?: string;
  title?: string;
  background?: string;
  backgroundImage?: string;
  backgroundFit?: 'cover' | 'contain';
  backgroundPosition?: string;
  backgroundBlur?: number;
}

const PER_PAGE = 10;
const MAX_PAGES = 10; // maksimal 100 ucapan

function initial(name: string): string {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
}

function timeAgo(iso?: string): string {
  if (!iso) return '';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'Baru saja';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Buku tamu: ucapan & doa terbaru dari para tamu (reload saat RSVP baru masuk). */
export default function GuestBookWall({
  projectId,
  title,
  background,
  backgroundImage,
  backgroundFit,
  backgroundPosition,
  backgroundBlur
}: GuestBookWallProps) {
  const [items, setItems] = useState<Rsvp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(
    async (pageIndex: number) => {
      if (!projectId) {
        setItems([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        if (demoIsDemoMode()) {
          const all = demoListRsvps(projectId).filter((r) => (r.message ?? '').trim().length > 0);
          setTotal(all.length);
          setItems(all.slice(pageIndex * PER_PAGE, pageIndex * PER_PAGE + PER_PAGE));
          return;
        }
        const { data } = await supabase.rpc('get_guest_book_messages', {
          p_project_id: projectId,
          p_limit: PER_PAGE,
          p_offset: pageIndex * PER_PAGE
        });
        const raw = (data ?? []) as unknown as Rsvp[];
        const rows = raw.filter((r) => (r.message ?? '').trim().length > 0);
        setItems(rows.slice(0, PER_PAGE));
        const first = raw[0] as { total?: number } | undefined;
        setTotal(raw.length ? Number(first?.total ?? rows.length) : 0);
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  useEffect(() => {
    if (!projectId) {
      setItems([]);
      return;
    }
    setPage(0);
    void loadPage(0);
    const off = demoSetRsvpListener(() => {
      void loadPage(0);
    });
    return off;
  }, [projectId, loadPage]);

  const totalPages = Math.min(MAX_PAGES, Math.max(1, Math.ceil(total / PER_PAGE)));

  function goTo(p: number) {
    const np = Math.min(Math.max(0, p), totalPages - 1);
    if (np === page) return;
    setPage(np);
    void loadPage(np);
  }

  return (
    <section
      id="buku-tamu"
      className="relative overflow-hidden px-6 py-16"
      style={background ? { background } : undefined}
    >
      {backgroundImage && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              inset: backgroundBlur ? `-${Math.max(16, backgroundBlur * 2)}px` : '0px',
              backgroundImage: `url("${backgroundImage}")`,
              backgroundSize: backgroundFit || 'cover',
              backgroundPosition: backgroundPosition || 'center',
              filter: backgroundBlur ? `blur(${backgroundBlur}px)` : undefined
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: 'linear-gradient(to bottom, var(--color-background), transparent)' }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
            style={{ background: 'linear-gradient(to top, var(--color-background), transparent)' }}
          />
        </>
      )}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48"
        style={{
          background:
            'radial-gradient(60% 100% at 50% 0%, color-mix(in srgb, var(--color-primary) 14%, transparent), transparent 72%)'
        }}
      />

      <div className="relative mx-auto mb-9 flex max-w-md flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.4em] opacity-60">Doa &amp; Ucapan</span>
        <h2 className="mt-2 font-heading text-3xl md:text-4xl">{title || 'Buku Tamu'}</h2>
        <span className="mt-3 flex items-center gap-2 opacity-50">
          <span className="h-px w-10" style={{ background: 'currentColor' }} />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: 'var(--color-primary)' }} />
          <span className="h-px w-10" style={{ background: 'currentColor' }} />
        </span>
      </div>

      <div className="relative mx-auto max-w-md space-y-4">
        {items.length === 0 && !loading ? (
          <div
            className="rounded-[26px] px-6 py-10 text-center"
            style={{ border: '1px dashed color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
          >
            <p className="text-sm opacity-60">Belum ada ucapan. Jadilah yang pertama memberi doa terbaik.</p>
          </div>
        ) : (
          items.map((r) => (
            <article
              key={r.id}
              className="relative overflow-hidden rounded-[26px] p-5"
              style={{
                background:
                  'linear-gradient(160deg, rgba(255,255,255,0.96), color-mix(in srgb, var(--color-primary) 8%, #ffffff))',
                border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
                boxShadow: '0 20px 48px -24px color-mix(in srgb, var(--color-primary) 65%, transparent)'
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-6 select-none font-heading text-8xl leading-none opacity-10"
                style={{ color: 'var(--color-primary)' }}
              >
                &rdquo;
              </span>

              <div className="relative flex items-center gap-3">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-heading text-lg font-semibold text-white shadow-sm"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {initial(r.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-heading text-base font-semibold">{r.name}</p>
                    {r.attendance && (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          r.attendance === 'tidak'
                            ? 'bg-red-500/15 text-red-500'
                            : 'bg-emerald-500/15 text-emerald-600'
                        }`}
                      >
                        {r.attendance === 'tidak' ? 'Tidak Hadir' : 'Hadir'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-[0.18em] opacity-50">{timeAgo(r.created_at)}</p>
                </div>
              </div>

              <p className="relative mt-3.5 text-[15px] leading-relaxed opacity-90">{r.message}</p>

              <span
                className="mt-4 block h-px w-full"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 18%, transparent)' }}
              />
            </article>
          ))
        )}

        {totalPages > 1 && (
          <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Navigasi halaman ucapan">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 0}
              aria-label="Sebelumnya"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-current={page === i ? 'page' : undefined}
                className={`h-8 min-w-8 rounded-full px-2 text-xs font-semibold transition-colors ${
                  page === i ? 'text-white' : 'border border-current/25 hover:bg-current/10'
                }`}
                style={page === i ? { background: 'var(--color-primary)' } : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page >= totalPages - 1}
              aria-label="Berikutnya"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-current/25 transition-colors hover:bg-current/10 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>
    </section>
  );
}
