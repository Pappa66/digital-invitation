'use client';

import { useState } from 'react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { demoAddRsvp, demoListRsvps } from '@/lib/demo/demo-store';
import type { BlockProps } from '@/lib/types';
import { Editable } from '@/components/builder/inline-edit';
import { Inner } from '@/components/guest/inner-context';

function str(props: BlockProps, key: string): string {
  const v = props[key];
  return typeof v === 'string' ? v : '';
}

/** Parse konfigurasi menu RSVP: satu baris per kategori "Label: A, B, C". */
export function parseMenuConfig(raw: string): { label: string; options: string[] }[] {
  return (raw || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split(':');
      const options = (rest.join(':') || '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      return { label: label.trim(), options };
    })
    .filter((g) => g.label && g.options.length > 0);
}

const THROTTLE_MS = 30_000;
const throttleKey = (projectId: string) => `di_rsvp_last_${projectId}`;

interface RSVPFormProps {
  projectId: string;
  blockProps: BlockProps;
  /** Mode rendered tanpa DB (preview builder). Jika dengan-db, gunakan projectId. */
  readonly?: boolean;
}

export default function RSVPForm({ projectId, blockProps, readonly }: RSVPFormProps) {
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'tidak' | 'ragu'>('hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  /** Token check-in personal dari RSVP yang baru dibuat (untuk QR absen). */
  const [checkinToken, setCheckinToken] = useState<string | null>(null);
  const variant = str(blockProps, 'variant') || 'centered';
  const menuGroups = parseMenuConfig(str(blockProps, 'menu_config'));
  const [menuSelections, setMenuSelections] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (readonly || !projectId) return;

    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMsg('Nama terlalu pendek.');
      setStatus('error');
      return;
    }
    if (guestCount < 1 || guestCount > 10) {
      setErrorMsg('Jumlah tamu tidak valid.');
      setStatus('error');
      return;
    }

    // Throttle sederhana: satu konfirmasi per 30 detik per browser.
    try {
      const last = Number(localStorage.getItem(throttleKey(projectId)) ?? 0);
      if (Date.now() - last < THROTTLE_MS) { // eslint-disable-line react-hooks/purity
        setErrorMsg('Terlalu cepat. Silakan tunggu sebentar lalu coba lagi.');
        setStatus('error');
        return;
      }
    } catch {
      /* ignore */
    }

    setStatus('submitting');

    const menuOptions =
      menuGroups.length > 0
        ? menuGroups
            .map((g) => ({ label: g.label, value: menuSelections[g.label] ?? '' }))
            .filter((m) => m.value)
        : null;
    const mealChoice = menuOptions?.map((m) => m.value).join(' / ') ?? null;

    let error: { message?: string } | null = null;
    let newToken: string | null = null;
    if (demoIsDemoMode()) {
      const res = demoAddRsvp(projectId, {
        name: cleanName,
        attendance,
        guest_count: guestCount,
        message: message.trim(),
        meal_choice: mealChoice,
        menu_options: menuOptions
      });
      error = res.error ? { message: res.error } : null;
      if (!error) {
        // demo-store mengisi checkin_token saat RSVP disimpan; ambil RSVP
        // terbaru proyek ini untuk token QR personal.
        const latest = demoListRsvps(projectId)[0];
        newToken = typeof latest?.checkin_token === 'string' ? latest.checkin_token : null;
      }
    } else {
      const r = await supabase
        .from('rsvps')
        .insert({ project_id: projectId, name: cleanName, attendance, guest_count: guestCount, message: message.trim() || null, meal_choice: mealChoice, menu_options: menuOptions })
        .select('checkin_token');
      error = r.error;
      if (!r.error) {
        const row = Array.isArray(r.data) ? r.data[0] : null;
        newToken = typeof row?.checkin_token === 'string' ? row.checkin_token : null;
      }
    }

    if (error) {
      setErrorMsg('Gagal mengirim. Silakan coba lagi.');
      setStatus('error');
    } else {
      try {
        localStorage.setItem(throttleKey(projectId), String(Date.now())); // eslint-disable-line react-hooks/purity
      } catch {
        /* ignore */
      }
      setCheckinToken(newToken);
      setStatus('success');
    }
  }

  const inputClass =
    'w-full rounded-xl border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-current';

  const qrUrl =
    typeof window !== 'undefined' && checkinToken
      ? `${window.location.origin}/absen/${projectId}?t=${checkinToken}`
      : '';

  const formContent = status === 'success' ? (
    <Inner name="success">
      <div className={`mx-auto mt-8 max-w-sm px-6 py-10 ${variant === 'card' ? 'rounded-2xl border border-current/10' : ''}`}>
        <p className="text-lg">{str(blockProps, 'success_message') || 'Terima kasih atas konfirmasinya.'}</p>
        <div className="mt-6">
          {checkinToken ? (
            <div className="rounded-2xl border border-current/10 bg-white/60 p-4">
              <div className="mx-auto w-fit rounded-xl bg-white p-3 shadow-soft">
                <QRCode value={qrUrl} size={150} fgColor="#2B2620" title={qrUrl} />
              </div>
              <p className="mt-3 text-xs leading-relaxed opacity-75">Pindai QR ini oleh panitia saat tiba di lokasi.</p>
            </div>
          ) : (
            <p className="text-xs leading-relaxed opacity-75">QR absen tersedia setelah konfirmasi Anda tercatat.</p>
          )}
        </div>
      </div>
    </Inner>
  ) : (
    <Inner name="form">
      <form onSubmit={handleSubmit} className={`mx-auto mt-8 max-w-sm space-y-4 px-6 py-6 text-left ${variant === 'card' ? 'rounded-2xl border border-current/10 bg-white/5' : ''}`} noValidate>
        <div>
          <label htmlFor="rsvp-name" className="mb-1 block text-sm opacity-80">Nama Anda</label>
          <input
            id="rsvp-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            aria-invalid={status === 'error' && errorMsg.startsWith('Nama')}
            aria-describedby={status === 'error' && errorMsg.startsWith('Nama') ? 'rsvp-form-error' : undefined}
            className={inputClass}
          />
        </div>
        <div>
          <p className="mb-2 text-sm opacity-80">Kehadiran</p>
          <div className="flex rounded-full border border-current/15 p-1" role="radiogroup" aria-label="Kehadiran">
            {(['hadir', 'ragu', 'tidak'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={attendance === opt}
                aria-label={opt === 'hadir' ? 'Hadir' : opt === 'ragu' ? 'Ragu-ragu' : 'Tidak Hadir'}
                onClick={() => setAttendance(opt)}
                className={`flex-1 whitespace-nowrap rounded-full px-3 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
                  attendance === opt
                    ? 'bg-[var(--color-primary)] text-white shadow-md'
                    : 'hover:bg-current/10 text-current/70'
                }`}
              >
                {opt === 'hadir' ? 'Hadir' : opt === 'ragu' ? 'Ragu' : 'Tidak'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="rsvp-count" className="text-sm opacity-80">Jumlah tamu</label>
          <select
            id="rsvp-count"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            aria-invalid={status === 'error' && errorMsg.startsWith('Jumlah')}
            aria-describedby={status === 'error' && errorMsg.startsWith('Jumlah') ? 'rsvp-form-error' : undefined}
            className={inputClass}
            style={{ width: 110 }}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} orang
              </option>
            ))}
          </select>
        </div>
        {menuGroups.length > 0 && (
          <div className="space-y-3">
            {menuGroups.map((g) => (
              <label key={g.label} className="block">
                <span className="mb-1 block text-sm opacity-80">{g.label}</span>
                <select
                  value={menuSelections[g.label] ?? ''}
                  onChange={(e) => setMenuSelections((prev) => ({ ...prev, [g.label]: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">Pilih menu...</option>
                  {g.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        <div>
          <label htmlFor="rsvp-message" className="mb-1 block text-sm opacity-80">Doa &amp; Ucapan</label>
          <textarea
            id="rsvp-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis doa / ucapan"
            rows={3}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full rounded-full bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {status === 'submitting' ? 'Mengirim...' : String(blockProps.button_text || 'Kirim Konfirmasi')}
        </button>
        {status === 'error' && (
          <p id="rsvp-form-error" role="alert" className="text-center text-xs text-red-500">
            {errorMsg || 'Gagal mengirim. Silakan coba lagi.'}
          </p>
        )}
      </form>
    </Inner>
  );

  if (variant === 'minimal') {
    return (
      <section className="px-6 py-8 sm:py-10 md:py-14 text-center">
        <Inner name="title">
          <h2 className="text-xl font-medium uppercase tracking-wide opacity-60 md:text-2xl">
            <Editable prop="title">{str(blockProps, 'title')}</Editable>
          </h2>
        </Inner>
        <Inner name="note">
          <p className="mt-2 text-sm opacity-80">
            <Editable prop="note">{str(blockProps, 'note')}</Editable>
          </p>
        </Inner>
        {formContent}
      </section>
    );
  }

  return (
    <section className="px-6 py-8 sm:py-10 md:py-14 text-center">
      <Inner name="title">
        <h2 className="text-xl md:text-2xl">
          <Editable prop="title">{str(blockProps, 'title')}</Editable>
        </h2>
      </Inner>
      <Inner name="note">
        <p className="mt-2 text-sm opacity-80">
          <Editable prop="note">{str(blockProps, 'note')}</Editable>
        </p>
      </Inner>
      {formContent}
    </section>
  );
}
