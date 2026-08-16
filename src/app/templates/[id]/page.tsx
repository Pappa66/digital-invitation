import { notFound } from 'next/navigation';
import { DEMO_TEMPLATES, getTemplate } from '@/lib/templates';
import { categoryLabel } from '@/lib/template-categories';
import TemplateDetail from '@/components/landing/template-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

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