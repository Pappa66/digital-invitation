'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CanvasData } from '@/lib/types';
import { canvasToJson } from '@/lib/canvas-json';
import { migrateCanvas } from '@/lib/canvas-migrate';
import { demoIsDemoMode, demoSaveDesign } from '@/lib/demo/demo-store';

interface UseAutosaveOptions {
  projectId: string;
  canvas: CanvasData;
  /**
   * Token link edit (`/edit/[token]`). Bila diisi, simpan lewat RPC
   * `save_design_by_share_token` (security definer) karena sesi anon tidak
   * melewati RLS `project_designs`. Mode owner (login) tidak mengisi ini.
   */
  accessToken?: string;
}

/**
 * Simpan canvas lewat RPC token. Mengembalikan { ok, error } agar pemanggil
 * bisa menampilkan status error yang jujur (bukan "Tersimpan" palsu).
 */
async function saveViaShareToken(
  accessToken: string,
  canvas: CanvasData
): Promise<{ ok: boolean; error: string | null }> {
  const { data, error } = await supabase.rpc('save_design_by_share_token', {
    p_token: accessToken,
    p_canvas: canvasToJson(canvas)
  });

  if (error) return { ok: false, error: error.message };
  const row = Array.isArray(data) ? data[0] : undefined;
  return { ok: Boolean(row?.ok), error: row?.error ?? null };
}

export function useAutosave({ projectId, canvas, accessToken }: UseAutosaveOptions) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const firstRun = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const pendingRef = useRef<CanvasData | null>(null);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    // Cancel previous pending save
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Store latest canvas data for potential retry
    pendingRef.current = canvas;

    const timeout = setTimeout(async () => {
      // Create new abort controller for this save
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus('saving');

      // Normalisasi (isi schema_version, toleran key asing) agar payload
      // konsisten tanpa mengubah alur owner/token yang sudah ada.
      const payload = migrateCanvas(canvas);

      if (demoIsDemoMode()) {
        demoSaveDesign(projectId, payload);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
        return;
      }

      try {
        if (accessToken) {
          // Mode tamu: token divalidasi & ditulis oleh RPC security definer.
          const result = await saveViaShareToken(accessToken, payload);
          if (controller.signal.aborted) return;
          if (!result.ok) {
            setStatus('error');
          } else {
            setStatus('saved');
            setTimeout(() => setStatus('idle'), 1500);
          }
          return;
        }

        // Mode owner (login): perilaku lama, lewat RLS designs_update_own.
        const { error } = await supabase
          .from('project_designs')
          .update({
            canvas_data: canvasToJson(payload),
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId);

        if (controller.signal.aborted) return;

        if (error) {
          setStatus('error');
        } else {
          setStatus('saved');
          setTimeout(() => setStatus('idle'), 1500);
        }
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error');
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [canvas, projectId, accessToken]);

  return status;
}

export async function saveCanvasNow(projectId: string, canvas: CanvasData, accessToken?: string) {
  // Normalisasi sebelum kirim (idempoten; sama seperti jalur autosave).
  const payload = migrateCanvas(canvas);

  if (demoIsDemoMode()) {
    demoSaveDesign(projectId, payload);
    return { error: null };
  }

  if (accessToken) {
    const result = await saveViaShareToken(accessToken, payload);
    return { error: result.ok ? null : { message: result.error ?? 'Gagal menyimpan' } };
  }

  const { error } = await supabase
    .from('project_designs')
    .update({
      canvas_data: canvasToJson(payload),
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId);
  return { error };
}
