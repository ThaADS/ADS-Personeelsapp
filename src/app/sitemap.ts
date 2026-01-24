/**
 * Dynamic Sitemap Generation
 * Generates comprehensive sitemap for all localized pages
 */

import type { MetadataRoute } from 'next';
import { locales, industries, industryTranslations, hreflangMap } from '@/lib/i18n/config';

const BASE_URL = 'https://adspersoneel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  // Root pages
  urls.push({
    url: BASE_URL,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 1.0,
  });

  // Localized home pages (5 pages)
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
      alternates: {
        languages: alternates,
      },
    });
  });

  // Sector overview pages (5 pages)
  locales.forEach((locale) => {
    const alternates: Record<string, string> = {};
    locales.forEach((loc) => {
      alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren`;
    });

    urls.push({
      url: `${BASE_URL}/${locale}/sectoren`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: alternates,
      },
    });
  });

  // Industry pages (60 pages: 12 industries × 5 locales)
  industries.forEach((industry) => {
    locales.forEach((locale) => {
      const industryInfo = industryTranslations[industry][locale];
      const alternates: Record<string, string> = {};

      locales.forEach((loc) => {
        const locIndustryInfo = industryTranslations[industry][loc];
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren/${locIndustryInfo.slug}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/sectoren/${industryInfo.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Static pages per locale (pricing, features, contact, cases, blog)
  const staticPages = [
    { path: 'prijzen', priority: 0.9, changeFreq: 'weekly' as const },
    { path: 'functies', priority: 0.8, changeFreq: 'monthly' as const },
    { path: 'contact', priority: 0.7, changeFreq: 'monthly' as const },
    { path: 'cases', priority: 0.8, changeFreq: 'weekly' as const },
    { path: 'blog', priority: 0.8, changeFreq: 'daily' as const },
    { path: 'over-ons', priority: 0.6, changeFreq: 'monthly' as const },
    { path: 'privacy', priority: 0.3, changeFreq: 'yearly' as const },
    { path: 'voorwaarden', priority: 0.3, changeFreq: 'yearly' as const },
  ];

  staticPages.forEach(({ path, priority, changeFreq }) => {
    locales.forEach((locale) => {
      const alternates: Record<string, string> = {};
      locales.forEach((loc) => {
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/${path}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/${path}`,
        lastModified: now,
        changeFrequency: changeFreq,
        priority,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Case study pages (placeholder for 10 cases × 5 locales = 50 pages)
  const caseStudies = [
    'bouwbedrijf-van-der-berg',
    'transportbedrijf-de-vries',
    'restaurant-de-smaak',
    'zorginstelling-huis-ter-heide',
    'supermarkt-keten-freshmart',
    'schoonmaakbedrijf-blinkend',
    'beveiligingsbedrijf-safeguard',
    'logistiek-centrum-west',
    'productiebedrijf-techno',
    'uitzendbureau-flexwerk',
  ];

  caseStudies.forEach((caseSlug) => {
    locales.forEach((locale) => {
      const alternates: Record<string, string> = {};
      locales.forEach((loc) => {
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/cases/${caseSlug}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/cases/${caseSlug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Blog posts (placeholder for 20 posts × 5 locales = 100 pages)
  const blogPosts = [
    'kostenbesparing-urenregistratie',
    'efficient-werken-tips',
    'digitale-transformatie-hr',
    'automatisering-personeelsbeheer',
    'roi-hr-software',
    'verlofbeheer-best-practices',
    'gps-tracking-voordelen',
    'cao-compliance-tips',
    'remote-werken-urenregistratie',
    'employee-engagement-software',
    'payroll-integratie-voordelen',
    'onboarding-automatiseren',
    'ziekteverzuim-reduceren',
    'planning-optimalisatie',
    'rapportage-inzichten',
    'mobiele-app-voordelen',
    'data-driven-hr',
    'toekomst-personeelsbeheer',
    'compliance-tips-2024',
    'integraties-ecosysteem',
  ];

  blogPosts.forEach((postSlug) => {
    locales.forEach((locale) => {
      const alternates: Record<string, string> = {};
      locales.forEach((loc) => {
        alternates[hreflangMap[loc]] = `${BASE_URL}/${loc}/blog/${postSlug}`;
      });

      urls.push({
        url: `${BASE_URL}/${locale}/blog/${postSlug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // App pages (non-localized)
  const appPages = [
    { path: '/login', priority: 0.5 },
    { path: '/register', priority: 0.7 },
    { path: '/pricing', priority: 0.9 },
    { path: '/features', priority: 0.8 },
    { path: '/contact', priority: 0.7 },
  ];

  appPages.forEach(({ path, priority }) => {
    urls.push({
      url: `${BASE_URL}${path}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority,
    });
  });

  return urls;
}
