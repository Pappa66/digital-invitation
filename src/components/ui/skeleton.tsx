import { AlertTriangle, RefreshCw } from 'lucide-react';

/** Blok shimmer dasar — aksen warna desain, tanpa animasi berat. */
export function Skeleton({ className = '', ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) {
  return <div role="status" aria-hidden className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />;
}

/** Baris skeleton tabel data — dipakai saat muat ulang daftar di tab dashboard. */
export function TableSkeleton({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div role="status" aria-label="Memuat data" className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="space-y-0 divide-y divide-border/60">
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="flex items-center gap-4 px-4 py-3.5">
            {Array.from({ length: cols }, (_, c) => (
              <Skeleton key={c} className={c === 0 ? 'h-4 w-1/4' : c === cols - 1 ? 'h-4 w-1/6' : 'h-4 flex-1'} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Card statistik skeleton untuk halaman keuangan. */
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-busy="true" aria-label="Memuat statistik">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Error in-tab (bukan full-page) — gaya selaras error-page.tsx dengan tombol coba lagi. */
export function InlineError({
  title = 'Gagal memuat data',
  description = 'Terjadi kendala saat mengambil data. Periksa koneksi lalu coba lagi.',
  onRetry
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center" role="alert">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15">
        <AlertTriangle className="h-6 w-6 text-gold-strong" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex min-h-11 items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-gold hover:text-gold-deep"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Coba Lagi
        </button>
      )}
    </div>
  );
}