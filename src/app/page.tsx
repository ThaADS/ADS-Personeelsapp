'use client';

import Link from "next/link";
import { useState } from 'react';
import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  TruckIcon,
  MapPinIcon,
  BoltIcon,
  LinkIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// JSON-LD Structured Data for Homepage
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ADSPersoneelapp',
  url: 'https://adspersoneelsapp.nl',
  description: 'Complete HR software voor Nederlandse bedrijven met urenregistratie, verlofbeheer, ziekmelding en fleet tracking.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://adspersoneelsapp.nl/search?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  },
  publisher: {
    '@type': 'Organization',
    name: 'ADSPersoneelapp B.V.',
    logo: {
      '@type': 'ImageObject',
      url: 'https://adspersoneelsapp.nl/logo.png'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+31-85-123-4567',
      contactType: 'customer service',
      areaServed: 'NL',
      availableLanguage: ['Dutch', 'English']
    },
    sameAs: [
      'https://www.linkedin.com/company/adspersoneelapp',
      'https://twitter.com/adspersoneelapp'
    ]
  }
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ADSPersoneelapp',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'EUR',
    lowPrice: '19',
    highPrice: '79',
    offerCount: '3'
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    'Urenregistratie met GPS-verificatie',
    'Verlof- en TVT-beheer',
    'Ziekmeldingen en Poortwachter',
    'Fleet Tracking Integratie',
    'Multi-tenant architectuur',
    'Realtime dashboards en rapportages'
  ]
};

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      title: "Tijdregistratie",
      desc: "GPS-verificatie en slimme validatie voor nauwkeurige urenregistratie",
      icon: ClockIcon,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      title: "Verlof & TVT",
      desc: "Realtime saldo inzicht met automatische berekeningen",
      icon: CalendarIcon,
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      title: "Teammanagement",
      desc: "Volledig RBAC systeem met multi-tenant ondersteuning",
      icon: UserGroupIcon,
      gradient: "from-violet-500 to-purple-600"
    },
    {
      title: "Goedkeuringen",
      desc: "Efficiënte workflows met volledige audit trail",
      icon: CheckCircleIcon,
      gradient: "from-amber-500 to-orange-600"
    },
    {
      title: "Rapportages",
      desc: "Realtime dashboards met exporteerbare analytics",
      icon: ChartBarIcon,
      gradient: "from-pink-500 to-rose-600"
    },
    {
      title: "Beveiliging",
      desc: "Enterprise-grade security met 2FA en audit logs",
      icon: ShieldCheckIcon,
      gradient: "from-indigo-500 to-blue-600"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "2,500+", label: "Actieve gebruikers" },
    { value: "150+", label: "Bedrijven" },
    { value: "15K+", label: "Uren bespaard/maand" }
  ];

  const testimonials = [
    {
      quote: "ADSPersoneelapp heeft onze HR-processen gestroomlijnd. We besparen wekelijks uren aan administratie.",
      author: "Lisa van den Berg",
      role: "HR Manager",
      company: "TechCorp NL"
    },
    {
      quote: "De GPS-verificatie geeft ons volledige transparantie. Een game-changer voor ons bouwbedrijf.",
      author: "Mark Janssen",
      role: "Operations Director",
      company: "BuildPro"
    },
    {
      quote: "Intuïtief, krachtig en betrouwbaar. Precies wat we zochten voor ons groeiende team.",
      author: "Sophie de Vries",
      role: "CEO",
      company: "StartupHub"
    }
  ];

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
              <span className="text-xl font-bold text-white">ADSPersoneelapp</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
                Functies
              </Link>
              <Link href="/fleet-tracking" className="text-gray-300 hover:text-white transition-colors">
                Fleet Tracking
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                Prijzen
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-violet-300 transition-colors font-medium"
              >
                Inloggen
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all"
              >
                Start Demo
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <div className="flex flex-col space-y-4">
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Functies
                </Link>
                <Link href="/fleet-tracking" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Fleet Tracking
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Prijzen
                </Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Contact
                </Link>
                <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                  <Link
                    href="/login"
                    className="text-white hover:text-violet-300 transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inloggen
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Start Demo
                  </Link>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-32 lg:pt-40 lg:pb-40">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-fuchsia-900/20"></div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            <div className="lg:col-span-7">
              {/* Badge */}
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
                <SparklesIcon className="w-4 h-4 mr-2" />
                Professioneel HR-beheer voor moderne teams
              </div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
                Slimmer werken,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                  beter groeien
                </span>
              </h1>

              <p className="text-xl text-gray-200 mb-10 leading-relaxed max-w-2xl">
                Automatiseer tijdregistratie, verlofbeheer en HR-processen. Krijg real-time inzicht
                en bespaar wekelijks uren aan administratie met onze all-in-one personeelsapp.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Start demo
                  <ArrowRightIcon className="ml-2 w-5 h-5" />
                </Link>

                <button type="button" className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 rounded-xl border-2 border-white/20 hover:border-violet-300 hover:bg-white/20 transition-all backdrop-blur-sm">
                  <PlayCircleIcon className="mr-2 w-6 h-6 text-white" />
                  <span className="text-white">Bekijk demo</span>
                </button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex items-center gap-8 text-sm text-gray-200">
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                  Geen creditcard vereist
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mr-2" />
                  14 dagen gratis
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 mt-12 lg:mt-0">
              {/* Dashboard preview mockup */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 border border-white/20">
                  <div className="space-y-4">
                    <div className="h-12 bg-gradient-to-r from-violet-100 to-fuchsia-100 rounded-lg flex items-center px-4">
                      <div className="w-32 h-4 bg-violet-300 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-cyan-50 rounded-lg p-4">
                        <div className="w-16 h-3 bg-cyan-300 rounded mb-2"></div>
                        <div className="w-20 h-6 bg-cyan-400 rounded"></div>
                      </div>
                      <div className="h-24 bg-emerald-50 rounded-lg p-4">
                        <div className="w-16 h-3 bg-emerald-300 rounded mb-2"></div>
                        <div className="w-20 h-6 bg-emerald-400 rounded"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-violet-600 to-fuchsia-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-violet-100 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Krachtige functies die je helpen om efficiënter te werken en je team beter te managen
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 hover:border-violet-500/50 hover:shadow-2xl transition-all duration-300"
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-sm`}></div>

                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-200 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Tracking Integration Section */}
      <section id="fleet" className="py-24 bg-gradient-to-br from-slate-900/50 to-purple-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-6">
              <TruckIcon className="w-4 h-4 mr-2" />
              Nieuw: Fleet Tracking Integraties
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Automatische Ritregistratie
            </h2>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Koppel uw bestaande fleet tracking systeem en bespaar 2+ uur per week op handmatige registratie.
              Ritten worden automatisch gekoppeld aan tijdregistraties.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">2+ Uur Bespaard</h4>
              <p className="text-sm text-gray-300">Per week aan handmatige invoer</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
                <MapPinIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">GPS Verificatie</h4>
              <p className="text-sm text-gray-300">100% betrouwbare data</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 mb-4">
                <BoltIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Automatisch Matchen</h4>
              <p className="text-sm text-gray-300">Ritten gekoppeld aan uren</p>
            </div>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Fiscaal Compliant</h4>
              <p className="text-sm text-gray-300">Voldoet aan Belastingdienst</p>
            </div>
          </div>

          {/* Provider Logos */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
            <h3 className="text-center text-lg font-medium text-gray-300 mb-8">
              Ondersteunde Fleet Tracking Providers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {/* RouteVision */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">RouteVision</span>
                  <span className="block text-xs text-orange-400">NL</span>
                </div>
              </div>

              {/* FleetGO */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <TruckIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">FleetGO</span>
                  <span className="block text-xs text-orange-400">NL</span>
                </div>
              </div>

              {/* Samsara */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">Samsara</span>
                  <span className="block text-xs text-blue-400">Global</span>
                </div>
              </div>

              {/* Webfleet */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPinIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">Webfleet</span>
                  <span className="block text-xs text-green-400">EU</span>
                </div>
              </div>

              {/* TrackJack */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <MapPinIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">TrackJack</span>
                  <span className="block text-xs text-orange-400">NL</span>
                </div>
              </div>

              {/* Verizon Connect */}
              <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <ChartBarIcon className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <span className="text-white font-semibold text-sm">Verizon</span>
                  <span className="block text-xs text-blue-400">Global</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 text-sm mb-4">
                Gebruikt u een andere provider? Neem contact op voor integratiemogelijkheden.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                <LinkIcon className="w-4 h-4" />
                Bekijk alle integraties
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-purple-900/30 to-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Wat onze klanten zeggen
            </h2>
            <p className="text-xl text-gray-200">
              Sluit je aan bij honderden tevreden bedrijven
            </p>
          </div>

          <div className="relative backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-12 border border-white/20">
            <div className="text-center">
              <div className="text-6xl text-violet-400 mb-6">&ldquo;</div>
              <blockquote className="text-xl text-white mb-8 leading-relaxed">
                {testimonials[activeTestimonial].quote}
              </blockquote>
              <div className="mb-8">
                <div className="font-semibold text-white text-lg">
                  {testimonials[activeTestimonial].author}
                </div>
                <div className="text-gray-300">
                  {testimonials[activeTestimonial].role}, {testimonials[activeTestimonial].company}
                </div>
              </div>

              {/* Testimonial indicators */}
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-slate-900/80 to-purple-900/50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Neem contact op
            </h2>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Heb je vragen of wil je een demo aanvragen? Ons team staat voor je klaar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">E-mail</h3>
              <a href="mailto:info@adspersoneelsapp.nl" className="text-violet-400 hover:text-violet-300 transition-colors">
                info@adspersoneelsapp.nl
              </a>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Telefoon</h3>
              <a href="tel:+31612345678" className="text-violet-400 hover:text-violet-300 transition-colors">
                +31 6 1234 5678
              </a>
            </div>

            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 border border-white/20 text-center">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Locatie</h3>
              <p className="text-gray-300">
                Nederland
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Stuur een bericht
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
            Start vandaag nog met je gratis trial. Geen creditcard vereist,
            opzeggen kan altijd.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start demo
              <ArrowRightIcon className="ml-2 w-5 h-5" />
            </Link>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all"
            >
              Bekijk prijzen
            </Link>
          </div>

          <p className="mt-8 text-violet-100 text-sm">
            14 dagen gratis proberen • Geen creditcard vereist • Opzeggen kan altijd
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
                <span className="text-lg font-bold text-white">ADSPersoneelapp</span>
              </div>
              <p className="text-sm text-gray-400">
                Complete HR-oplossing voor moderne organisaties in Nederland.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/features" className="hover:text-white transition-colors">Functies</Link></li>
                <li><Link href="/fleet-tracking" className="hover:text-white transition-colors">Fleet Tracking</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Prijzen</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Demo aanvragen</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Bedrijf</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
                <li><a href="mailto:info@adspersoneelsapp.nl" className="hover:text-white transition-colors">info@adspersoneelsapp.nl</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Juridisch</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy (AVG)</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Algemene voorwaarden</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookiebeleid</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} ADSPersoneelapp. Alle rechten voorbehouden.
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm text-gray-400">
              <span>Made in the Netherlands</span>
              <span>🇳🇱</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
