import { notFound, redirect } from 'next/navigation';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import InviteManager from '@/components/invite/invite-manager';
import { demoIsDemoMode } from '@/lib/env';

interface PageProps {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export default async function InvitePage({ params, searchParams }: PageProps) {
  const { projectId } = await params;
  const search = await searchParams;
  const token = typeof search?.t === 'string' ? search.t.slice(0, 64) : undefined;

  // Mode demo: data diambil dari localStorage via komponen client.
  if (demoIsDemoMode()) {
    return <InviteManager projectId={projectId} />;
  }

  const supabase = await createServerSupabase();

  // 1) Token akses: pihak yang terikat desain bisa masuk TANPA login.
  if (token) {
    const { data: invite } = await supabase.rpc('get_invite_by_token', {
      p_project_id: projectId,
      p_token: token
    });
    const row = Array.isArray(invite) ? invite[0] : null;
    if (row) {
      return <InviteManager projectId={projectId} slug={row.slug} title={row.title} accessToken={token} />;
    }
  }

  // 2) Pemilik (login) — wajib & hanya proyek miliknya.
  const user = await requireUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/invite/${projectId}`)}`);
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, title, slug')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (!project) notFound();

  const { data: design } = await supabase
    .from('project_designs')
    .select('canvas_data')
    .eq('project_id', projectId)
    .maybeSingle();

  const canvas = design?.canvas_data as { settings?: { religion?: string } } | undefined;
  const religion = canvas?.settings?.religion;

  // Siapkan token akses agar link "Kelola Tamu" bisa dibagikan ke pihak lain.
  const { data: tokenRes } = await supabase.rpc('ensure_invite_token', {
    p_project_id: projectId
  });
  const accessToken = Array.isArray(tokenRes) ? tokenRes[0]?.token : undefined;

  return (
    <InviteManager
      projectId={projectId}
      slug={project.slug}
      title={project.title}
      religion={religion}
      accessToken={accessToken}
    />
  );
}