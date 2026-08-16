'use client';

/**
 * Bingkai dekoratif mengelilingi seluruh undangan (mode stack).
 * Pola khas undangan digital mewah: border ganda, sudut ornamen,
 * lengkungan atas (arch), atau garis tipis bersih.
 */

interface CornerProps {
  flip: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}

function Corner({ flip, color }: CornerProps) {
  const size = 34;
  const thick = 2;
  const transform =
    flip === 'tr' ? 'scaleX(-1)' : flip === 'bl' ? 'scaleY(-1)' : flip === 'br' ? 'scale(-1,-1)' : 'none';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform }} className="absolute">
      <path
        d={`M ${thick} ${size} V ${thick} H ${size}`}
        fill="none"
        stroke={color}
        strokeWidth={thick}
        strokeLinecap="round"
      />
      <path
        d={`M ${thick + 5} ${size - 4} V ${thick + 5} H ${size - 4}`}
        fill="none"
        stroke={color}
        strokeWidth={thick * 0.6}
        opacity={0.6}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GuestFrame({ mode, color, fixed = true, enabled = true }: { mode?: string; color: string; fixed?: boolean; enabled?: boolean }) {
  if (!mode || mode === 'none' || !enabled) return null;

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
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <span className="absolute left-4 top-4"><Corner flip="tl" color={accent} /></span>
        <span className="absolute right-4 top-4"><Corner flip="tr" color={accent} /></span>
        <span className="absolute bottom-4 left-4"><Corner flip="bl" color={accent} /></span>
        <span className="absolute bottom-4 right-4"><Corner flip="br" color={accent} /></span>
      </div>
    );
  }

  if (mode === 'arch') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute left-1/2 top-0 h-24 w-72 -translate-x-1/2 rounded-b-[999px] border-x border-b border-current/35" style={{ color: accent }} />
        <span className="absolute left-1/2 top-3 h-1.5 w-1.5 -translate-x-1/2 rotate-45 rounded-none border border-current/50" style={{ color: accent }} />
        <span className="absolute left-1/2 top-6 h-3 w-px -translate-x-1/2 bg-current/40" style={{ color: accent }} />
      </div>
    );
  }

  if (mode === 'floral') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute inset-4 rounded-lg border border-current/15" style={{ color: accent }} />
        {/* Top-left floral */}
        <svg className="absolute left-2 top-2 h-10 w-10" viewBox="0 0 40 40" style={{ color: accent }}>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M12 6 C12 6 16 10 12 12 C8 10 12 6 12 6" fill="currentColor" opacity="0.3" />
          <path d="M6 12 C6 12 10 16 12 12 C10 8 6 12 6 12" fill="currentColor" opacity="0.3" />
          <path d="M12 18 C12 18 16 14 12 12 C8 14 12 18 12 18" fill="currentColor" opacity="0.3" />
          <path d="M18 12 C18 12 14 16 12 12 C14 8 18 12 18 12" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Top-right floral */}
        <svg className="absolute right-2 top-2 h-10 w-10" viewBox="0 0 40 40" style={{ color: accent, transform: 'scaleX(-1)' }}>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M12 6 C12 6 16 10 12 12 C8 10 12 6 12 6" fill="currentColor" opacity="0.3" />
          <path d="M6 12 C6 12 10 16 12 12 C10 8 6 12 6 12" fill="currentColor" opacity="0.3" />
          <path d="M12 18 C12 18 16 14 12 12 C8 14 12 18 12 18" fill="currentColor" opacity="0.3" />
          <path d="M18 12 C18 12 14 16 12 12 C14 8 18 12 18 12" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Bottom-left floral */}
        <svg className="absolute bottom-2 left-2 h-10 w-10" viewBox="0 0 40 40" style={{ color: accent, transform: 'scaleY(-1)' }}>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M12 6 C12 6 16 10 12 12 C8 10 12 6 12 6" fill="currentColor" opacity="0.3" />
          <path d="M6 12 C6 12 10 16 12 12 C10 8 6 12 6 12" fill="currentColor" opacity="0.3" />
        </svg>
        {/* Bottom-right floral */}
        <svg className="absolute bottom-2 right-2 h-10 w-10" viewBox="0 0 40 40" style={{ color: accent, transform: 'scale(-1,-1)' }}>
          <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          <path d="M12 6 C12 6 16 10 12 12 C8 10 12 6 12 6" fill="currentColor" opacity="0.3" />
          <path d="M6 12 C6 12 10 16 12 12 C10 8 6 12 6 12" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
    );
  }

  if (mode === 'thick') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute inset-3 rounded-sm border-[3px] border-current/25" style={{ color: accent }} />
        <div className="absolute inset-[18px] rounded-sm border border-current/10" style={{ color: accent }} />
      </div>
    );
  }

  if (mode === 'dashed') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute inset-4 rounded-xl border-2 border-dashed border-current/20" style={{ color: accent }} />
      </div>
    );
  }

  if (mode === 'ornate') {
    return (
      <div aria-hidden className={`pointer-events-none z-40 ${placement} inset-0`}>
        <div className="absolute inset-3 border border-current/20" style={{ color: accent }} />
        {/* Top center ornament */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ color: accent }}>
          <svg width="120" height="20" viewBox="0 0 120 20">
            <path d="M0 10 Q30 0 60 10 Q90 20 120 10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="60" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <circle cx="30" cy="5" r="1.5" fill="currentColor" opacity="0.3" />
            <circle cx="90" cy="15" r="1.5" fill="currentColor" opacity="0.3" />
          </svg>
        </div>
        {/* Bottom center ornament */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ color: accent, transform: 'translateX(-50%) scaleY(-1)' }}>
          <svg width="120" height="20" viewBox="0 0 120 20">
            <path d="M0 10 Q30 0 60 10 Q90 20 120 10" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="60" cy="10" r="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          </svg>
        </div>
        {/* Corner dots */}
        <span className="absolute left-5 top-5 h-1.5 w-1.5 rounded-full bg-current/30" style={{ color: accent }} />
        <span className="absolute right-5 top-5 h-1.5 w-1.5 rounded-full bg-current/30" style={{ color: accent }} />
        <span className="absolute bottom-5 left-5 h-1.5 w-1.5 rounded-full bg-current/30" style={{ color: accent }} />
        <span className="absolute bottom-5 right-5 h-1.5 w-1.5 rounded-full bg-current/30" style={{ color: accent }} />
      </div>
    );
  }

  // classic
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
