'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/puck/lib/upload';
import MediaLibrary from '@/puck/components/media-library';

interface AssetFieldProps {
  value?: string;
  onChange: (value: string) => void;
  field?: { label?: string };
  readOnly?: boolean;
}

/** Custom field gambar/video: unggah cepat, pustaka media, atau tempel URL. */
export default function AssetField({ value, onChange, field, readOnly }: AssetFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [libOpen, setLibOpen] = useState(false);
  const url = typeof value === 'string' ? value : '';

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch {
      setError('Gagal mengunggah.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {field?.label ? <span className="text-xs font-medium text-[#6b5f4d]">{field.label}</span> : null}
      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" accept="image/*,video/*" disabled={readOnly || busy} onChange={handleFile} className="hidden" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={readOnly || busy}
          className="rounded border border-[#ddd0bb] bg-white px-2.5 py-1 text-xs font-medium text-[#8a6d2f] hover:bg-[#c9a45c]/10 disabled:opacity-60"
        >
          {busy ? 'Mengunggah…' : 'Unggah'}
        </button>
        <button type="button" onClick={() => setLibOpen(true)} disabled={readOnly} className="rounded border border-[#ddd0bb] px-2.5 py-1 text-xs text-[#6b5f4d] hover:bg-black/5 disabled:opacity-60">
          Pustaka
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
      {url && /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) ? (
        <video src={url} muted loop playsInline className="h-20 w-full rounded border border-[#eee4cf] object-cover" />
      ) : url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-20 w-full rounded border border-[#eee4cf] object-cover" />
      ) : null}

      <MediaLibrary open={libOpen} onClose={() => setLibOpen(false)} onPick={onChange} />
    </div>
  );
}
