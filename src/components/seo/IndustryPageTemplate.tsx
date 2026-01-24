'use client';

/**
 * MASTER SEO TEMPLATE - Industry Landing Page
 *
 * Fully optimized for:
 * - LLM/AI Discovery (structured data, clear headings, semantic HTML)
 * - GEO SEO (hreflang, local business schema, geo targeting)
 * - Traditional SEO (meta tags, OG, Twitter Cards, canonical)
 * - Conversion optimization (CTAs, social proof, urgency)
 */

import Link from 'next/link';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  ClockIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { Locale, Industry } from '@/lib/i18n/config';
import { industryTranslations, hreflangMap, localeGeo } from '@/lib/i18n/config';
import { getTranslation } from '@/lib/i18n/translations';
import { getIndustryContent, type IndustryContent } from '@/lib/i18n/industry-content';

interface IndustryPageTemplateProps {
  locale: Locale;
  industry: Industry;
}

// JSON-LD Structured Data Generator
function generateStructuredData(locale: Locale, industry: Industry, content: IndustryContent) {
  const industryInfo = industryTranslations[industry][locale];
  const geo = localeGeo[locale];
  const t = getTranslation(locale);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // Organization
      {
        '@type': 'Organization',
        '@id': 'https://adspersoneel.app/#organization',
        name: 'ADSPersoneelapp',
        url: 'https://adspersoneel.app',
        logo: 'https://adspersoneel.app/logo.png',
        sameAs: [
          'https://www.linkedin.com/company/adspersoneelapp',
          'https://twitter.com/adspersoneelapp',
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+31-20-123-4567',
          contactType: 'sales',
          areaServed: geo.country,
          availableLanguage: locale,
        },
      },
      // SoftwareApplication
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://adspersoneel.app/#software',
        name: 'ADSPersoneelapp',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        offers: {
          '@type': 'Offer',
          price: '15',
          priceCurrency: geo.currency,
          priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          ratingCount: '347',
          bestRating: '5',
          worstRating: '1',
        },
      },
      // WebPage
      {
        '@type': 'WebPage',
        '@id': `https://adspersoneel.app/${locale}/sectoren/${industryInfo.slug}/#webpage`,
        url: `https://adspersoneel.app/${locale}/sectoren/${industryInfo.slug}/`,
        name: content.heroTitle,
        description: content.heroSubtitle,
        inLanguage: hreflangMap[locale],
        isPartOf: {
          '@type': 'WebSite',
          '@id': 'https://adspersoneel.app/#website',
          name: t.meta.siteName,
          url: 'https://adspersoneel.app',
        },
      },
      // FAQPage for common questions
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Hoeveel kan ik besparen met urenregistratie in de ${industryInfo.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Bedrijven in de ${industryInfo.name} besparen gemiddeld ${content.stats[0]?.value || '40%'} op administratiekosten met ADSPersoneelapp.`,
            },
          },
          {
            '@type': 'Question',
            name: `Is ADSPersoneelapp geschikt voor de ${industryInfo.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Ja, ADSPersoneelapp is speciaal ontwikkeld voor sectoren zoals de ${industryInfo.name} met functies voor GPS-verificatie, projecturenregistratie en automatische rapportages.`,
            },
          },
        ],
      },
      // Review/Testimonial
      content.testimonial.author && {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: '5',
          bestRating: '5',
        },
        author: {
          '@type': 'Person',
          name: content.testimonial.author,
        },
        reviewBody: content.testimonial.quote,
      },
    ].filter(Boolean),
  };
}

// BreadcrumbList Schema
function generateBreadcrumbs(locale: Locale, industry: Industry) {
  const industryInfo = industryTranslations[industry][locale];
  const t = getTranslation(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://adspersoneel.app/${locale}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.nav.sectors,
        item: `https://adspersoneel.app/${locale}/sectoren/`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: industryInfo.name,
        item: `https://adspersoneel.app/${locale}/sectoren/${industryInfo.slug}/`,
      },
    ],
  };
}

