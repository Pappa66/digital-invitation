'use client';

interface ColorFieldProps {
  value?: string;
  onChange: (value: string) => void;
  field?: { label?: string };
  readOnly?: boolean;
}

/** Custom field warna: swatch + input hex. Nilai kosong = pakai tema. */
export default function ColorField({ value, onChange, field, readOnly }: ColorFieldProps) {
  const v = typeof value === 'string' ? value : '';
  return (
    <div className="flex flex-col gap-1">
      {field?.label ? <span className="text-xs font-medium text-[#6b5f4d]">{field.label}</span> : null}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={v || '#ffffff'}
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
          placeholder="Ikut tema (kosongkan)"
          className="min-w-0 flex-1 rounded border border-[#ddd0bb] px-2 py-1 font-mono text-xs uppercase placeholder:font-sans placeholder:normal-case placeholder:text-[#b3a69a]"
        />
        {v ? (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => onChange('')}
            title="Kosongkan (ikut tema)"
            className="shrink-0 rounded border border-[#ddd0bb] px-1.5 py-1 text-[10px] text-[#8a7a66] hover:bg-black/5"
          >
            Reset
          </button>
        ) : null}
      </div>
    </div>
  );
}
