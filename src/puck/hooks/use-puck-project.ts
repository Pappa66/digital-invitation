'use client';

import { useEffect, useState } from 'react';
import { emptyPuckData, isPuckData, type PuckData } from '@/lib/canvas/puck-format';
import { getPuckTemplate } from '@/lib/templates/puck';
import { supabase } from '@/lib/supabase/client';
import { clientVerifyProjectAccess } from '@/lib/api/project-client';
import { loadDesignByShareToken } from '@/lib/actions/share-token-actions';
import { demoIsDemoMode } from '@/lib/demo/demo-store';

export type BuilderAccess = 'checking' | 'ok' | 'denied';

export interface ProjectMeta {
  title: string;
  slug: string | null;
  status: 'draft' | 'published';
}

const INITIAL_META: ProjectMeta = { title: 'Tanpa Judul', slug: null, status: 'draft' };

/**
 * Memuat data proyek (canvas Puck + meta + hak akses) untuk editor.
 * Menangani tiga sumber: demo lokal, link-edit (token), dan pemilik (Supabase).
 */
export function usePuckProject(projectId: string, editToken?: string) {
  const [data, setData] = useState<PuckData | null>(null);
  const [access, setAccess] = useState<BuilderAccess>('checking');
  const [legacy, setLegacy] = useState(false);
  const [meta, setMeta] = useState<ProjectMeta>(INITIAL_META);

  useEffect(() => {
    let cancelled = false;
    const resolveCanvas = (raw: unknown) => {
      if (isPuckData(raw)) return raw;
      if (raw) setLegacy(true);
      return emptyPuckData();
    };

    async function load() {
      if (demoIsDemoMode()) {
        setData(getPuckTemplate('ivory-gold') ?? emptyPuckData());
        setMeta({ title: 'Demo — Ivory Gold', slug: 'demo-undangan', status: 'draft' });
        setAccess('ok');
        return;
      }

      if (editToken) {
        const res = await loadDesignByShareToken(editToken);
        if (cancelled) return;
        if (res.error || !res.data) return setAccess('denied');
        setData(resolveCanvas(res.data.canvas_data));
        setMeta({ title: res.data.project_title, slug: res.data.project_slug || null, status: 'draft' });
        setAccess('ok');
        return;
      }

      const { allowed } = await clientVerifyProjectAccess(projectId);
      if (cancelled) return;
      if (!allowed) return setAccess('denied');

      const { data: row } = await supabase.from('project_designs').select('canvas_data').eq('project_id', projectId).maybeSingle();
      setData(resolveCanvas(row?.canvas_data));

      const { data: proj } = await supabase.from('projects').select('title, slug, status').eq('id', projectId).maybeSingle();
      if (!cancelled && proj) {
        setMeta({ title: proj.title ?? 'Tanpa Judul', slug: proj.slug ?? null, status: proj.status === 'published' ? 'published' : 'draft' });
      }
      setAccess('ok');
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [projectId, editToken]);

  return { data, setData, access, legacy, meta, setMeta };
}