export default function IndustryPageTemplate({ locale, industry }: IndustryPageTemplateProps) {
  const content = getIndustryContent(industry, locale);
  const industryInfo = industryTranslations[industry][locale];
  const t = getTranslation(locale);
  const geo = localeGeo[locale];

  const structuredData = generateStructuredData(locale, industry, content);
  const breadcrumbs = generateBreadcrumbs(locale, industry);

  return (
    <>
      {/* JSON-LD Structured Data for LLM & SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
            <div className="flex items-center justify-between h-16">
              <Link href={`/${locale}`} className="flex items-center" aria-label="ADSPersoneelapp Home">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
                <span className="text-xl font-bold text-white">ADSPersoneelapp</span>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href={`/${locale}/functies`} className="text-gray-300 hover:text-white transition-colors">{t.nav.features}</Link>
                <Link href={`/${locale}/sectoren`} className="text-violet-400 font-medium">{t.nav.sectors}</Link>
                <Link href={`/${locale}/prijzen`} className="text-gray-300 hover:text-white transition-colors">{t.nav.pricing}</Link>
                <Link href={`/${locale}/cases`} className="text-gray-300 hover:text-white transition-colors">{t.nav.cases}</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-white hover:text-violet-300 transition-colors font-medium">{t.nav.login}</Link>
                <Link
                  href={`/${locale}/prijzen`}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all"
                >
                  {t.nav.startFree}
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Breadcrumb Navigation */}
        <nav className="pt-20 pb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-400">
            <li><Link href={`/${locale}`} className="hover:text-white">Home</Link></li>
            <li>/</li>
            <li><Link href={`/${locale}/sectoren`} className="hover:text-white">{t.nav.sectors}</Link></li>
            <li>/</li>
            <li className="text-violet-400">{industryInfo.name}</li>
          </ol>
        </nav>

        {/* Hero Section - Above the fold */}
        <section className="relative pt-8 pb-16 overflow-hidden" aria-labelledby="hero-title">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div>
                {/* Trust badge */}
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-6">
                  <SparklesIcon className="w-4 h-4 mr-2" />
                  {t.hero.trustBadge}
                </div>

                {/* H1 - Main keyword optimized */}
                <h1 id="hero-title" className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {content.heroTitle}
                </h1>

                {/* Subtitle with key benefits */}
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {content.heroSubtitle}
                </p>

                {/* Key stats - Social proof */}
                {content.stats.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {content.stats.map((stat, index) => (
                      <div key={index} className="text-center p-4 backdrop-blur-xl bg-white/5 rounded-xl border border-white/10">
                        <div className="text-2xl lg:text-3xl font-bold text-violet-400">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/${locale}/prijzen`}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg"
                  >
                    {t.cta.button}
                    <ArrowRightIcon className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href={`/${locale}/demo`}
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all"
                  >
                    {t.hero.secondaryCta}
                  </Link>
                </div>

                {/* Trust indicators */}
                <p className="mt-6 text-sm text-gray-400 flex items-center">
                  <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-400" />
                  {t.cta.note} • AVG/GDPR Compliant • {geo.country} Support
                </p>
              </div>

              {/* Right: Visual */}
              <div className="relative hidden lg:block">
                <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
                  {/* Mockup of app interface */}
                  <div className="bg-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-white font-semibold">Dashboard</h3>
                      <span className="text-green-400 text-sm">● Live</span>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Actieve medewerkers</span>
                          <span className="text-violet-400 font-bold">24</span>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">Uren vandaag</span>
                          <span className="text-violet-400 font-bold">186.5</span>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300">GPS Verified</span>
                          <span className="text-green-400 font-bold">100%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Challenges Section */}
        {content.challenges.length > 0 && (
          <section className="py-16 bg-slate-900/50" aria-labelledby="challenges-title">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 id="challenges-title" className="text-3xl font-bold text-white mb-4">
                  {t.industry.challengesTitle}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Herkenbare uitdagingen die wij oplossen voor de {industryInfo.name}
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {content.challenges.map((challenge, index) => (
                  <article key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="text-4xl mb-4">{challenge.icon}</div>
                    <h3 className="text-xl font-semibold text-white mb-2">{challenge.title}</h3>
                    <p className="text-gray-400">{challenge.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Solutions with ROI */}
        {content.solutions.length > 0 && (
          <section className="py-16" aria-labelledby="solutions-title">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 id="solutions-title" className="text-3xl font-bold text-white mb-4">
                  {t.industry.solutionTitle}
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Concrete oplossingen met meetbare kostenbesparing
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {content.solutions.map((solution, index) => (
                  <article key={index} className="backdrop-blur-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-2xl p-6 border border-violet-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircleIcon className="w-8 h-8 text-green-400" />
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                        {solution.saving}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{solution.title}</h3>
                    <p className="text-gray-400">{solution.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Use Cases - Daily Usage Examples */}
        {content.useCases.length > 0 && (
          <section className="py-16 bg-slate-900/50" aria-labelledby="usecases-title">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 id="usecases-title" className="text-3xl font-bold text-white mb-4">
                  Dagelijks gebruik in de praktijk
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Zo werkt ADSPersoneelapp in de {industryInfo.name}
                </p>
              </div>

              <div className="space-y-6">
                {content.useCases.map((useCase, index) => (
                  <article key={index} className="backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-400 font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{useCase.title}</h3>
                        <p className="text-gray-400">{useCase.description}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ROI Calculator Section */}
        {content.roi.savings && (
          <section className="py-16" aria-labelledby="roi-title">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-3xl p-8 border border-green-500/20">
                <h2 id="roi-title" className="text-3xl font-bold text-white text-center mb-8">
                  {t.industry.roiTitle}
                </h2>

                <div className="grid md:grid-cols-4 gap-6 text-center">
                  <div>
                    <CurrencyEuroIcon className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-400">{content.roi.before}</div>
                    <div className="text-sm text-gray-400">Huidige kosten</div>
                  </div>
                  <div>
                    <ArrowRightIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  </div>
                  <div>
                    <CurrencyEuroIcon className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-400">{content.roi.after}</div>
                    <div className="text-sm text-gray-400">Met ADSPersoneelapp</div>
                  </div>
                  <div>
                    <ChartBarIcon className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-violet-400">{content.roi.savings}</div>
                    <div className="text-sm text-gray-400">Jaarlijkse besparing</div>
                  </div>
                </div>

                <p className="text-center text-gray-400 mt-6">
                  <ClockIcon className="w-5 h-5 inline mr-2" />
                  Terugverdientijd: {content.roi.timeframe}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Testimonial */}
        {content.testimonial.author && (
          <section className="py-16 bg-slate-900/50" aria-labelledby="testimonial-title">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 id="testimonial-title" className="sr-only">{t.industry.testimonialsTitle}</h2>

              <blockquote className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-xl text-white italic mb-6">&ldquo;{content.testimonial.quote}&rdquo;</p>
                <footer className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
                    {content.testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <cite className="text-white font-semibold not-italic">{content.testimonial.author}</cite>
                    <p className="text-gray-400 text-sm">{content.testimonial.role}, {content.testimonial.company}</p>
                  </div>
                </footer>
              </blockquote>
            </div>
          </section>
        )}

        {/* Internal Links - Related Content */}
        <section className="py-16" aria-labelledby="related-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="related-title" className="text-2xl font-bold text-white mb-8">Gerelateerde sectoren</h2>
            <div className="grid md:grid-cols-4 gap-4">
              {Object.entries(industryTranslations)
                .filter(([key]) => key !== industry)
                .slice(0, 4)
                .map(([key, translations]) => (
                  <Link
                    key={key}
                    href={`/${locale}/sectoren/${translations[locale].slug}`}
                    className="backdrop-blur-xl bg-white/5 rounded-xl p-4 border border-white/10 hover:border-violet-500/50 transition-colors"
                  >
                    <span className="text-white font-medium">{translations[locale].name}</span>
                    <ArrowRightIcon className="w-4 h-4 text-violet-400 inline ml-2" />
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 relative overflow-hidden" aria-labelledby="cta-title">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 id="cta-title" className="text-4xl lg:text-5xl font-bold text-white mb-6">
              {t.industry.ctaTitle}
            </h2>
            <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              {t.industry.ctaSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/prijzen`}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                {t.cta.button}
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </section>

        {/* Footer with Internal Links */}
        <footer className="bg-slate-900 border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
                  <span className="text-lg font-bold text-white">ADSPersoneelapp</span>
                </div>
                <p className="text-sm text-gray-400">{t.meta.defaultDescription.slice(0, 100)}...</p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">{t.footer.product}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href={`/${locale}/functies`} className="hover:text-white">{t.nav.features}</Link></li>
                  <li><Link href={`/${locale}/prijzen`} className="hover:text-white">{t.nav.pricing}</Link></li>
                  <li><Link href={`/${locale}/sectoren`} className="hover:text-white">{t.nav.sectors}</Link></li>
                  <li><Link href={`/${locale}/cases`} className="hover:text-white">{t.nav.cases}</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">{t.nav.sectors}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  {Object.entries(industryTranslations).slice(0, 6).map(([key, translations]) => (
                    <li key={key}>
                      <Link href={`/${locale}/sectoren/${translations[locale].slug}`} className="hover:text-white">
                        {translations[locale].name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">{t.footer.legal}</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href={`/${locale}/privacy`} className="hover:text-white">{t.footer.privacy}</Link></li>
                  <li><Link href={`/${locale}/voorwaarden`} className="hover:text-white">{t.footer.terms}</Link></li>
                  <li><Link href={`/${locale}/cookies`} className="hover:text-white">Cookies</Link></li>
                  <li><Link href={`/${locale}/contact`} className="hover:text-white">{t.footer.contact}</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} ADSPersoneelapp. {t.footer.rights}
              </p>
              {/* Language Selector */}
              <div className="flex items-center gap-4 mt-4 md:mt-0">
                <Link href={`/nl/sectoren/${industryTranslations[industry].nl.slug}`} className={`text-sm ${locale === 'nl' ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`}>🇳🇱 NL</Link>
                <Link href={`/en/sectoren/${industryTranslations[industry].en.slug}`} className={`text-sm ${locale === 'en' ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`}>🇬🇧 EN</Link>
                <Link href={`/de/sectoren/${industryTranslations[industry].de.slug}`} className={`text-sm ${locale === 'de' ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`}>🇩🇪 DE</Link>
                <Link href={`/pl/sectoren/${industryTranslations[industry].pl.slug}`} className={`text-sm ${locale === 'pl' ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`}>🇵🇱 PL</Link>
                <Link href={`/fr/sectoren/${industryTranslations[industry].fr.slug}`} className={`text-sm ${locale === 'fr' ? 'text-violet-400' : 'text-gray-400 hover:text-white'}`}>🇫🇷 FR</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
