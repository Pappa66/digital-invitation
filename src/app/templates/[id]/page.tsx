import { notFound } from 'next/navigation';
import { TEMPLATE_LIST, getTemplate } from '@/lib/templates';
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

  const index = TEMPLATE_LIST.findIndex((t) => t.id === id);
  const meta = TEMPLATE_LIST[index];
  const total = TEMPLATE_LIST.length;

  const prev = index > 0 ? TEMPLATE_LIST[index - 1] : null;
  const next = index < total - 1 ? TEMPLATE_LIST[index + 1] : null;

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