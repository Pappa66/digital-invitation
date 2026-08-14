'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const BUCKET = 'invitation-assets';

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export default function MediaLibrary({ open, onClose, onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.storage.from(BUCKET).list('', { sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      const items = await Promise.all(
        data
          .filter((f) => f.name && f.id && !f.id.endsWith('.folder'))
          .map(async (f) => {
            const { data: pubUrl } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
            return { name: f.name, url: pubUrl.publicUrl };
          })
      );
      setFiles(items);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) loadFiles();
  }, [open, loadFiles]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const picked = Array.from(fileList);
    setUploading(true);
    setUploadingCount(picked.length);
    try {
      for (const file of picked) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        const name = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error } = await supabase.storage.from(BUCKET).upload(name, compressed, {
          cacheControl: '3600',
          upsert: false
        });
        if (!error) {
          setUploadingCount((c) => Math.max(0, c - 1));
        }
      }
      await loadFiles();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
      setUploadingCount(0);
      e.target.value = '';
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold">Media Library</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:opacity-90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Mengunggah...' : 'Upload New'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <span className="text-xs text-gray-500">
            {uploading ? `Mengunggah ${uploadingCount} gambar...` : 'Pilih banyak gambar sekaligus; akan dikompresi sebelum diunggah.'}
          </span>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">Memuat...</div>
          ) : files.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Belum ada gambar. Upload gambar pertama Anda.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {files.map((f) => (
                <button
                  key={f.name}
                  onClick={() => onSelect(f.url)}
                  className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-gray-400"
                  title={f.name}
                >
                  <Image src={f.url} alt={f.name} fill sizes="(max-width:768px) 33vw, 33vw" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}