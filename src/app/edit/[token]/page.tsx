import { notFound } from 'next/navigation';
import Link from 'next/link';
import { validateShareToken } from '@/lib/actions/share-token-actions';
import EditTokenClient from './client';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function EditTokenPage({ params }: Props) {
  const { token } = await params;

  if (!token || typeof token !== 'string') {
    notFound();
  }

  const validation = await validateShareToken(token);

  if (!validation.valid || !validation.project_id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] p-6">
        <div className="max-w-sm rounded-2xl border border-[#e0d6c2] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-[#2B2620]">Akses Tidak Tersedia</h1>
          <p className="mt-2 text-sm text-[#6b5f4d]">
            {validation.error ?? 'Link edit ini tidak valid atau sudah kedaluwarsa.'}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#c9a45c] to-[#dfc68a] px-5 py-2.5 text-sm font-semibold text-[#2B2620] shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <EditTokenClient
      projectId={validation.project_id}
      projectTitle={validation.project_title ?? 'Undangan'}
      token={token}
    />
  );
}
