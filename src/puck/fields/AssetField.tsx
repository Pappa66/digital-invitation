'use client';

import { useRef, useState } from 'react';
import { uploadImage } from '@/puck/lib/upload';
import { listAssets, type MediaAsset } from '@/lib/actions/asset-actions';

interface AssetFieldProps {
  value?: string;
  onChange: (value: string) => void;
  field?: { label?: string };
  readOnly?: boolean;
}

/** Custom field gambar: unggah (kompres + Storage), tempel URL, atau pilih dari pustaka. */
export default function AssetField({ value, onChange, field, readOnly }: AssetFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [libOpen, setLibOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const url = typeof value === 'string' ? value : '';

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await uploadImage(file));
    } catch {
      setError('Gagal mengunggah gambar.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function openLibrary() {
    setLibOpen(true);
    if (assets === null) {
      const res = await listAssets();
      setAssets(res.data ?? []);
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
        <button type="button" onClick={openLibrary} disabled={readOnly} className="rounded border border-[#ddd0bb] px-2.5 py-1 text-xs text-[#6b5f4d] hover:bg-black/5 disabled:opacity-60">
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

      {libOpen ? (
        <div className="fixed inset-0 z-[1300] flex items-start justify-center overflow-auto bg-black/40 p-6">
          <div className="mt-6 w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#2b2620]">Pustaka Media</h3>
              <button type="button" onClick={() => setLibOpen(false)} className="rounded border border-[#e0d6c2] px-2 py-1 text-xs">
                Tutup
              </button>
            </div>
            {assets === null ? (
              <p className="mt-4 text-xs text-[#8a7a66]">Memuat…</p>
            ) : assets.length === 0 ? (
              <p className="mt-4 text-xs text-[#8a7a66]">Belum ada gambar. Unggah dulu dari tombol “Unggah”.</p>
            ) : (
              <div className="mt-4 grid max-h-[60vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {assets.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onChange(a.url);
                      setLibOpen(false);
                    }}
                    className="overflow-hidden rounded-lg border border-[#e7ddcc] hover:border-[#c9a45c]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.url} alt={a.name ?? ''} className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
