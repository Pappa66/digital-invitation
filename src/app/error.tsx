'use client';

import ErrorPage from '@/components/ui/error-page';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Next.js menyematkan kode status pada digest untuk beberapa error HTTP.
  const match = error?.digest?.match(/NEXT_HTTP_ERROR_(\d{3})/);
  const code = match?.[1] ?? '500';

  return (
    <ErrorPage
      code={code}
      title="Terjadi kendala"
      description="Maaf, terjadi kendala teknis saat memuat halaman ini. Silakan coba lagi — atau kembali ke beranda sementara kami memperbaiki."
      onReset={reset}
      resetLabel="Coba Lagi"
      actionLabel="Kembali ke Beranda"
      actionHref="/"
    />
  );
}