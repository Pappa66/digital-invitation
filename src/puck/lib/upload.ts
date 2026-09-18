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
 * Fallback lokal (belum login / offline): data URL agar gambar tetap tampil di
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
        // Catat ke pustaka media (abaikan bila gagal).
        await supabase.from('assets').insert({ user_id: user.id, url: pub.publicUrl, path, name: file.name });
        return pub.publicUrl;
      }
    }
  } catch {
    /* fallback */
  }

  return fileToDataUrl(blob);
}

/**
 * Unggah dengan progress (XHR) + catat ke pustaka media. Fallback data URL
 * bila belum login. `onProgress` dipanggil 0–100.
 */
export async function uploadImageWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
  let blob: Blob = file;
  try {
    if (file.type.startsWith('image/')) {
      blob = await imageCompression(file, { maxSizeMB: 1.5, maxWidthOrHeight: 1600, useWebWorker: true });
    }
  } catch {
    /* pakai file asli */
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!session || !base || !anon) {
    onProgress(100);
    return fileToDataUrl(blob);
  }

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${base}/storage/v1/object/invitation-assets/${path}`);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey', anon);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 95));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload gagal (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Gagal jaringan'));
    xhr.send(blob);
  });

  const { data: pub } = supabase.storage.from('invitation-assets').getPublicUrl(path);
  await supabase.from('assets').insert({ user_id: session.user.id, url: pub.publicUrl, path, name: file.name });
  onProgress(100);
  return pub.publicUrl;
}

