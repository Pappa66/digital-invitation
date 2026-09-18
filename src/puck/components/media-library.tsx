'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, UploadCloud } from 'lucide-react';
import { listAssets, deleteAsset, type MediaAsset } from '@/lib/actions/asset-actions';
import { uploadImageWithProgress } from '@/puck/lib/upload';

interface UploadRow {
  id: string;
  name: string;
  pct: number;
  error?: boolean;
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  /** Bila diisi: memilih aset (mode picker). */
  onPick?: (url: string) => void;
}

/** Pustaka media: multi-upload (drag/klik) + progress bar, grid, hapus. */
export default function MediaLibrary({ open, onClose, onPick }: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [uploads, setUploads] = useState<UploadRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    listAssets().then((r) => setAssets(r.data ?? []));
  }, [open]);

  // Sembunyikan outline seleksi kanvas selama modal terbuka.
  useEffect(() => {
    if (!open) return;
    document.body.classList.add('puck-modal-open');
    return () => document.body.classList.remove('puck-modal-open');
  }, [open]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const rows = list.map((f) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: f.name, pct: 0 }));
    setUploads((u) => [...u, ...rows]);

    await Promise.all(
      list.map(async (file, i) => {
        const row = rows[i];
        try {
          await uploadImageWithProgress(file, (pct) => setUploads((u) => u.map((r) => (r.id === row.id ? { ...r, pct } : r))));
        } catch {
          setUploads((u) => u.map((r) => (r.id === row.id ? { ...r, error: true } : r)));
        }
      })
    );

    // Bersihkan baris selesai setelah jeda, lalu muat ulang daftar.
    setTimeout(() => setUploads((u) => u.filter((r) => r.error)), 1200);
    const res = await listAssets();
    setAssets(res.data ?? []);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function remove(id: string) {
    await deleteAsset(id);
    setAssets((a) => (a ? a.filter((x) => x.id !== id) : a));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-start justify-center overflow-auto bg-black/60 p-6">
      <div className="mt-6 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2b2620]">Pustaka Media</h3>
          <button type="button" onClick={onClose} className="rounded border border-[#e0d6c2] px-3 py-1 text-xs font-medium hover:bg-[#f4efe6]">
            Tutup
          </button>
        </div>

        {/* Area unggah */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            void handleFiles(e.dataTransfer.files);
          }}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
            dragOver ? 'border-[#c9a45c] bg-[#c9a45c]/10' : 'border-[#e0d6c2] hover:border-[#c9a45c]'
          }`}
        >
          <UploadCloud className="h-6 w-6 text-[#b39a65]" />
          <span className="text-xs font-medium text-[#8a6d2f]">Klik atau seret file ke sini (bisa banyak)</span>
          <span className="text-[10px] text-[#b3a69a]">Gambar atau video</span>
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        </label>

        {/* Progress upload */}
        {uploads.length > 0 ? (
          <div className="mt-3 space-y-2">
            {uploads.map((u) => (
              <div key={u.id} className="text-[11px] text-[#6b5f4d]">
                <div className="flex justify-between">
                  <span className="truncate">{u.name}</span>
                  <span>{u.error ? 'Gagal' : `${u.pct}%`}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#f1ece1]">
                  <div className={`h-full rounded-full ${u.error ? 'bg-red-400' : 'bg-[#c9a45c]'}`} style={{ width: `${u.error ? 100 : u.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Grid aset */}
        {assets === null ? (
          <p className="mt-4 text-xs text-[#8a7a66]">Memuat…</p>
        ) : assets.length === 0 && uploads.length === 0 ? (
          <p className="mt-4 text-xs text-[#8a7a66]">Belum ada file. Unggah di atas.</p>
        ) : (
          <div className="mt-4 grid max-h-[55vh] grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {assets.map((a) => (
              <div key={a.id} className="group relative overflow-hidden rounded-lg border border-[#e7ddcc]">
                {onPick ? (
                  <button
                    type="button"
                    onClick={() => {
                      onPick(a.url);
                      onClose();
                    }}
                    className="block w-full"
                    title="Pilih"
                  >
                    <AssetThumb asset={a} />
                  </button>
                ) : (
                  <AssetThumb asset={a} />
                )}
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  title="Hapus"
                  className="absolute right-1 top-1 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AssetThumb({ asset }: { asset: MediaAsset }) {
  const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(asset.url);
  return isVideo ? (
    <video src={asset.url} muted loop className="aspect-square w-full object-cover" />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={asset.url} alt={asset.name ?? ''} loading="lazy" className="aspect-square w-full object-cover" />
  );
}
