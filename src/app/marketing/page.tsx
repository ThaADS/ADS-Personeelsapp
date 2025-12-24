'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// Stats configuration
const stats = [
  { id: 1, name: 'Actieve gebruikers', value: '2,500+', suffix: '' },
  { id: 2, name: 'Uren bespaard per maand', value: '15,000', suffix: '+' },
  { id: 3, name: 'Bedrijven vertrouwen ons', value: '150', suffix: '+' },
  { id: 4, name: 'Uptime garantie', value: '99.9', suffix: '%' },
];

// Feature cards with icons
const features = [
  {
    title: "Tijdregistratie",
    desc: "GPS-verificatie, pauze tracking en slimme validatie voor nauwkeurige urenregistratie.",
    icon: ClockIcon,
    color: "blue"
  },
  {
    title: "Verlof & TVT",
    desc: "Realtime saldo inzicht, automatische berekeningen en snelle goedkeuringsflows.",
    icon: CalendarIcon,
    color: "green"
  },
  {
    title: "Medewerkers",
    desc: "Volledig RBAC systeem met fijnmazige rechten en multi-tenant ondersteuning.",
    icon: UserGroupIcon,
    color: "purple"
  },
  {
    title: "Goedkeuringen",
    desc: "Ticket-systeem stijl met bulk acties, filters en volledige audit trail.",
    icon: CheckCircleIcon,
    color: "orange"
  },
  {
    title: "Rapportages",
    desc: "KPI dashboards, exportmogelijkheden (CSV/XLSX/PDF) en real-time inzichten.",
    icon: ChartBarIcon,
    color: "pink"
  },
  {
    title: "AVG Compliant",
    desc: "Volledige GDPR compliance, dataminimalisatie en uitgebreide audit logging.",
    icon: ShieldCheckIcon,
    color: "indigo"
  },
];

// Testimonials
const testimonials = [
  {
    content: "Sinds we de CKW Personeelsapp gebruiken, zijn we 30% sneller met uren verwerken. De goedkeuringsflow is super intuïtief!",
    author: "Marieke van der Berg",
    role: "HR Manager",
    company: "TechStart BV",
    rating: 5
  },
  {
    content: "Perfect voor ons bouw bedrijf. GPS tracking zorgt ervoor dat we exact weten waar onze monteurs zijn en werken.",
    author: "Jan Bakker",
    role: "Operations Director",
    company: "Bouwgroep Nederland",
    rating: 5
  },
  {
    content: "De multi-tenant functionaliteit is fantastisch. We beheren 5 vestigingen vanuit één centraal systeem. Top!",
    author: "Sophie Janssen",
    role: "Finance Controller",
    company: "Retail Solutions",
    rating: 5
  },
];

// Animated counter component
function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count.toLocaleString('nl-NL')}{suffix}</span>;
}

