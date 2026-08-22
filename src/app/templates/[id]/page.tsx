import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DEMO_TEMPLATES, getTemplate } from '@/lib/templates';
import { categoryLabel } from '@/lib/template-categories';
import TemplateDetail from '@/components/landing/template-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://undangan-digital.prashadigitalindonesia.com';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const meta = DEMO_TEMPLATES.find((t) => t.id === id);
  if (!meta) return {};

  const title = `Template ${meta.name} — Undangan Digital`;
  const description = `Pratinjau template undangan digital ${meta.name}. ${categoryLabel(meta.category)}. Desain elegan, siap pesan.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/templates/${id}`,
      siteName: 'Prasha Digital',
      type: 'website',
      locale: 'id_ID'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description
    },
    alternates: {
      canonical: `${SITE_URL}/templates/${id}`
    }
  };
}

export default async function TemplatePreviewPage({ params }: PageProps) {
  const { id } = await params;
  const canvas = getTemplate(id);
  if (!canvas) notFound();

  const isDemo = DEMO_TEMPLATES.some((t) => t.id === id);
  if (!isDemo) notFound();

  const index = DEMO_TEMPLATES.findIndex((t) => t.id === id);
  const meta = DEMO_TEMPLATES[index];
  const total = DEMO_TEMPLATES.length;

  const prev = index > 0 ? DEMO_TEMPLATES[index - 1] : null;
  const next = index < total - 1 ? DEMO_TEMPLATES[index + 1] : null;

  return (
    <TemplateDetail
      meta={meta}
      index={index}
      canvas={canvas}
      categoryLabel={categoryLabel(meta?.category)}
      total={total}
      prev={prev ? { id: prev.id, name: prev.name } : null}
      next={next ? { id: next.id, name: next.name } : null}
    />
  );
}
