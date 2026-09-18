'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { demoAddRsvp } from '@/lib/demo/demo-store';
import type { RsvpProps } from '@/puck/types';
import { BlockShell } from './shell';

interface Props extends RsvpProps {
  /** Diberikan Puck via `metadata.projectId`. */
  puck?: { metadata?: { projectId?: string } };
}

const THROTTLE_MS = 30_000;

export default function Rsvp({ title, note, buttonText, position, entrance, blockStyle, puck }: Props) {
  const projectId = puck?.metadata?.projectId ?? '';
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'tidak'>('hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMsg('Nama terlalu pendek.');
      setStatus('error');
      return;
    }
    if (!projectId) {
      setStatus('success');
      return;
    }

    try {
      const last = Number(localStorage.getItem(`di_rsvp_${projectId}`) ?? 0);
      if (Date.now() - last < THROTTLE_MS) {
        setErrorMsg('Terlalu cepat. Tunggu sebentar lalu coba lagi.');
        setStatus('error');
        return;
      }
    } catch {
      /* ignore */
    }

    setStatus('submitting');
    let error: { message?: string } | null = null;

    if (demoIsDemoMode()) {
      const res = demoAddRsvp(projectId, { name: cleanName, attendance, guest_count: guestCount, message: message.trim(), meal_choice: null });
      error = res.error ? { message: res.error } : null;
    } else {
      const { error: e } = await supabase
        .from('rsvps')
        .insert({ project_id: projectId, name: cleanName, attendance, guest_count: guestCount, message: message.trim() || null });
      error = e;
    }

    if (error) {
      setErrorMsg('Gagal mengirim. Silakan coba lagi.');
      setStatus('error');
      return;
    }
    try {
      localStorage.setItem(`di_rsvp_${projectId}`, String(Date.now()));
    } catch {
      /* ignore */
    }
    setStatus('success');
  }

  const inputClass =
    'w-full rounded-xl border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-current';

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {note ? <p className="mt-2 text-sm opacity-70">{note}</p> : null}

        {status === 'success' ? (
          <p className="mx-auto mt-6 max-w-sm text-sm leading-relaxed">Terima kasih atas konfirmasi Anda.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-6 w-full max-w-sm space-y-4 text-left" noValidate>
            <div>
              <label htmlFor="rsvp-name" className="mb-1 block text-sm opacity-80">
                Nama Anda
              </label>
              <input id="rsvp-name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" className={inputClass} />
            </div>
            <div>
              <p className="mb-2 text-sm opacity-80">Kehadiran</p>
              <div className="flex rounded-full border border-current/15 p-1" role="radiogroup" aria-label="Kehadiran">
                {(['hadir', 'tidak'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    role="radio"
                    aria-checked={attendance === opt}
                    onClick={() => setAttendance(opt)}
                    className={`flex-1 rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                      attendance === opt ? 'bg-[var(--color-primary,#3b5ba5)] text-white shadow-md' : 'text-current/70 hover:bg-current/10'
                    }`}
                  >
                    {opt === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="rsvp-count" className="text-sm opacity-80">
                Jumlah tamu
              </label>
              <select id="rsvp-count" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} className={inputClass} style={{ width: 110 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} orang
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="rsvp-message" className="mb-1 block text-sm opacity-80">
                Doa &amp; Ucapan
              </label>
              <textarea id="rsvp-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tulis doa / ucapan" rows={3} className={inputClass} />
            </div>
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full rounded-full bg-[var(--color-primary,#3b5ba5)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Mengirim…' : buttonText || 'Kirim Konfirmasi'}
            </button>
            {status === 'error' ? <p className="text-center text-xs text-red-500">{errorMsg}</p> : null}
          </form>
        )}
      </section>
    </BlockShell>
  );
}
