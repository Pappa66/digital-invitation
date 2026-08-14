import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import GuestView from '@/components/guest/GuestView';
import GuestDemoView from '@/components/guest/GuestDemoView';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  let title = 'Undangan Digital | Prasha Digital';
  const host = (await headers()).get('x-forwarded-host') ?? 'localhost:3000';
  const proto = (await headers()).get('x-forwarded-proto') ?? 'http';
  const origin = `${proto}://${host}`;

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.rpc('get_published_design', { p_slug: slug });
      const row = Array.isArray(data) ? data[0] : null;
      if (row) title = row.title;
    } catch {
      /* generic */
    }
  }

  return {
    metadataBase: new URL(origin),
    title,
    description: `Buka undangan digital ${title}.`,
    openGraph: {
      title,
      description: `Buka undangan digital ${title}.`,
      type: 'website',
      url: `${origin}/${slug}`,
      images: [`/api/og?slug=${encodeURIComponent(slug)}`]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      images: [`/api/og?slug=${encodeURIComponent(slug)}`]
    }
  };
}

export default async function GuestPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const to = typeof search?.to === 'string' ? search.to.slice(0, 100) : undefined;
  const preview = search?.preview === '1';

  // Mode demo: ambil data dari localStorage via komponen client.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    return (
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-gray-400">Memuat...</div>}>
        <GuestDemoView slug={slug} title="Undangan Digital" />
      </Suspense>
    );
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('get_published_design', {
    p_slug: slug
  });

  const row = Array.isArray(data) ? data[0] : null;
  if (error || !row) {
    // Mode preview (?preview=1): hanya pemilik yang bisa melihat draft sebelum dipublish.
    if (preview) {
      const user = await requireUser();
      if (!user) {
        notFound();
      }
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .eq('user_id', user.id)
        .maybeSingle();
      if (!project) notFound();
      const { data: draft } = await supabase
        .from('project_designs')
        .select('canvas_data')
        .eq('project_id', project.id)
        .maybeSingle();
      if (!draft?.canvas_data) notFound();
      return (
        <GuestView
          projectId={project.id}
          canvas={draft.canvas_data as unknown as Record<string, unknown>}
          to={to}
        />
      );
    }
    notFound();
  }

  return (
    <GuestView
      projectId={row.project_id}
      canvas={row.canvas_data as unknown as Record<string, unknown>}
      to={to}
    />
  );
}