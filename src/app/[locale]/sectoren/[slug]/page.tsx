/**
 * Dynamic Industry Page
 * SEO-optimized landing pages for each industry in each language
 * Generates 60 pages: 12 industries × 5 locales
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale, type Industry, industries, industryTranslations, hreflangMap } from '@/lib/i18n/config';
import { getIndustryContent, hasIndustryContent } from '@/lib/i18n/industry-content';
import { getTranslation } from '@/lib/i18n/translations';
import IndustryPageTemplate from '@/components/seo/IndustryPageTemplate';

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Generate all combinations of locale + industry slug
export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    for (const industry of industries) {
      const industryInfo = industryTranslations[industry][locale];
      params.push({
        locale,
        slug: industryInfo.slug,
      });
    }
  }

  return params;
}

// Find industry key from slug for any locale
function getIndustryFromSlug(slug: string, locale: Locale): Industry | null {
  for (const industry of industries) {
    if (industryTranslations[industry][locale].slug === slug) {
      return industry;
    }
  }
  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;

  if (!locales.includes(locale as Locale)) {
    return {};
  }

  const industry = getIndustryFromSlug(slug, locale as Locale);
  if (!industry) {
    return {};
  }

  const BASE_URL = 'https://adspersoneel.app';
  const t = getTranslation(locale as Locale);
  const industryInfo = industryTranslations[industry][locale as Locale];

  // Get content if available, otherwise use fallback
  let title = `${industryInfo.name} - ${t.meta.siteName}`;
  let description = `${t.meta.defaultDescription} ${industryInfo.name}`;

  if (hasIndustryContent(industry, locale as Locale)) {
    const content = getIndustryContent(industry, locale as Locale);
    title = `${content.heroTitle} | ${t.meta.siteName}`;
    description = content.heroSubtitle;
  }

  // Generate alternates for all locales
  const languages: Record<string, string> = {};
  locales.forEach((loc) => {
    const locIndustryInfo = industryTranslations[industry][loc];
    languages[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren/${locIndustryInfo.slug}`;
  });
  languages['x-default'] = languages['nl-NL'];

  return {
    title,
    description,
    keywords: [
      industryInfo.name.toLowerCase(),
      `urenregistratie ${industryInfo.name.toLowerCase()}`,
      `hr software ${industryInfo.name.toLowerCase()}`,
      `personeelsbeheer ${industryInfo.name.toLowerCase()}`,
      'kostenbesparing',
      'efficient werken',
    ].join(', '),
    alternates: {
      canonical: `${BASE_URL}/${locale}/sectoren/${slug}`,
      languages,
    },
    openGraph: {
      type: 'website',
      locale: hreflangMap[locale as Locale],
      url: `${BASE_URL}/${locale}/sectoren/${slug}`,
      siteName: t.meta.siteName,
      title,
      description,
      images: [
        {
          url: `${BASE_URL}/og/industry-${industry}.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/og/industry-${industry}.png`],
    },
    robots: {
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
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { locale, slug } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Find industry from slug
  const industry = getIndustryFromSlug(slug, locale as Locale);
  if (!industry) {
    notFound();
  }

  return (
    <IndustryPageTemplate
      locale={locale as Locale}
      industry={industry}
    />
  );
}
