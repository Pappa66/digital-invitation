'use client';

interface ColorFieldProps {
  value: string;
  onChange: (value: string) => void;
  field?: { label?: string };
  readOnly?: boolean;
}

/** Custom field warna: swatch + input hex. */
export default function ColorField({ value, onChange, field, readOnly }: ColorFieldProps) {
  const v = typeof value === 'string' && value ? value : '#000000';
  return (
    <div className="flex flex-col gap-1">
      {field?.label ? <span className="text-xs font-medium text-[#6b5f4d]">{field.label}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[#ddd0bb] bg-white p-0.5"
          aria-label={field?.label ? `Pilih ${field.label}` : 'Pilih warna'}
        />
        <input
          type="text"
          value={v}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded border border-[#ddd0bb] px-2 py-1 font-mono text-xs uppercase"
        />
      </div>
    </div>
  );
}
