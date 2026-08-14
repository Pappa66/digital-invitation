'use client';

import ErrorPage from '@/components/ui/error-page';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const match = error?.digest?.match(/NEXT_HTTP_ERROR_(\d{3})/);
  const code = match?.[1] ?? '500';

  return (
    <html lang="id">
      <body style={{ margin: 0 }}>
        <ErrorPage
          code={code}
          title="Terjadi kendala"
          description="Maaf, terjadi kendala pada aplikasi. Silakan muat ulang halaman — jika berulang, hubungi tim kami."
          onReset={reset}
          resetLabel="Muat Ulang"
          actionLabel="Kembali ke Beranda"
          actionHref="/"
        />
      </body>
    </html>
  );
}