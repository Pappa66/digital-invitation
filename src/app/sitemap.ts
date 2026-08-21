import type { MetadataRoute } from 'next';
import { TEMPLATE_LIST, DEMO_TEMPLATES } from '@/lib/templates';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://undangan-digital.prashadigitalindonesia.com';
  const now = new Date();

  const staticPages = [
    { url: siteUrl, lastModified: now, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${siteUrl}/login`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.3 }
  ];

  const templatePages = DEMO_TEMPLATES.map((t) => ({
    url: `${siteUrl}/templates/${t.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }));

  return [...staticPages, ...templatePages];
}