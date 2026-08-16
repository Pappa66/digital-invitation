import Link from 'next/link';

interface ErrorPageProps {
  /** Kode status seperti 404, 500, 502. Ditampilkan besar sebagai karakter. */
  code: string;
  /** Teks singkat di atas judul (opsional). */
  eyebrow?: string;
  title: string;
  description: string;
  /** Tombol utama. */
  actionLabel?: string;
  actionHref?: string;
  /** Alternatif tombol utama: jalankan aksi langsung (untuk error.tsx). */
  onReset?: () => void;
  resetLabel?: string;
}

function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-[#c9a45c]" />
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <rect x="0.5" y="0.5" width="9" height="9" transform="rotate(45 5 5)" stroke="#c9a45c" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-[#c9a45c]" />
    </div>
  );
}

/** Halaman error elegan ala undangan pernikahan — aman dipakai di server & client. */
export default function ErrorPage({
  code,
  eyebrow,
  title,
  description,
  actionLabel = 'Kembali ke Beranda',
  actionHref = '/',
  onReset,
  resetLabel = 'Coba Lagi'
}: ErrorPageProps) {
  /** Tampilkan tautan sekunder "Beranda" hanya saat bukan halaman beranda. */
  const showSecondaryHome = onReset ? true : actionHref !== '/';
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#faf7f2] px-6 py-16 text-center">
      {/* Ornamen latar: kilauan emas lembut + tekstur titik halus */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,164,92,0.16),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(201,164,92,0.10),transparent_50%)]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #2b2620 1px, transparent 1px)', backgroundSize: '26px 26px' }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <p className="font-script text-3xl text-[#b98a3e]">Prasha Digital</p>
        <Ornament />

        <div
          className="mt-6 select-none bg-gradient-to-b from-[#b98a3e] to-[#8a6d2f] bg-clip-text text-[7rem] font-bold leading-none tracking-tight text-transparent sm:text-[9rem]"
          aria-hidden
        >
          {code}
        </div>

        <h1 className="mt-4 max-w-xl font-heading text-2xl font-semibold text-[#2b2620] sm:text-3xl">{title}</h1>
        {eyebrow && <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#b98a3e]">{eyebrow}</p>}
        <p className="mt-3 max-w-md text-sm leading-relaxed text-[#8a7a66]">{description}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onReset ? (
            <button
              onClick={onReset}
              className="rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              {resetLabel}
            </button>
          ) : (
            <Link
              href={actionHref}
              className="rounded-lg bg-gradient-to-r from-[#c9a45c] to-[#b98a3e] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
            >
              {actionLabel}
            </Link>
          )}
          {showSecondaryHome && (
            <Link
              href="/"
              className="rounded-lg border border-[#e0d6c2] bg-white px-6 py-2.5 text-sm font-medium text-[#4a443c] transition-colors hover:border-[#c9a45c] hover:text-[#2b2620]"
            >
              Beranda
            </Link>
          )}
        </div>

        <p className="mt-8 text-xs text-[#b3a69a]">&copy; {new Date().getFullYear()} Prasha Digital Indonesia</p>
      </div>
    </div>
  );
}