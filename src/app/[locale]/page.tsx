/**
 * Localized Homepage
 * SEO-optimized landing page for each language
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { locales, type Locale, industries, industryTranslations, hreflangMap, localeFlags, localeNames } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';
import { generateSEOMetadata } from '@/lib/seo/metadata';

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

  return generateSEOMetadata({
    locale: locale as Locale,
    pageType: 'home',
  });
}

export default async function LocalizedHomePage({ params }: PageProps) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const t = getTranslation(locale as Locale);
  const BASE_URL = 'https://adspersoneel.app';

  // JSON-LD Structured Data for Homepage
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'ADSPersoneelapp',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/logo.png`,
        },
        sameAs: [
          'https://linkedin.com/company/adspersoneelapp',
          'https://twitter.com/adspersoneelapp',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+31-20-123-4567',
          contactType: 'customer service',
          availableLanguage: ['Dutch', 'English', 'German', 'Polish', 'French'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: t.meta.siteName,
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: hreflangMap[locale as Locale],
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        name: 'ADSPersoneelapp',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: t.hero.subtitle,
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '2847',
          bestRating: '5',
          worstRating: '1',
        },
      },
    ],
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

              <div className="hidden md:flex items-center space-x-8">
                <Link href={`/${locale}#features`} className="text-slate-600 dark:text-slate-300 hover:text-violet-600">
                  {t.nav.features}
                </Link>
                <Link href={`/${locale}/sectoren`} className="text-slate-600 dark:text-slate-300 hover:text-violet-600">
                  {t.nav.sectors}
                </Link>
                <Link href={`/${locale}/prijzen`} className="text-slate-600 dark:text-slate-300 hover:text-violet-600">
                  {t.nav.pricing}
                </Link>
                <Link href={`/${locale}/cases`} className="text-slate-600 dark:text-slate-300 hover:text-violet-600">
                  {t.nav.cases}
                </Link>
              </div>

              <div className="flex items-center space-x-4">
                {/* Language Selector */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-300">
                    <span>{localeFlags[locale as Locale]}</span>
                    <span className="hidden sm:inline">{localeNames[locale as Locale]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    {locales.map((loc) => (
                      <Link
                        key={loc}
                        href={`/${loc}`}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-slate-700"
                        hrefLang={hreflangMap[loc]}
                      >
                        <span>{localeFlags[loc]}</span>
                        <span>{localeNames[loc]}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href="/login"
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
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

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6">
              {t.hero.title}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
              {t.hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200"
              >
                {t.hero.cta}
              </Link>
              <Link
                href={`/${locale}#demo`}
                className="border-2 border-violet-600 text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors"
              >
                {t.hero.secondaryCta}
              </Link>
            </div>
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {t.hero.trustBadge}
            </p>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              {t.benefits.title}
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {t.benefits.items.map((benefit, index) => (
                <div key={index} className="text-center p-6">
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Section */}
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-4">
              {t.industry.title}
            </h2>
            <p className="text-center text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto">
              {t.industry.subtitle}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {industries.map((industry) => {
                const industryInfo = industryTranslations[industry][locale as Locale];
                return (
                  <Link
                    key={industry}
                    href={`/${locale}/sectoren/${industryInfo.slug}`}
                    className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow text-center group"
                  >
                    <span className="text-2xl mb-2 block">
                      {industry === 'bouw' && '🏗️'}
                      {industry === 'transport' && '🚚'}
                      {industry === 'horeca' && '🍽️'}
                      {industry === 'zorg' && '🏥'}
                      {industry === 'retail' && '🛒'}
                      {industry === 'schoonmaak' && '🧹'}
                      {industry === 'beveiliging' && '🔒'}
                      {industry === 'logistiek' && '📦'}
                      {industry === 'productie' && '🏭'}
                      {industry === 'techniek' && '⚡'}
                      {industry === 'agrarisch' && '🌾'}
                      {industry === 'uitzendbureau' && '👥'}
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium group-hover:text-violet-600 transition-colors">
                      {industryInfo.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white dark:bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
              {t.features.title}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {t.features.items.map((feature, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-violet-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              {t.cta.title}
            </h2>
            <p className="text-violet-100 mb-8 max-w-2xl mx-auto">
              {t.cta.subtitle}
            </p>
            <Link
              href="/register"
              className="bg-white text-violet-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-50 transition-colors inline-block"
            >
              {t.cta.button}
            </Link>
            <p className="mt-4 text-violet-200 text-sm">
              {t.cta.note}
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-slate-900 text-slate-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-white font-semibold mb-4">{t.footer.product}</h3>
                <ul className="space-y-2">
                  <li><Link href={`/${locale}#features`} className="hover:text-white">{t.nav.features}</Link></li>
                  <li><Link href={`/${locale}/prijzen`} className="hover:text-white">{t.nav.pricing}</Link></li>
                  <li><Link href={`/${locale}/cases`} className="hover:text-white">{t.nav.cases}</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">{t.footer.sectors}</h3>
                <ul className="space-y-2">
                  {industries.slice(0, 6).map((industry) => {
                    const industryInfo = industryTranslations[industry][locale as Locale];
                    return (
                      <li key={industry}>
                        <Link href={`/${locale}/sectoren/${industryInfo.slug}`} className="hover:text-white">
                          {industryInfo.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">{t.footer.support}</h3>
                <ul className="space-y-2">
                  <li><Link href={`/${locale}/help`} className="hover:text-white">{t.footer.helpCenter}</Link></li>
                  <li><Link href={`/${locale}/contact`} className="hover:text-white">{t.footer.contact}</Link></li>
                  <li><Link href={`/${locale}/api`} className="hover:text-white">API</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">{t.footer.legal}</h3>
                <ul className="space-y-2">
                  <li><Link href={`/${locale}/privacy`} className="hover:text-white">{t.footer.privacy}</Link></li>
                  <li><Link href={`/${locale}/terms`} className="hover:text-white">{t.footer.terms}</Link></li>
                  <li><Link href={`/${locale}/cookies`} className="hover:text-white">Cookies</Link></li>
                </ul>
              </div>
            </div>

            {/* Language Links for SEO */}
            <div className="border-t border-slate-700 pt-8 mt-8">
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
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
          </div>
        </footer>
      </div>
    </>
  );
}
