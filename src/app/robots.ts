/**
 * Robots.txt Generation
 * Controls search engine crawling behavior
 */

import type { MetadataRoute } from 'next';

const BASE_URL = 'https://adspersoneel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
          '/checkout/',
          '/login',
          '/register',
          '/reset-password',
          '/forgot-password',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/dashboard/',
        ],
      },
    ],
    sitemap: [
      `${BASE_URL}/sitemap.xml`,
    ],
    host: BASE_URL,
  };
}
