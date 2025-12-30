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
  LinkIcon
} from '@heroicons/react/24/outline';

export default function MarketingHomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

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
      quote: "ADS Personeelsapp heeft onze HR-processen gestroomlijnd. We besparen wekelijks uren aan administratie.",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
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

                <button className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-white/10 rounded-xl border-2 border-white/20 hover:border-violet-300 hover:bg-white/20 transition-all backdrop-blur-sm">
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
      <section className="py-24">
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
      <section className="py-24 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
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
              href="/marketing/pricing"
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
    </div>
  );
}
