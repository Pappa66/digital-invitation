'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { demoListRsvps, demoSetRsvpListener } from '@/lib/demo/demo-store';
import { demoIsDemoMode } from '@/lib/env';
import type { Rsvp } from '@/lib/types';

interface GuestBookWallProps {
  projectId?: string;
  title?: string;
}

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
export default function GuestBookWall({ projectId, title }: GuestBookWallProps) {
  const [items, setItems] = useState<Rsvp[]>([]);

  useEffect(() => {
    if (!projectId) return setItems([]);

    const load = () => {
      if (demoIsDemoMode()) {
        setItems(demoListRsvps(projectId));
        return;
      }
      // RPC aman: hanya name+message+attendance+created_at dari project published.
      supabase
        .rpc('get_guest_book_messages', { p_project_id: projectId })
        .then(({ data }) => setItems((data ?? []) as Rsvp[]));
    };

    load();
    const off = demoSetRsvpListener(load);
    return off;
  }, [projectId]);

  const messages = items.filter((r) => (r.message ?? '').trim().length > 0);

  return (
    <section className="relative overflow-hidden px-6 py-16">
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
        {messages.length === 0 ? (
          <div
            className="rounded-[26px] px-6 py-10 text-center"
            style={{ border: '1px dashed color-mix(in srgb, var(--color-primary) 30%, transparent)' }}
          >
            <p className="text-sm opacity-60">Belum ada ucapan. Jadilah yang pertama memberi doa terbaik.</p>
          </div>
        ) : (
          messages.slice(0, 8).map((r) => (
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
      </div>
    </section>
  );
}
