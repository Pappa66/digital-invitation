import type { Metadata } from 'next';
import { getAbsProjectMeta } from '@/lib/actions/checkin-actions';
import AbsenScanner from '@/components/absen/AbsenScanner';

interface AbsenPageProps {
  params: Promise<{ projectId: string }>;
}

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Absensi Kehadiran — Prasha Digital',
  robots: { index: false, follow: false }
};

export default async function AbsenPage({ params }: AbsenPageProps) {
  const { projectId } = await params;
  const { meta } = await getAbsProjectMeta(projectId);

  if (!meta) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-background px-6 py-12 text-foreground">
        <div className="w-full max-w-sm rounded-3xl border border-current/12 bg-card/60 px-6 py-12 text-center shadow-soft">
          <h1 className="text-xl font-medium text-gold-deep">Absensi Kehadiran</h1>
          <p className="mt-3 text-sm leading-relaxed opacity-75">
            Undangan tidak ditemukan atau belum dipublikasikan.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-background px-4 py-8 text-foreground">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Absensi Kehadiran</p>
        <h1 className="mt-2 font-heading text-xl text-gold-deep md:text-2xl">{meta.title}</h1>
      </header>
      <div className="mt-6">
        <AbsenScanner projectId={meta.id} />
      </div>
    </main>
  );
}