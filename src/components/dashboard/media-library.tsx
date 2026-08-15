'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';
import { Upload, X, Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

const BUCKET = 'invitation-assets';

const IMAGE_SPECS = {
  hero: { label: 'Hero/Cover', minW: 1080, minH: 1350, recW: 1920, recH: 2400, tip: 'Minimal 1080×1350px, rekomendasi 1920×2400px untuk kualitas terbaik' },
  gallery: { label: 'Galeri', minW: 800, minH: 600, recW: 1200, recH: 900, tip: 'Minimal 800×600px, rekomendasi 1200×900px atau lebih besar' },
  photo: { label: 'Foto Mempelai', minW: 600, minH: 600, recW: 800, recH: 800, tip: 'Minimal 600×600px, rekomendasi 800×800px untuk foto bulat' },
  general: { label: 'Gambar Umum', minW: 400, minH: 400, recW: 800, recH: 800, tip: 'Minimal 400×400px, rekomendasi 800×800px atau lebih besar' }
};

interface ImageQualityInfo {
  width: number;
  height: number;
  sizeKB: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  message: string;
}

function checkImageQuality(file: File, type: keyof typeof IMAGE_SPECS = 'general'): Promise<ImageQualityInfo> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;
      const sizeKB = Math.round(file.size / 1024);
      const spec = IMAGE_SPECS[type];

      if (width < spec.minW || height < spec.minH) {
        resolve({
          width, height, sizeKB,
          status: 'poor',
          message: `Ukuran ${width}×${height}px terlalu kecil. ${spec.tip}`
        });
      } else if (width < spec.recW || height < spec.recH) {
        resolve({
          width, height, sizeKB,
          status: 'warning',
          message: `Ukuran ${width}×${height}px cukup. ${spec.tip}`
        });
      } else if (sizeKB > 2048) {
        resolve({
          width, height, sizeKB,
          status: 'warning',
          message: `Ukuran file ${sizeKB}KB cukup besar, akan dikompresi otomatis.`
        });
      } else {
        resolve({
          width, height, sizeKB,
          status: 'excellent',
          message: `Kualitas bagus: ${width}×${height}px, ${sizeKB}KB`
        });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0, sizeKB: 0, status: 'poor', message: 'Gagal membaca gambar' });
    };
    img.src = url;
  });
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  /** Tipe gambar yang diunggah untuk pengecekan kualitas. */
  imageType?: keyof typeof IMAGE_SPECS;
}

export default function MediaLibrary({ open, onClose, onSelect, imageType = 'general' }: MediaLibraryProps) {
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [qualityReport, setQualityReport] = useState<ImageQualityInfo | null>(null);
  const [showSpecs, setShowSpecs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const prefix = user ? `${user.id}/` : '';
    const { data } = await supabase.storage.from(BUCKET).list(prefix, { sortBy: { column: 'created_at', order: 'desc' } });
    if (data) {
      const items = await Promise.all(
        data
          .filter((f) => f.name && f.id && !f.id.endsWith('.folder'))
          .map(async (f) => {
            const filePath = prefix ? `${prefix}${f.name}` : f.name;
            const { data: pubUrl } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
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

    // Check quality of first image
    if (picked.length > 0 && picked[0].type.startsWith('image/')) {
      const quality = await checkImageQuality(picked[0], imageType);
      setQualityReport(quality);
    }

    setUploading(true);
    setUploadingCount(picked.length);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const prefix = user ? `${user.id}/` : '';
      for (const file of picked) {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        const name = `${prefix}${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
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

        {/* Image Quality Specs Banner */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-gray-700">Spesifikasi Gambar</span>
            </div>
            <button
              onClick={() => setShowSpecs(!showSpecs)}
              className="text-xs text-blue-600 hover:underline"
            >
              {showSpecs ? 'Sembunyikan' : 'Lihat Detail'}
            </button>
          </div>
          {showSpecs && (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {Object.entries(IMAGE_SPECS).map(([key, spec]) => (
                <div key={key} className="rounded-lg bg-white p-2 border border-gray-200">
                  <div className="font-medium text-gray-800">{spec.label}</div>
                  <div className="mt-1 text-gray-600">Min: {spec.minW}×{spec.minH}px</div>
                  <div className="text-gray-600">Rekomendasi: {spec.recW}×{spec.recH}px</div>
                  <div className="mt-1 text-gray-500 italic">{spec.tip}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white hover:opacity-90">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? 'Mengunggah...' : 'Upload New'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
          <span className="text-xs text-gray-500">
            {uploading ? `Mengunggah ${uploadingCount} gambar...` : 'Pilih banyak gambar sekaligus; akan dikompresi sebelum diunggah.'}
          </span>
        </div>

        {/* Quality Report */}
        {qualityReport && (
          <div className={`mx-6 mt-3 flex items-start gap-2 rounded-lg p-3 text-xs ${
            qualityReport.status === 'excellent' ? 'bg-green-50 text-green-800' :
            qualityReport.status === 'good' ? 'bg-blue-50 text-blue-800' :
            qualityReport.status === 'warning' ? 'bg-yellow-50 text-yellow-800' :
            'bg-red-50 text-red-800'
          }`}>
            {qualityReport.status === 'excellent' || qualityReport.status === 'good' ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="font-medium">{qualityReport.message}</div>
              {qualityReport.status === 'poor' && (
                <div className="mt-1 text-gray-600">
                  Gambar dengan resolusi rendah akan terlihat buram di undangan. Unggah gambar dengan resolusi lebih tinggi untuk hasil terbaik.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">Memuat...</div>
          ) : files.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-sm text-gray-500">
              <Upload className="h-8 w-8 mb-2 opacity-30" />
              <p>Belum ada gambar. Upload gambar pertama Anda.</p>
              <p className="mt-1 text-xs text-gray-400">Format: JPG, PNG, WebP. Maks 1MB (akan dikompresi otomatis).</p>
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