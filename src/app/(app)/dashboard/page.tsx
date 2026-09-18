import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { demoIsDemoMode } from '@/lib/env';
import type { Project, CanvasData } from '@/lib/types';
import { isPuckData } from '@/lib/canvas/puck-format';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const isDemo = demoIsDemoMode();

  let projects: Project[] = [];
  let userName: string | null = null;
  const thumbnails: Record<string, string> = {};

  if (!isDemo) {
    const user = await requireUser();
    if (!user) redirect('/login');
    userName = user.email ?? null;
    const supabase = await createServerSupabase();
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    projects = (data ?? []) as Project[];

    // Load canvas data to extract hero bg_image as thumbnail fallback
    if (projects.length > 0) {
      const ids = projects.map((p) => p.id);
      const { data: designs } = await supabase
        .from('project_designs')
        .select('project_id, canvas_data')
        .in('project_id', ids);
      if (designs) {
        for (const d of designs as { project_id: string; canvas_data: unknown }[]) {
          try {
            const raw = d.canvas_data;
            let bg: unknown;
            if (isPuckData(raw)) {
              const h = raw.content.find((c) => c.type === 'Hero') as { props?: Record<string, unknown> } | undefined;
              bg = h?.props?.bg_image;
            } else {
              const cd = raw as CanvasData;
              bg = cd?.blocks?.find((b) => b.type === 'Hero')?.props?.bg_image;
            }
            if (typeof bg === 'string' && bg.trim()) {
              thumbnails[d.project_id] = bg;
            }
          } catch { /* ignore malformed canvas */ }
        }
      }
    }
  }

  // Saat demo mode, list project dimuat dari localStorage di sisi client.
  return <DashboardClient projects={projects} isDemo={isDemo} userName={userName} thumbnails={thumbnails} />;
}