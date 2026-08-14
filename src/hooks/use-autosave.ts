'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { CanvasData } from '@/lib/types';
import { canvasToJson } from '@/lib/canvas-json';
import { demoIsDemoMode, demoSaveDesign } from '@/lib/demo/demo-store';

interface UseAutosaveOptions {
  projectId: string;
  canvas: CanvasData;
}

export function useAutosave({ projectId, canvas }: UseAutosaveOptions) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    const timeout = setTimeout(async () => {
      setStatus('saving');

      if (demoIsDemoMode()) {
        demoSaveDesign(projectId, canvas);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
        return;
      }

      const { error } = await supabase
        .from('project_designs')
        .update({
          canvas_data: canvasToJson(canvas),
          updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId);

      if (error) {
        setStatus('error');
      } else {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 1500);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [canvas, projectId]);

  return status;
}

export async function saveCanvasNow(projectId: string, canvas: CanvasData) {
  if (demoIsDemoMode()) {
    demoSaveDesign(projectId, canvas);
    return { error: null };
  }
  const { error } = await supabase
    .from('project_designs')
    .update({
      canvas_data: canvasToJson(canvas),
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId);
  return { error };
}