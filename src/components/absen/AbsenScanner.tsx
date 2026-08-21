'use client';

import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyCheckinToken } from '@/lib/actions/checkin-actions';
import {
  AlertTriangle,
  CameraOff,
  Loader2,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';

type ScannerStatus = 'idle' | 'scanning' | 'verifying' | 'success' | 'error';
type CameraIssue = 'denied' | 'not-found' | 'busy' | 'generic' | null;

interface CheckinResult {
  name?: string;
  guest_count?: number;
}

interface AbsenScannerProps {
  projectId: string;
}

const RESCAN_MS = 2_000;
const QRBOX = 210;

/**
 * Parse hasil scan jadi token check-in. QR personal tamu berformat URL
 * `/absen/{projectId}?t={token}`; bila QR berisi teks token polos (uuid),
 * teks itu dikembalikan apa adanya.
 */
export function parseAbsenTokenFromQr(text: string): string | null {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  try {
    const t = new URL(trimmed).searchParams.get('t');
    if (t && t.trim()) return t.trim();
  } catch {
    /* bukan URL — jatuh ke fallback token polos */
  }
  if (/^[A-Za-z0-9][A-Za-z0-9-]{7,63}$/.test(trimmed)) return trimmed;
  return null;
}

function classifyCameraError(err: unknown): CameraIssue {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();
  if (message.includes('NotAllowedError') || lower.includes('permission')) return 'denied';
  if (
    message.includes('NotFoundError') ||
    lower.includes('no camera') ||
    lower.includes('device not found') ||
    lower.includes('requested device')
  ) {
    return 'not-found';
  }
  if (message.includes('NotReadableError') || lower.includes('busy') || lower.includes('in use')) return 'busy';
  return 'generic';
}

const CAMERA_ERROR_TEXT: Record<Exclude<CameraIssue, null>, string> = {
  denied:
    'Akses kamera ditolak. Izinkan kamera di browser (perangkat ini), lalu tekan "Coba Lagi". Bisa juga memakai token manual di bawah.',
  'not-found':
    'Kamera tidak ditemukan di perangkat ini. Gunakan input token manual di bawah untuk memverifikasi tamu.',
  busy: 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu tekan "Coba Lagi".',
  generic: 'Tidak dapat mengakses kamera. Coba lagi, atau gunakan token manual di bawah.'
};

export default function AbsenScanner({ projectId }: AbsenScannerProps) {
  const [status, setStatus] = useState<ScannerStatus>('idle');
  const [cameraIssue, setCameraIssue] = useState<CameraIssue>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [manualError, setManualError] = useState('');

  const containerId = `absen-scanner-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const busyRef = useRef(false);
  const isMounted = useRef(true);
  const rescanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Ref untuk onDecoded supaya startCamera tidak perlu depends on onDecoded
   *  (menghindari circular dependency: startCamera → onDecoded → scheduleRescan → startCamera). */
  const onDecodedRef = useRef<(decodedText: string) => void>(() => {});

  /** Hentikan kamera & lepas resource. Aman dipanggil kapan pun. */
  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      if (scanner.isScanning) await scanner.stop();
    } catch {
      /* sudah tidak berjalan */
    }
    try {
      scanner.clear();
    } catch {
      /* elemen video sudah dihapus pembersihan lain */
    }
  }, []);

  /** Nyalakan kamera & mulai scan. Dipanggil langsung dari click handler
   *  supaya getUserMedia berada dalam user gesture (wajib di iOS Safari & Android). */
  const startCamera = useCallback(async () => {
    setResult(null);
    setManualError('');
    setErrorMsg('');
    setCameraIssue(null);
    setStatus('scanning');

    // Hentikan scanner sebelumnya jika ada
    if (scannerRef.current) {
      try { if (scannerRef.current.isScanning) await scannerRef.current.stop(); } catch { /* ignore */ }
      try { scannerRef.current.clear(); } catch { /* ignore */ }
      scannerRef.current = null;
    }

    const el = document.getElementById(containerId);
    if (!el) return;

    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: QRBOX, height: QRBOX } },
        (decodedText) => {
          if (!busyRef.current) onDecodedRef.current(decodedText);
        },
        () => { /* galat decode per-frame — biarkan kamera tetap berjalan */ }
      );
    } catch (err: unknown) {
      const issue = classifyCameraError(err);
      scannerRef.current = null;
      setCameraIssue(issue);
      setErrorMsg(CAMERA_ERROR_TEXT[issue ?? 'generic']);
      setStatus('error');
    }
  }, [containerId]);

  const scheduleRescan = useCallback(() => {
    if (rescanTimer.current) clearTimeout(rescanTimer.current);
    rescanTimer.current = setTimeout(() => {
      rescanTimer.current = null;
      if (!isMounted.current) return;
      busyRef.current = false;
      void startCamera();
    }, RESCAN_MS);
  }, [startCamera]);

  /** Verifikasi token (dari scan atau input manual) via server action. */
  const verifyToken = useCallback(
    async (token: string): Promise<{ ok: boolean; error?: string }> => {
      busyRef.current = true;
      setStatus('verifying');
      const res = await verifyCheckinToken(projectId, token);
      if (!isMounted.current) return { ok: false };
      busyRef.current = false;
      if (res.ok) {
        setResult({ name: res.name, guest_count: res.guest_count });
        setManualError('');
        setStatus('success');
        return { ok: true };
      }
      const msg = res.error ?? 'Token tidak valid. Check-in ditolak.';
      setErrorMsg(msg);
      setStatus('error');
      return { ok: false, error: msg };
    },
    [projectId]
  );

  /** Callback hasil scan dari library html5-qrcode. */
  const onDecoded = useCallback(
    (decodedText: string) => {
      if (busyRef.current) return;
      const token = parseAbsenTokenFromQr(decodedText);
      if (!token) {
        const msg = 'Kode QR tidak dikenali. Pindai QR personal dari layar konfirmasi RSVP.';
        setErrorMsg(msg);
        setStatus('error');
        const timer = setTimeout(() => {
          if (isMounted.current) {
            busyRef.current = false;
            void startCamera();
          }
        }, RESCAN_MS);
        rescanTimer.current = timer;
        return;
      }
      void verifyToken(token).then((r) => {
        if (!r.ok && isMounted.current) scheduleRescan();
      });
    },
    [scheduleRescan, verifyToken, startCamera]
  );
  // Sync ref agar startCamera (yang tidak depends on onDecoded) selalu
  // memanggil versi onDecoded terbaru.
  useEffect(() => {
    onDecodedRef.current = onDecoded;
  });

  // Kamera TIDAK dinyalakan otomatis saat halaman dibuka. Di perangkat
  // seluler, getUserMedia hanya diizinkan bila dipicu user gesture (klik
  // tombol) — auto-start lewat useEffect selalu ditolak NotAllowedError di
  // iOS Safari & beberapa Android. Panitia menekan "Nyalakan Kamera".

  // Pembersihan saat komponen dilepas.
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (rescanTimer.current) clearTimeout(rescanTimer.current);
      void stopScanner();
    };
  }, [stopScanner]);

  async function handleManualSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const token = manualToken.trim();
    if (!token || busyRef.current) return;
    const r = await verifyToken(token);
    if (!r.ok) setManualError(r.error ?? 'Token tidak valid.');
  }

  const canSubmitManual = status !== 'verifying' && status !== 'success';

  return (
    <div className="space-y-5" data-testid="absen-scanner">
      {/* Panel kamera / hasil */}
      <div className="overflow-hidden rounded-3xl border border-current/15 bg-background/60 text-foreground shadow-soft">
        {status === 'success' && result ? (
          <div className="px-5 py-8 text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
              <ShieldCheck className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-3 text-lg font-medium">Check-in berhasil</h2>
            <p className="mt-1 text-sm opacity-90">{result.name || 'Tamu terverifikasi'}</p>
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-current/15 px-4 py-1.5 text-xs opacity-75">
              <Users className="h-3.5 w-3.5" aria-hidden="true" /> {result.guest_count ?? 1} tamu
            </p>
            <button
              onClick={() => void startCamera()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-strong px-6 py-2.5 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <ScanLine className="h-4 w-4" aria-hidden="true" /> Scan Berikutnya
            </button>
          </div>
        ) : status === 'error' ? (
          <div className="px-5 py-8 text-center" role="alert">
            <div
              className={`mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full ${
                cameraIssue ? 'bg-red-500/15 text-destructive' : 'bg-amber-500/15 text-gold-ink'
              }`}
            >
              {cameraIssue ? <CameraOff className="h-6 w-6" aria-hidden="true" /> : <AlertTriangle className="h-6 w-6" aria-hidden="true" />}
            </div>
            <h2 className="mt-3 text-lg font-medium">{cameraIssue ? 'Kamera tidak dapat dibuka' : 'Check-in ditolak'}</h2>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed opacity-80">{errorMsg}</p>
            <button
              onClick={() => void startCamera()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-current/25 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-current/10 active:scale-95"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {cameraIssue ? 'Coba Lagi' : 'Pindai Lagi'}
            </button>
            <p className="mt-3 text-xs opacity-60">Jika kamera bermasalah, gunakan token manual di bawah.</p>
          </div>
        ) : (
          <>
            <div className="relative mx-auto aspect-square max-h-[300px] w-full overflow-hidden bg-black/80">
              <div id={containerId} className="h-full w-full" />
              {status === 'verifying' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gold-strong" aria-hidden="true" />
                  <p className="text-sm font-medium">Memverifikasi token…</p>
                </div>
              )}
              {status === 'idle' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/60 px-6 text-center">
                  <button
                    type="button"
                    onClick={() => void startCamera()}
                    className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-strong px-7 py-3 text-sm font-semibold text-foreground shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ScanLine className="h-5 w-5" aria-hidden="true" /> Nyalakan Kamera
                  </button>
                  <p className="max-w-[240px] text-xs leading-relaxed opacity-75">
                    Diperlukan akses kamera untuk memindai QR tamu. Tekan tombol di atas bila belum muncul izin.
                  </p>
                </div>
              )}
            </div>
            <div className="border-t border-current/10 px-4 py-3 text-center">
              <p className="text-xs opacity-75">Arahkan QR pribadi tamu ke dalam bingkai kamera.</p>
            </div>
          </>
        )}
      </div>

      {/* Fallback token manual */}
      <form
        onSubmit={handleManualSubmit}
        noValidate
        className="rounded-2xl border border-current/15 bg-background/60 p-4 text-foreground"
      >
        <label htmlFor={`${containerId}-token`} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide opacity-70">
          Atau masukkan token manual
        </label>
        <div className="flex gap-2">
          <input
            id={`${containerId}-token`}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Token QR tamu"
            disabled={!canSubmitManual}
            autoComplete="off"
            spellCheck={false}
            className="min-h-11 w-full rounded-xl border border-current/15 bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-gold-strong disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSubmitManual || manualToken.trim().length === 0}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <UserCheck className="h-4 w-4" aria-hidden="true" />
            Verifikasi
          </button>
        </div>
        {manualError && (
          <p role="alert" className="mt-2 text-xs text-destructive">
            {manualError}
          </p>
        )}
        <p className="mt-2 text-xs opacity-60">Token ada di sudut bawah layar konfirmasi RSVP tamu (di bawah QR).</p>
      </form>
    </div>
  );
}