/**
 * Sectors Overview Page
 * Lists all industry verticals with links to individual pages
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locales, type Locale, industries, industryTranslations, hreflangMap, localeFlags, localeNames } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    return {};
  }

  const t = getTranslation(locale as Locale);
  const BASE_URL = 'https://adspersoneel.app';

  const languages: Record<string, string> = {};
  locales.forEach((loc) => {
    languages[hreflangMap[loc]] = `${BASE_URL}/${loc}/sectoren`;
  });
  languages['x-default'] = languages['nl-NL'];

  return {
    title: `${t.industry.title} | ${t.meta.siteName}`,
    description: t.industry.subtitle,
    alternates: {
      canonical: `${BASE_URL}/${locale}/sectoren`,
      languages,
    },
  };
}

const industryIcons: Record<string, string> = {
  bouw: '🏗️',
  transport: '🚚',
  horeca: '🍽️',
  zorg: '🏥',
  retail: '🛒',
  schoonmaak: '🧹',
  beveiliging: '🔒',
  logistiek: '📦',
  productie: '🏭',
  techniek: '⚡',
  agrarisch: '🌾',
  uitzendbureau: '👥',
};

export default async function SectorsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const t = getTranslation(locale as Locale);
  const BASE_URL = 'https://adspersoneel.app';

  // JSON-LD for sectors overview
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: t.industry.title,
    description: t.industry.subtitle,
    url: `${BASE_URL}/${locale}/sectoren`,
    inLanguage: hreflangMap[locale as Locale],
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: industries.map((industry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: industryTranslations[industry][locale as Locale].name,
        url: `${BASE_URL}/${locale}/sectoren/${industryTranslations[industry][locale as Locale].slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-slate-900 dark:to-slate-800">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href={`/${locale}`} className="text-2xl font-bold text-violet-600">
                ADSPersoneelapp
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-violet-600 hover:text-violet-700 font-medium">
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
                >
                  {t.nav.startFree}
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-slate-500">
              <li>
                <Link href={`/${locale}`} className="hover:text-violet-600">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li className="text-slate-900 dark:text-white font-medium">
                {t.nav.sectors}
              </li>
            </ol>
          </nav>
        </div>

        {/* Hero */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {t.industry.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              {t.industry.subtitle}
            </p>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((industry) => {
                const industryInfo = industryTranslations[industry][locale as Locale];
                return (
                  <Link
                    key={industry}
                    href={`/${locale}/sectoren/${industryInfo.slug}`}
                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start space-x-4">
                      <span className="text-4xl">{industryIcons[industry]}</span>
                      <div>
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors">
                          {industryInfo.name}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
                          {t.industry.viewSolution} →
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto bg-violet-600 rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t.cta.title}
            </h2>
            <p className="text-violet-100 mb-6 max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
            <Link
              href="/register"
              className="bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-50 transition-colors inline-block"
            >
              {t.cta.button}
            </Link>
          </div>
        </section>

        {/* Footer with Language Links */}
        <footer className="py-8 bg-slate-900 text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {locales.map((loc) => (
                <Link
                  key={loc}
                  href={`/${loc}/sectoren`}
                  hrefLang={hreflangMap[loc]}
                  className="text-sm hover:text-white"
                >
                  {localeFlags[loc]} {localeNames[loc]}
                </Link>
              ))}
            </div>
            <p className="text-center text-sm">
              © {new Date().getFullYear()} ADSPersoneelapp. {t.footer.rights}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
