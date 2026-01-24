/**
 * SEO Metadata Generator
 * Complete optimization for search engines, social sharing, and LLM discovery
 */

import type { Metadata } from 'next';
import type { Locale, Industry } from '@/lib/i18n/config';
import { industryTranslations, hreflangMap, locales, localeGeo } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';
import { getIndustryContent } from '@/lib/i18n/industry-content';

const BASE_URL = 'https://adspersoneel.app';

interface GenerateMetadataParams {
  locale: Locale;
  industry?: Industry;
  pageType: 'home' | 'industry' | 'features' | 'pricing' | 'blog' | 'case';
  customTitle?: string;
  customDescription?: string;
  customKeywords?: string[];
  noIndex?: boolean;
}

export function generateSEOMetadata({
  locale,
  industry,
  pageType,
  customTitle,
  customDescription,
  customKeywords,
  noIndex = false,
}: GenerateMetadataParams): Metadata {
  const t = getTranslation(locale);
  const geo = localeGeo[locale];

  // Base data
  let title = customTitle || t.meta.defaultTitle;
  let description = customDescription || t.meta.defaultDescription;
  let keywords = customKeywords || t.meta.keywords;
  let canonicalPath = `/${locale}`;
  let ogImage = `${BASE_URL}/og/default.png`;

  // Industry-specific overrides
  if (pageType === 'industry' && industry) {
    const content = getIndustryContent(industry, locale);
    const industryInfo = industryTranslations[industry][locale];

    title = `${content.heroTitle} | ADSPersoneelapp`;
    description = content.heroSubtitle;
    canonicalPath = `/${locale}/sectoren/${industryInfo.slug}`;
    ogImage = `${BASE_URL}/og/industry-${industry}.png`;

    // Add industry-specific keywords
    keywords = [
      ...keywords,
      industryInfo.name.toLowerCase(),
      `urenregistratie ${industryInfo.name.toLowerCase()}`,
      `hr software ${industryInfo.name.toLowerCase()}`,
    ];
  }

  // Generate hreflang alternates
  const alternates: Record<string, string> = {};
  locales.forEach((loc) => {
    if (pageType === 'industry' && industry) {
      const industryInfo = industryTranslations[industry][loc];
      alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren/${industryInfo.slug}`;
    } else {
      alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}${canonicalPath.replace(`/${locale}`, '')}`;
    }
  });
  alternates['x-default'] = alternates['nl-NL']; // Dutch as default

  return {
    title,
    description,
    keywords: keywords.join(', '),

    // Canonical & Alternates
    alternates: {
      canonical: `${BASE_URL}${canonicalPath}`,
      languages: alternates,
    },

    // OpenGraph
    openGraph: {
      type: 'website',
      locale: hreflangMap[locale],
      url: `${BASE_URL}${canonicalPath}`,
      siteName: t.meta.siteName,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@adspersoneelapp',
      site: '@adspersoneelapp',
    },

    // Robots
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },

    // Additional meta
    other: {
      // Geo targeting
      'geo.region': geo.country,
      'geo.placename': geo.country === 'NL' ? 'Netherlands' : geo.country,
      'content-language': hreflangMap[locale],

      // Business info
      'business:contact_data:locality': 'Amsterdam',
      'business:contact_data:country_name': 'Netherlands',

      // App links
      'al:ios:app_store_id': '123456789',
      'al:ios:app_name': 'ADSPersoneelapp',
      'al:android:package': 'app.adspersoneel.android',
      'al:android:app_name': 'ADSPersoneelapp',
    },

    // Verification
    verification: {
      google: 'google-site-verification-code',
      yandex: 'yandex-verification-code',
    },

    // App info
    applicationName: t.meta.siteName,
    category: 'business',
    classification: 'HR Software, Time Tracking, Personnel Management',

    // Authors
    authors: [{ name: 'ADSPersoneelapp', url: BASE_URL }],
    creator: 'ADSPersoneelapp',
    publisher: 'ADSPersoneelapp',
  };
}

/**
 * Generate page-specific viewport settings
 */
export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
      { media: '(prefers-color-scheme: light)', color: '#8b5cf6' },
      { media: '(prefers-color-scheme: dark)', color: '#1e1b4b' },
    ],
  };
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(): string {
  return `
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/sitemap-nl.xml
Sitemap: ${BASE_URL}/sitemap-en.xml
Sitemap: ${BASE_URL}/sitemap-de.xml
Sitemap: ${BASE_URL}/sitemap-pl.xml
Sitemap: ${BASE_URL}/sitemap-fr.xml

# Crawl-delay
Crawl-delay: 1

# Disallow
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /dashboard/
`.trim();
}

/**
 * Generate sitemap URLs for all pages
 */
export function generateSitemapUrls(): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: Record<string, string>;
}> {
  const urls: Array<{
    url: string;
    lastModified: Date;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
    alternates?: Record<string, string>;
  }> = [];

  const now = new Date();

  // Home pages per locale
  locales.forEach((locale) => {
    const alternates: Record<string, string> = {};
    locales.forEach((loc) => {
      alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}`;
    });

    urls.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
      alternates,
    });
  });

  // Industry pages per locale
  Object.keys(industryTranslations).forEach((industry) => {
    locales.forEach((locale) => {
      const industryInfo = industryTranslations[industry as Industry][locale];
      const alternates: Record<string, string> = {};
      locales.forEach((loc) => {
        const locIndustryInfo = industryTranslations[industry as Industry][loc];
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren/${locIndustryInfo.slug}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/sectoren/${industryInfo.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates,
      });
    });
  });

  // Static pages per locale
  const staticPages = ['prijzen', 'functies', 'contact', 'cases', 'blog'];
  staticPages.forEach((page) => {
    locales.forEach((locale) => {
      const alternates: Record<string, string> = {};
      locales.forEach((loc) => {
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/${page}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/${page}`,
        lastModified: now,
        changeFrequency: page === 'blog' ? 'daily' : 'monthly',
        priority: page === 'prijzen' ? 0.9 : 0.7,
        alternates,
      });
    });
  });

  return urls;
}

/**
 * Count total SEO pages
 */
export function countSEOPages(): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {
    homepages: locales.length, // 5
    industryPages: Object.keys(industryTranslations).length * locales.length, // 12 * 5 = 60
    staticPages: 5 * locales.length, // 5 * 5 = 25
    // Future additions:
    blogPosts: 20 * locales.length, // 20 * 5 = 100
    caseStudies: 10 * locales.length, // 10 * 5 = 50
  };

  return {
    total: Object.values(breakdown).reduce((a, b) => a + b, 0),
    breakdown,
  };
}
