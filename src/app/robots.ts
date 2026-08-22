import type { MetadataRoute } from 'next';

const SITE_URL = 'https://undangan-digital.prashadigitalindonesia.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/builder/', '/dashboard', '/orders', '/settings', '/login', '/api/', '/edit/']
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
