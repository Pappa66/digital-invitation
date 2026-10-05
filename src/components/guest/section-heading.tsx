interface SectionHeadingProps {
  /** Label kecil di atas judul (mis. "Doa & Ucapan"). Opsional. */
  kicker?: string;
  /** Judul section. */
  title: string;
  /** ID elemen judul — untuk anchor scroll / `aria-labelledby`. Opsional. */
  id?: string;
}

/**
 * Heading section seragam untuk tampilan tamu: kicker uppercase, judul
 * `font-heading`, dan pembatas intan emas — mengikuti gaya header Buku Tamu.
 * Murni presentasional (tanpa state) agar bisa dipakai ulang antar-section.
 */
export default function SectionHeading({ kicker, title, id }: SectionHeadingProps) {
  return (
    <div className="relative mx-auto mb-9 flex max-w-md flex-col items-center text-center">
      {kicker && <span className="text-[10px] uppercase tracking-[0.4em] opacity-60">{kicker}</span>}
      <h2 id={id} className={`font-heading text-3xl md:text-4xl${kicker ? ' mt-2' : ''}`}>
        {title}
      </h2>
      <span className="mt-3 flex items-center gap-2 opacity-50" aria-hidden>
        <span className="h-px w-10" style={{ background: 'currentColor' }} />
        <span className="h-1.5 w-1.5 rotate-45" style={{ background: 'var(--color-primary)' }} />
        <span className="h-px w-10" style={{ background: 'currentColor' }} />
      </span>
    </div>
  );
}
