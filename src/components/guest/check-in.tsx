'use client';

import { useEffect, useState } from 'react';
import { UserCheck, Check, Loader2, Armchair } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { demoAddCheckin } from '@/lib/demo/demo-store';
import { Inner } from '@/components/guest/inner-context';

const THROTTLE_MS = 60_000;
const throttleKey = (projectId: string) => `di_checkin_${projectId}`;

interface CheckInProps {
  projectId: string;
  greetingName?: string;
  /** Nonaktifkan input saat preview kartu template. */
  preview?: boolean;
  /** Tampilkan info meja & kursi setelah check-in. */
  showSeatInfo?: boolean;
  /** Label meja. */
  tableLabel?: string;
  /** Label kursi. */
  seatLabel?: string;
}

/**
 * QR Absensi hari-H. Di lokasi acara panitia menampilkan QR ini — QR mengarah
 * ke link publik `${origin}/absen/{projectId}` (mode absen manual pakai
 * `?absen=1` tetap didukung). Pencatatan masuk ke tabel `checkins`
 * (sekali per browser per proyek).
 */
export default function CheckIn({ projectId, greetingName, preview, showSeatInfo, tableLabel, seatLabel }: CheckInProps) {
  const [name, setName] = useState(greetingName ?? '');
  const [guestCount, setGuestCount] = useState(1);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAbsenMode, setIsAbsenMode] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('absen') === '1') {
      setIsAbsenMode(true);
      setQrOpen(true);
    }
    setUrl(`${window.location.origin}/absen/${projectId}`);
  }, [projectId]);

  if (preview) return null;

  async function handleCheckin(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (clean.length < 2) return;

    setErrorMsg('');
    try {
      const last = Number(localStorage.getItem(throttleKey(projectId)) ?? 0);
      // Throttle aktif di SEMUA mode (termasuk mode absen saat tamu check-in
      // ulang cepat / pindai ganda), jadi satu browser tidak bisa mencatat
      // check-in beruntun dalam jendela 60 detik.
      if (Date.now() - last < THROTTLE_MS) {
        setErrorMsg('Tunggu sebentar sebelum check-in lagi');
        setStatus('error');
        return;
      }
    } catch {
      /* ignore */
    }

    setStatus('submitting');
    let error: { message?: string } | null = null;
    if (demoIsDemoMode()) {
      error = demoAddCheckin(projectId, { name: clean, guest_count: guestCount }).error ? { message: 'gagal' } : null;
    } else {
      const r = await supabase.from('checkins').insert({ project_id: projectId, name: clean, guest_count: guestCount });
      error = r.error;
    }
    if (error) {
      setErrorMsg('Gagal menyimpan. Silakan coba lagi.');
      setStatus('error');
    } else {
      try {
        localStorage.setItem(throttleKey(projectId), String(Date.now()));
      } catch {
        /* ignore */
      }
      setStatus('done');
    }
  }

  return (
    <section className="mx-auto max-w-sm px-6 py-8 sm:py-10 md:py-12 text-center">
      <div className="rounded-3xl border border-current/15 bg-white/5 px-6 py-8">
        <Inner name="title">
          <UserCheck className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-3 text-xl md:text-2xl">Absensi Kehadiran</h2>
        </Inner>
        <Inner name="note">
          <p className="mt-2 text-xs leading-relaxed opacity-75">
            {isAbsenMode
              ? 'Terima kasih sudah hadir di hari bahagia kami. Silakan lakukan check-in di bawah.'
              : 'Di lokasi acara, panitia menampilkan QR khusus untuk absen. Pindai QR berikut saat sampai di venue.'}
          </p>
        </Inner>

        {!isAbsenMode ? (
          <Inner name="button">
            <button
              onClick={() => setQrOpen((o) => !o)}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-current/25 px-5 py-2 text-xs font-medium transition-colors hover:bg-current/10 active:scale-95"
            >
              {qrOpen ? 'Sembunyikan QR Absen' : 'Tampilkan QR Absen'}
            </button>
          </Inner>
        ) : null}

        {qrOpen && (
          <Inner name="qr">
            <div className="mt-5 inline-block rounded-2xl bg-white p-4">
              <QRCode value={url || ' '} size={140} fgColor="#111827" />
            </div>
          </Inner>
        )}

        {isAbsenMode && status !== 'done' && (
          <Inner name="form">
            <form onSubmit={handleCheckin} className="mt-5 space-y-3 text-left">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full rounded-full border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-current"
              />
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm opacity-80">Jumlah tamu</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="rounded-full border border-current/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} orang
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-primary)] px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60 active:scale-95"
              >
                {status === 'submitting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
                {status === 'submitting' ? 'Memproses...' : 'Check-in'}
              </button>
              {status === 'error' && <p role="alert" className="text-center text-xs text-red-500">{errorMsg || 'Gagal menyimpan. Silakan coba lagi.'}</p>}
            </form>
          </Inner>
        )}

        {isAbsenMode && status === 'done' && (
          <Inner name="success">
            <div className="mt-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300">
                <Check className="h-4 w-4" /> Check-in berhasil
              </div>
              <p className="mt-2 text-xs opacity-70">Selamat menikmati acara. Terima kasih sudah hadir!</p>
              {showSeatInfo && (tableLabel || seatLabel) && (
                <div className="mt-4 inline-flex flex-col items-center gap-1 rounded-xl border border-current/15 bg-white/5 px-5 py-3">
                  <Armchair className="h-5 w-5 opacity-70" />
                  {tableLabel && (
                    <p className="text-xs opacity-70">Meja: <span className="font-semibold opacity-100">{tableLabel}</span></p>
                  )}
                  {seatLabel && (
                    <p className="text-xs opacity-70">Kursi: <span className="font-semibold opacity-100">{seatLabel}</span></p>
                  )}
                </div>
              )}
            </div>
          </Inner>
        )}
      </div>
    </section>
  );
}