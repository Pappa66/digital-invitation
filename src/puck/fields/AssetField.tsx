'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/puck/lib/upload';

interface AssetFieldProps {
  value?: string;
  onChange: (value: string) => void;
  field?: { label?: string };
  readOnly?: boolean;
}

/** Custom field gambar: unggah (kompres + Storage/fallback) atau tempel URL. */
export default function AssetField({ value, onChange, field, readOnly }: AssetFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const url = typeof value === 'string' ? value : '';

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const next = await uploadImage(file);
      onChange(next);
    } catch {
      setError('Gagal mengunggah gambar.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field?.label ? <span className="text-xs font-medium text-[#6b5f4d]">{field.label}</span> : null}
      <div className="flex items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*" disabled={readOnly || busy} onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={readOnly || busy}
          className="rounded border border-[#ddd0bb] bg-white px-2.5 py-1 text-xs font-medium text-[#8a6d2f] hover:bg-[#c9a45c]/10 disabled:opacity-60"
        >
          {busy ? 'Mengunggah…' : 'Unggah gambar'}
        </button>
        {url ? (
          <button type="button" onClick={() => onChange('')} disabled={readOnly} className="rounded border border-[#ddd0bb] px-2 py-1 text-xs text-[#8a7a66] hover:bg-black/5">
            Hapus
          </button>
        ) : null}
      </div>
      <input
        type="text"
        value={url}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="w-full rounded border border-[#ddd0bb] px-2 py-1 text-xs"
      />
      {error ? <span className="text-[10px] text-red-500">{error}</span> : null}
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-20 w-full rounded border border-[#eee4cf] object-cover" />
      ) : null}
    </div>
  );
}
