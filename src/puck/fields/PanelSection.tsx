'use client';

interface PanelSectionProps {
  field?: { label?: string };
}

/** Field display-only: judul pemisah seksi di panel properti (bukan input). */
export default function PanelSection({ field }: PanelSectionProps) {
  return (
    <div className="mt-2 border-t border-[#eee4cf] pt-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#b39a65]">
      {field?.label}
    </div>
  );
}
