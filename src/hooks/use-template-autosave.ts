'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { updateTemplate } from '@/lib/api/custom-templates';
import type { CanvasData } from '@/lib/types';
import { demoIsDemoMode } from '@/lib/env';

export type TemplateSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Autosave (debounced) isi template kustom: menulis `canvas_data` ke
 * `custom_templates` lewat `updateTemplate(id, { canvas_data })` (API yang ada,
 * tanpa perubahan signature). Dipakai halaman `/templates/[id]/edit`; tidak
 * menyentuh `project_designs` maupun alur undangan tamu.
 *
 * `enabled` harus true hanya setelah canvas template selesai dimuat, agar muat
 * awal tidak memicu tulis ulang. `saveNow` dipakai untuk simpan langsung
 * (tombol / aksi builder) dan otomatis membatalkan debounce yang tertunda.
 */
export function useTemplateAutosave(templateId: string, canvas: CanvasData, enabled: boolean) {
  const [status, setStatus] = useState<TemplateSaveStatus>('idle');
  const firstRun = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<CanvasData | null>(null);
  /** Canvas yang menunggu debounce — dipakai untuk flush saat unmount. */
  const pendingRef = useRef<CanvasData | null>(null);

  const saveNow = useCallback(
    async (data: CanvasData): Promise<{ error?: string }> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (demoIsDemoMode()) {
        setStatus('error');
        return { error: 'Mode demo: template kustom tidak disimpan ke database.' };
      }
      setStatus('saving');
      try {
        const { error } = await updateTemplate(templateId, { canvas_data: data });
        if (error) {
          setStatus('error');
          return { error };
        }
        lastSavedRef.current = data;
        pendingRef.current = null;
        setStatus('saved');
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => setStatus('idle'), 1500);
        return {};
      } catch (e) {
        setStatus('error');
        return { error: e instanceof Error ? e.message : 'Gagal menyimpan template.' };
      }
    },
    [templateId]
  );

  useEffect(() => {
    if (!enabled) return;
    // Lewati perubahan pertama (hasil muat awal) — bukan aksi user.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    // Hindari tulis ulang bila canvas sudah tersimpan (mis. via saveNow).
    if (canvas === lastSavedRef.current) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pendingRef.current = canvas;
    timeoutRef.current = setTimeout(() => {
      void saveNow(canvas);
    }, 800);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [canvas, enabled, saveNow]);

  // Saat unmount: flush perubahan yang masih menunggu debounce agar tidak hilang,
  // lalu bersihkan timer agar tidak ada tulis setelah halaman ditinggalkan.
  useEffect(
    () => () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
        const pending = pendingRef.current;
        if (pending) void saveNow(pending);
      }
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    },
    [saveNow]
  );

  return { status, saveNow };
}
