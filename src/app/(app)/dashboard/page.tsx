import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { demoIsDemoMode } from '@/lib/env';
import type { Project } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const isDemo = demoIsDemoMode();

  let projects: Project[] = [];
  let userName: string | null = null;

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
  }

  // Saat demo mode, list project dimuat dari localStorage di sisi client.
  return <DashboardClient projects={projects} isDemo={isDemo} userName={userName} />;
}