export default function MarketingHome() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="overflow-hidden">
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8 z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold">
                <BoltIcon className="h-4 w-4 text-yellow-300" />
                <span>Nieuw: Automatische GPS-verificatie</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Personeelsbeheer
                <span className="block text-blue-200 mt-2">zonder gedoe</span>
              </h1>

              <p className="text-xl text-blue-100 max-w-2xl">
                Tijdregistratie, verlof, ziekmeldingen en goedkeuringen in één strak systeem.
                Gebouwd voor Nederlandse bedrijven met focus op AVG compliance en efficiëntie.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transform hover:scale-105 transition-all shadow-xl hover:shadow-2xl"
                >
                  <span>Start gratis trial</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/marketing/features"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-700/50 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-blue-700 border-2 border-white/20 transform hover:scale-105 transition-all"
                >
                  Bekijk alle functies
                </Link>
              </div>

              <p className="text-sm text-blue-200">
                ✓ 30 dagen gratis proberen &nbsp;•&nbsp; ✓ Geen creditcard nodig &nbsp;•&nbsp; ✓ Direct aan de slag
              </p>
            </div>

            {/* Right content - App Preview */}
            <div className="relative lg:h-[500px] z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl p-6 overflow-hidden">
                {/* Mockup dashboard */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-white/20 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 bg-white/20 rounded-full"></div>
                      <div className="h-8 w-8 bg-white/20 rounded-full"></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 space-y-2 hover:bg-white/20 transition-colors">
                        <div className="h-4 w-16 bg-white/30 rounded"></div>
                        <div className="h-8 w-full bg-white/40 rounded"></div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center gap-4 hover:bg-white/20 transition-colors">
                        <div className="h-10 w-10 bg-white/30 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-3/4 bg-white/30 rounded"></div>
                          <div className="h-2 w-1/2 bg-white/20 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating icons animation */}
                <div className="absolute top-10 right-10 animate-bounce">
                  <ClockIcon className="h-12 w-12 text-white/40" />
                </div>
                <div className="absolute bottom-20 left-10 animate-bounce animation-delay-1000">
                  <CalendarIcon className="h-10 w-10 text-white/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.id} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600">
                  <AnimatedCounter end={parseFloat(stat.value.replace(/[^0-9.]/g, ''))} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm text-gray-600 font-semibold">{stat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Alles wat je nodig hebt
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Van tijdregistratie tot rapportages - alle tools om jouw personeelsprocessen te stroomlijnen
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 bg-${feature.color}-100 rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-7 w-7 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>

                  {/* Hover effect border */}
                  <div className={`absolute inset-0 rounded-xl border-2 border-${feature.color}-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/marketing/features"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 group"
            >
              <span>Bekijk alle functies</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Wat onze klanten zeggen
            </h2>
            <p className="text-xl text-gray-600">
              Sluit je aan bij honderden tevreden bedrijven
            </p>
          </div>

          <div className="relative">
            {/* Testimonial Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12 shadow-xl">
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                  </svg>
                ))}
              </div>

              <blockquote className="text-xl lg:text-2xl text-gray-900 font-medium mb-8 leading-relaxed">
                &ldquo;{testimonials[activeTestimonial].content}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[activeTestimonial].author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].author}</div>
                  <div className="text-sm text-gray-600">{testimonials[activeTestimonial].role} • {testimonials[activeTestimonial].company}</div>
                </div>
              </div>
            </div>

            {/* Dots indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-3 w-3 rounded-full transition-all ${
                    index === activeTestimonial ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="bg-gray-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <CpuChipIcon className="h-8 w-8 text-blue-400" />
              <h2 className="text-2xl lg:text-3xl font-bold">
                Gebouwd met moderne technologie
              </h2>
            </div>
            <p className="text-gray-400">
              Enterprise-grade stack voor betrouwbaarheid, veiligheid en schaalbaarheid
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-75">
            {['Next.js', 'PostgreSQL', 'TypeScript', 'Prisma'].map((tech) => (
              <div key={tech} className="text-center">
                <div className="text-xl font-semibold text-gray-300">{tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Start vandaag nog met je gratis trial. Geen creditcard nodig, binnen 5 minuten operationeel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transform hover:scale-105 transition-all shadow-xl text-lg"
            >
              <span>Start gratis trial</span>
              <BoltIcon className="h-6 w-6" />
            </Link>
            <Link
              href="/marketing/pricing"
              className="inline-flex items-center justify-center px-10 py-5 bg-blue-700/50 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-blue-700 border-2 border-white/20 text-lg"
            >
              Bekijk prijzen
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-10 border-t border-white/20">
            <div className="text-center">
              <GlobeAltIcon className="h-8 w-8 mx-auto mb-2 text-blue-300" />
              <div className="text-sm text-blue-200">24/7 Support</div>
            </div>
            <div className="text-center">
              <ShieldCheckIcon className="h-8 w-8 mx-auto mb-2 text-blue-300" />
              <div className="text-sm text-blue-200">AVG Compliant</div>
            </div>
            <div className="text-center">
              <CheckCircleIcon className="h-8 w-8 mx-auto mb-2 text-blue-300" />
              <div className="text-sm text-blue-200">99.9% Uptime</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
