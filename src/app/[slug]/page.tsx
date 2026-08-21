import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { createServerSupabase, requireUser } from '@/lib/supabase/server';
import GuestView from '@/components/guest/GuestView';
import GuestDemoView from '@/components/guest/GuestDemoView';
import { demoIsDemoMode } from '@/lib/env';

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

  if (!demoIsDemoMode()) {
    try {
      const supabase = await createServerSupabase();
      const { data } = await supabase.rpc('get_published_design', { p_slug: slug });
      const row = Array.isArray(data) ? data[0] : null;
      if (row) {
        // Tampilkan nama pasangan (Hero bride & groom) bila ada, fallback ke judul desain
        const canvas = row.canvas_data as { blocks?: { type: string; props?: Record<string, unknown> }[] } | null;
        const hero = canvas?.blocks?.find((b) => b.type === 'Hero')?.props as Record<string, unknown> | undefined;
        const couple = [hero?.bride, hero?.groom].filter((v) => typeof v === 'string' && (v as string).trim()).join(' & ');
        title = (couple as string) || row.title;
      }
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
  if (demoIsDemoMode()) {
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
      // Coba cari project via slug (case-insensitive) — fallback bila slug lama masih template
      let project: { id: string } | null = null;
      const { data: bySlug } = await supabase
        .from('projects')
        .select('id')
        .ilike('slug', slug)
        .eq('user_id', user.id)
        .maybeSingle();
      project = bySlug as { id: string } | null;
      // Fallback: bila slug tidak ketemu (mis. slug lama elegant-gold), cari project terbaru user yang masih draft
      if (!project) {
        const { data: fallback } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        // Hanya fallback bila fallback slug mirip template (elegant-gold) — hindari salah project
        if (fallback && slug.toLowerCase().includes('elegant')) {
          project = fallback as { id: string } | null;
        }
      }
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