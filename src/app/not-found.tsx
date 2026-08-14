import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dashboard-bg px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white">
        <Heart className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Undangan tidak ditemukan</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
          Link mungkin salah ketik, sudah dihapus, atau belum di-publish. Periksa kembali tautan yang diberikan oleh tuan rumah.
        </p>
      </div>
      <Link href="/" className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
        Kembali ke Beranda
      </Link>
    </div>
  );
}