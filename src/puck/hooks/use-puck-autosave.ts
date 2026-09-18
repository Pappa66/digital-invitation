'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { demoIsDemoMode } from '@/lib/demo/demo-store';
import type { Json } from '@/lib/types/supabase';
import type { PuckData } from '@/lib/canvas/puck-format';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UsePuckAutosaveOptions {
  projectId: string;
  data: PuckData | null;
  enabled: boolean;
  /** Override penyimpanan (mis. via token edit). Default: Supabase langsung. */
  save?: (data: PuckData) => Promise<{ error?: unknown }>;
}

/** Autosave debounce 300ms untuk data Puck ke `project_designs.canvas_data`. */
export function usePuckAutosave({ projectId, data, enabled, save }: UsePuckAutosaveOptions): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const firstRun = useRef(true);
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    if (!enabled || !data) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const timeout = setTimeout(async () => {
      setStatus('saving');
      if (demoIsDemoMode()) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
        return;
      }
      try {
        let ok = false;
        if (saveRef.current) {
          const res = await saveRef.current(data);
          ok = !res?.error;
        } else {
          const { error } = await supabase
            .from('project_designs')
            .update({ canvas_data: data as unknown as Json, updated_at: new Date().toISOString() })
            .eq('project_id', projectId);
          ok = !error;
        }
        setStatus(ok ? 'saved' : 'error');
        if (ok) setTimeout(() => setStatus('idle'), 1500);
      } catch {
        setStatus('error');
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [data, enabled, projectId]);

  return status;
}

/** Simpan segera (mis. saat publish). */
export async function savePuckNow(projectId: string, data: PuckData) {
  if (demoIsDemoMode()) return { error: null };
  const { error } = await supabase
    .from('project_designs')
    .update({ canvas_data: data as unknown as Json, updated_at: new Date().toISOString() })
    .eq('project_id', projectId);
  return { error };
}
