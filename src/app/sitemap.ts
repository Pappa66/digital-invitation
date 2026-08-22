import type { MetadataRoute } from 'next';
import { DEMO_TEMPLATES } from '@/lib/templates';

const SITE_URL = 'https://undangan-digital.prashadigitalindonesia.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1
    }
  ];

  const templatePages: MetadataRoute.Sitemap = DEMO_TEMPLATES.map((t) => ({
    url: `${SITE_URL}/templates/${t.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }));

  return [...staticPages, ...templatePages];
}
