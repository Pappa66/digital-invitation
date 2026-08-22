'use client';

import { supabase } from '@/lib/supabase/client';
import { useBuilderStore } from '@/store/builder-store';

const BUCKET = 'invitation-assets';

/**
 * Capture a thumbnail from a DOM element and save the PUBLIC URL into
 * projects.thumbnail. Jika Hero punya bg_image, gunakan langsung sebagai
 * thumbnail (lebih ringan dari html2canvas). Fallback ke html2canvas.
 */
export async function captureAndSaveThumbnail(
  projectId: string,
  element: HTMLElement
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Coba pakai hero bg_image sebagai thumbnail
    const canvas = useBuilderStore.getState().canvas;
    const heroBlock = canvas.blocks.find((b) => b.type === 'Hero');
    const heroBg = heroBlock?.props?.bg_image;
    if (typeof heroBg === 'string' && heroBg.trim()) {
      await supabase
        .from('projects')
        .update({ thumbnail: heroBg })
        .eq('id', projectId);
      return;
    }

    // Fallback: html2canvas
    const { default: html2canvas } = await import('html2canvas');
    const cvs = await html2canvas(element, {
      width: 420,
      height: 560,
      scale: 0.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    const dataUrl = cvs.toDataURL('image/jpeg', 0.6);

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