'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { demoListRsvps, demoSetRsvpListener } from '@/lib/demo/demo-store';
import type { Rsvp } from '@/lib/types';

interface GuestBookWallProps {
  projectId?: string;
  title?: string;
}

/** Buku tamu: ucapan & doa terbaru dari para tamu (reload saat RSVP baru masuk). */
export default function GuestBookWall({ projectId, title }: GuestBookWallProps) {
  const [items, setItems] = useState<Rsvp[]>([]);

  useEffect(() => {
    if (!projectId) return setItems([]);

    const load = () => {
      if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
        setItems(demoListRsvps(projectId));
        return;
      }
      // RPC aman: hanya name+message+created_at dari project published —
      // tidak lagi SELECT langsung ke tabel rsvps (melindungi data intim).
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
    <section className="px-6 py-16">
      <h2 className="text-center text-xl md:text-2xl">{title || 'Buku Tamu & Ucapan'}</h2>
      <div className="mx-auto mt-8 max-w-md space-y-3">
        {messages.length === 0 ? (
          <p className="text-center text-sm opacity-60">Belum ada ucapan. Jadilah yang pertama memberi doa terbaik.</p>
        ) : (
          messages.slice(0, 8).map((r) => (
            <div key={r.id} className="rounded-2xl border border-current/10 bg-white/5 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide opacity-70">{r.name}</p>
              <p className="mt-1 text-sm leading-relaxed">{r.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}