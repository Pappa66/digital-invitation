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
    <section className="relative px-6 py-16">
      <div className="mx-auto mb-9 flex max-w-md flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.35em] opacity-60">Doa &amp; Ucapan</span>
        <h2 className="mt-2 font-heading text-2xl md:text-3xl">{title || 'Buku Tamu'}</h2>
        <span className="mt-3 flex items-center gap-2 opacity-40">
          <span className="h-px w-8 bg-current" />
          <span className="h-1.5 w-1.5 rotate-45" style={{ background: 'var(--color-primary)' }} />
          <span className="h-px w-8 bg-current" />
        </span>
      </div>

      <div className="mx-auto max-w-md space-y-3.5">
        {messages.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-current/15 bg-white/5 px-6 py-10 text-center">
            <p className="text-sm opacity-60">Belum ada ucapan. Jadilah yang pertama memberi doa terbaik.</p>
          </div>
        ) : (
          messages.slice(0, 8).map((r) => (
            <article
              key={r.id}
              className="relative overflow-hidden rounded-3xl border border-current/10 bg-white/70 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur-sm"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -top-6 select-none font-heading text-7xl leading-none opacity-15"
                style={{ color: 'var(--color-primary)' }}
              >
                &rdquo;
              </span>

              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-base font-semibold"
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-primary) 16%, transparent)',
                    color: 'var(--color-primary)'
                  }}
                >
                  {initial(r.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold">{r.name}</p>
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
                  <p className="text-[10px] uppercase tracking-wide opacity-50">{timeAgo(r.created_at)}</p>
                </div>
              </div>

              <p className="relative mt-3 text-sm leading-relaxed opacity-90">{r.message}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
