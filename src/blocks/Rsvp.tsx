'use client';

import { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { Check, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/env';
import { demoAddRsvp } from '@/lib/demo/demo-store';
import { getSiteOrigin } from '@/lib/site';
import type { RsvpProps } from '@/puck/types';
import { BlockShell } from './shell';

interface Props extends RsvpProps {
  /** Diberikan Puck via `metadata.projectId`. */
  puck?: { metadata?: { projectId?: string } };
}

const THROTTLE_MS = 30_000;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function genCode(): string {
  const a = new Uint8Array(6);
  try {
    crypto.getRandomValues(a);
  } catch {
    for (let i = 0; i < 6; i++) a[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(a, (n) => CODE_ALPHABET[n % CODE_ALPHABET.length]).join('');
}

function randomToken(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

export default function Rsvp({ title, note, buttonText, position, entrance, blockStyle, puck }: Props) {
  const projectId = puck?.metadata?.projectId ?? '';
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'hadir' | 'tidak'>('hadir');
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [checkinToken, setCheckinToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const qrWrapRef = useRef<HTMLDivElement>(null);

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
    const clientToken = randomToken();
    const clientCode = genCode();
    let error: { message?: string } | null = null;

    if (demoIsDemoMode()) {
      const res = demoAddRsvp(projectId, { name: cleanName, attendance, guest_count: guestCount, message: message.trim(), meal_choice: null });
      error = res.error ? { message: res.error } : null;
    } else {
      // RPC server-side (rate-limit + dedupe); fallback insert bila migrasi belum dijalankan.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: rpcData, error: rpcErr } = await (supabase.rpc as any)('submit_rsvp', {
        p_project_id: projectId,
        p_name: cleanName,
        p_attendance: attendance,
        p_guest_count: guestCount,
        p_message: message.trim() || null,
        p_checkin_token: clientToken,
        p_checkin_code: clientCode
      });
      if (rpcErr) {
        const { error: e } = await supabase
          .from('rsvps')
          .insert({ project_id: projectId, name: cleanName, attendance, guest_count: guestCount, message: message.trim() || null, checkin_token: clientToken, checkin_code: clientCode });
        error = e;
      } else {
        const row = Array.isArray(rpcData) ? rpcData[0] : null;
        if (row && row.ok === false) error = { message: row.error ?? 'Ditolak' };
      }
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
    setCheckinToken(clientToken);
    setCode(clientCode);
    setStatus('success');
  }

  const inputClass = 'w-full rounded-xl border border-current/15 bg-transparent px-4 py-2.5 text-sm outline-none transition-colors focus:border-current';
  const qrUrl = checkinToken ? `${getSiteOrigin()}/absen/${projectId}?t=${checkinToken}` : '';

  return (
    <BlockShell position={position} entrance={entrance} blockStyle={blockStyle}>
      <section className="bg-[var(--color-background,#fbf7f1)] px-6 py-14 text-center text-[var(--color-text,#4a4036)]">
        <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h2>
        {note ? <p className="mt-2 text-sm opacity-70">{note}</p> : null}

        {status === 'success' ? (
          <div className="mx-auto mt-8 w-full max-w-sm">
            <p className="text-sm leading-relaxed">Terima kasih atas konfirmasinya.</p>
            {checkinToken && attendance !== 'tidak' ? (
              <div className="mt-5 rounded-2xl border border-current/10 bg-white/60 p-4">
                <div ref={qrWrapRef} className="mx-auto w-fit rounded-xl bg-white p-3 shadow-soft">
                  <QRCode value={qrUrl} size={150} fgColor="#2B2620" title={qrUrl} />
                </div>
                <p className="mt-3 text-xs leading-relaxed opacity-75">Pindai QR ini oleh panitia saat tiba di lokasi.</p>
                <button
                  type="button"
                  onClick={() => {
                    const svg = qrWrapRef.current?.querySelector('svg');
                    if (!svg) return;
                    const qr = svg.outerHTML;
                    const size = 150, pad = 16, extra = 70;
                    const w = size + pad * 2, h = size + pad * 2 + extra;
                    const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
                      + `<rect width="100%" height="100%" fill="#ffffff"/>`
                      + `<g transform="translate(${pad},${pad})">${qr}</g>`
                      + (code ? `<text x="${w / 2}" y="${size + pad * 2 + 26}" text-anchor="middle" font-family="monospace" font-size="20" font-weight="bold" fill="#2B2620">${esc(code)}</text>` : '')
                      + `<text x="${w / 2}" y="${size + pad * 2 + 48}" text-anchor="middle" font-family="monospace" font-size="9" fill="#666666">${esc(checkinToken ?? '')}</text>`
                      + `</svg>`;
                    const blob = new Blob([doc], { type: 'image/svg+xml' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `qr-absen-${code ?? checkinToken}.svg`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                  }}
                  className="mt-3 rounded-full border border-current/25 px-4 py-1.5 text-[11px] font-semibold"
                >
                  Unduh QR + Kode
                </button>
              {code ? (
                <div className="mx-auto mt-3 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary,#3b5ba5)]/10 px-3 py-2">
                  <span className="text-[10px] uppercase tracking-wide opacity-70">Kode manual</span>
                  <code className="font-mono text-lg font-bold tracking-[0.25em]">{code}</code>
                  <button type="button" onClick={() => { void navigator.clipboard?.writeText(code); }} className="rounded border border-current/20 px-2 py-0.5 text-[10px]">Salin</button>
                </div>
              ) : null}
                <div className="mx-auto mt-3 flex max-w-[260px] items-center gap-1.5 rounded-lg border border-dashed border-current/25 bg-white/70 px-2.5 py-1.5">
                  <code className="min-w-0 flex-1 break-all font-mono text-[11px] opacity-80">{checkinToken}</code>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(checkinToken).then(() => {
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      });
                    }}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-current/20 px-2 py-1 text-[10px] font-semibold hover:bg-current/10"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    Salin
                  </button>
                </div>
              </div>
            ) : null}
          </div>
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
