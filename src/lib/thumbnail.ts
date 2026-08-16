'use client';

import html2canvas from 'html2canvas';

/**
 * Capture a thumbnail from a DOM element and save it to the projects table.
 * Called on manual save (not autosave) to avoid performance impact.
 */
export async function captureAndSaveThumbnail(
  projectId: string,
  element: HTMLElement
): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      width: 420,
      height: 560,
      scale: 0.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    const { supabase } = await import('@/lib/supabase/client');
    await supabase
      .from('projects')
      .update({ thumbnail: dataUrl } as never)
      .eq('id', projectId);
  } catch {
    // Thumbnail generation is best-effort — don't break save flow
  }
}
