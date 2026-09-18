'use client';

import { UserCheck } from 'lucide-react';
import QRCode from 'react-qr-code';
import { useEffect, useState } from 'react';
import { getSiteOrigin } from '@/lib/site';
import { Inner } from '@/components/guest/inner-context';

interface CheckInProps {
  projectId: string;
  greetingName?: string;
  preview?: boolean;
}

/**
 * Informasi absensi hari-H untuk tamu. Panitia memindai QR personal tamu
 * (dari layar sukses RSVP) di halaman /absen/{projectId}.
 * Tidak ada form check-in manual — semua lewat token RSVP.
 */
export default function CheckIn({ projectId, preview }: CheckInProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${getSiteOrigin()}/absen/${projectId}`);
  }, [projectId]);

  if (preview) return null;

  return (
    <section className="mx-auto w-full px-6 py-8 sm:py-10 md:py-12 text-center">
      <div className="rounded-3xl border border-current/15 bg-white/5 px-6 py-8">
        <Inner name="title">
          <UserCheck className="mx-auto h-8 w-8 opacity-80" />
          <h2 className="mt-3 text-xl md:text-2xl">Absensi Kehadiran</h2>
        </Inner>
        <Inner name="note">
          <p className="mt-2 text-xs leading-relaxed opacity-75">
            Setelah konfirmasi RSVP, Anda akan menerima QR personal. Tunjukkan QR tersebut kepada panitia saat tiba di venue.
          </p>
        </Inner>
        <Inner name="button">
          <button
            type="button"
            onClick={() => setQrOpen((o) => !o)}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-current/25 px-5 py-2 text-xs font-medium transition-colors hover:bg-current/10 active:scale-95"
          >
            {qrOpen ? 'Sembunyikan QR Panitia' : 'Tampilkan QR Panitia'}
          </button>
        </Inner>
        {qrOpen && (
          <Inner name="qr">
            <div className="mt-5 inline-block rounded-2xl bg-white p-4">
              <QRCode value={url || ' '} size={140} fgColor="#111827" />
            </div>
            <p className="mt-3 text-xs leading-relaxed opacity-70">
              QR ini untuk panitia — bukan QR personal tamu. Tamu memindai QR dari konfirmasi RSVP.
            </p>
          </Inner>
        )}
      </div>
    </section>
  );
}
