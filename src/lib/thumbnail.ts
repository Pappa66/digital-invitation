'use client';

import html2canvas from 'html2canvas';
import { supabase } from '@/lib/supabase/client';

const BUCKET = 'invitation-assets';

/**
 * Capture a thumbnail from a DOM element and save the PUBLIC URL into
 * projects.thumbnail. Gambar diupload ke Storage (bukan base64 di kolom
 * text) di bawah folder pemilik: {userId}/thumbs/{projectId}.jpg —
 * konsisten dengan policy upload owner-folder di 0012.
 * Dipanggil saat save manual (bukan autosave) agar tidak membebani.
 */
export async function captureAndSaveThumbnail(
  projectId: string,
  element: HTMLElement
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const canvas = await html2canvas(element, {
      width: 420,
      height: 560,
      scale: 0.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);

    // Ubah data URL jadi Blob lalu unggah ke folder milik user.
    const blob = await (await fetch(dataUrl)).blob();
    const filePath = `${user.id}/thumbs/${projectId}.jpg`;

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, blob, {
      contentType: 'image/jpeg',
      upsert: true,
      cacheControl: '3600'
    });
    if (uploadError) return;

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    await supabase
      .from('projects')
      .update({ thumbnail: pub.publicUrl })
      .eq('id', projectId);
  } catch {
    // Thumbnail generation is best-effort — don't break save flow
  }
}