'use client';

/**
 * Bingkai dekoratif mengelilingi seluruh undangan (mode stack).
 * Pola khas undangan digital mewah: border ganda, sudut ornamen,
 * lengkungan atas (arch), atau garis tipis bersih.
 */
export function GuestFrame({ mode, color, fixed = true }: { mode?: string; color: string; fixed?: boolean }) {
  if (!mode || mode === 'none') return null;

  const accent = color;
  const placement = fixed ? 'fixed' : 'absolute';

  if (mode === 'double') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute inset-2 rounded-sm border border-current/30" style={{ color: accent }} />
        <div className="absolute inset-[9px] rounded-sm border border-current/20" style={{ color: accent }} />
        <div className="absolute inset-[16px] rounded-sm border border-current/10" style={{ color: accent }} />
      </div>
    );
  }

  if (mode === 'corner') {
    const size = 34;
    const thick = 2;
    const Corner = ({ flip }: { flip: 'tl' | 'tr' | 'bl' | 'br' }) => {
      const transform =
        flip === 'tr' ? 'scaleX(-1)' : flip === 'bl' ? 'scaleY(-1)' : flip === 'br' ? 'scale(-1,-1)' : 'none';
      return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform }} className="absolute">
          <path
            d={`M ${thick} ${size} V ${thick} H ${size}`}
            fill="none"
            stroke={accent}
            strokeWidth={thick}
            strokeLinecap="round"
          />
          <path
            d={`M ${thick + 5} ${size - 4} V ${thick + 5} H ${size - 4}`}
            fill="none"
            stroke={accent}
            strokeWidth={thick * 0.6}
            opacity={0.6}
            strokeLinecap="round"
          />
        </svg>
      );
    };
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <span className="absolute left-4 top-4">
          <Corner flip="tl" />
        </span>
        <span className="absolute right-4 top-4">
          <Corner flip="tr" />
        </span>
        <span className="absolute bottom-4 left-4">
          <Corner flip="bl" />
        </span>
        <span className="absolute bottom-4 right-4">
          <Corner flip="br" />
        </span>
      </div>
    );
  }

  if (mode === 'arch') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div
          className="absolute left-1/2 top-0 h-24 w-72 -translate-x-1/2 rounded-b-[999px] border-x border-b border-current/35"
          style={{ color: accent }}
        />
        <span className="absolute left-1/2 top-3 h-1.5 w-1.5 -translate-x-1/2 rotate-45 rounded-none border border-current/50" style={{ color: accent }} />
        <span className="absolute left-1/2 top-6 h-3 w-px -translate-x-1/2 bg-current/40" style={{ color: accent }} />
      </div>
    );
  }

  // classic: satu garis tipis + ornamen tengah atas & bawah
  return (
    <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
      <div className="absolute inset-3 rounded-sm border border-current/20" style={{ color: accent }} />
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <span className="-mt-[1px] h-px w-24 bg-current/40" style={{ color: accent }} />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex justify-center">
        <span className="-mb-[1px] h-px w-24 bg-current/40" style={{ color: accent }} />
      </div>
    </div>
  );
}