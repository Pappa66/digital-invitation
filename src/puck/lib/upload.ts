'use client';

import imageCompression from 'browser-image-compression';
import { supabase } from '@/lib/supabase/client';

function fileToDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Unggah gambar: kompres dulu, lalu coba Supabase Storage (bila sudah login).
 * Fallback POC (belum login / offline): data URL agar gambar tetap tampil di
 * editor. Integrasi Storage penuh menyusul di Fase 3.
 */
export async function uploadImage(file: File): Promise<string> {
  let blob: Blob = file;
  try {
    blob = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 1600, useWebWorker: true });
  } catch {
    /* pakai file asli */
  }

  try {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (user) {
      const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from('invitation-assets')
        .upload(path, blob, { contentType: file.type || 'image/png' });
      if (!error) {
        const { data: pub } = supabase.storage.from('invitation-assets').getPublicUrl(path);
        return pub.publicUrl;
      }
    }
  } catch {
    /* fallback */
  }

  return fileToDataUrl(blob);
}
