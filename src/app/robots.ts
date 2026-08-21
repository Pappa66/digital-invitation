import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://undangan-digital.prashadigitalindonesia.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/builder/', '/dashboard', '/orders', '/settings', '/invite/', '/login', '/api/']
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}