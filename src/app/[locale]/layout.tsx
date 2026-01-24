/**
 * Locale Layout
 * Wrapper for all localized pages with language-specific metadata
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { locales, type Locale, hreflangMap } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    return {};
  }

  const t = getTranslation(locale as Locale);
  const BASE_URL = 'https://adspersoneel.app';

  // Generate alternates for all locales
  const languages: Record<string, string> = {};
  locales.forEach((loc) => {
    languages[hreflangMap[loc]] = `${BASE_URL}/${loc}`;
  });
  languages['x-default'] = `${BASE_URL}/nl`;

  return {
    title: {
      default: t.meta.defaultTitle,
      template: `%s | ${t.meta.siteName}`,
    },
    description: t.meta.defaultDescription,
    keywords: t.meta.keywords.join(', '),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages,
    },
    openGraph: {
      locale: hreflangMap[locale as Locale],
      alternateLocale: locales.filter(l => l !== locale).map(l => hreflangMap[l]),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  return (
    <div lang={locale} data-locale={locale}>
      {children}
    </div>
  );
}
