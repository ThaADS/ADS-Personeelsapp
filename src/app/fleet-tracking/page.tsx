import { Metadata } from 'next';
import Link from 'next/link';
import {
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  BoltIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  CogIcon,
  CloudArrowUpIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Fleet Tracking Integratie | ADSPersoneelapp - Automatische Ritregistratie',
  description: 'Koppel uw fleet tracking systeem aan ADSPersoneelapp. Ondersteunt RouteVision, FleetGO, Samsara, Webfleet, TrackJack en Verizon Connect. Automatische ritregistratie en kilometerverantwoording.',
  keywords: [
    'fleet tracking integratie',
    'ritregistratie software',
    'RouteVision koppeling',
    'FleetGO integratie',
    'Samsara Nederland',
    'Webfleet koppeling',
    'TrackJack integratie',
    'kilometerregistratie',
    'GPS tracking uren',
    'wagenpark beheer',
    'fiscale ritregistratie',
    'Belastingdienst compliant',
  ],
  openGraph: {
    title: 'Fleet Tracking Integratie | ADSPersoneelapp',
    description: 'Automatische ritregistratie door koppeling met uw fleet tracking systeem. Bespaar 2+ uur per week op handmatige invoer.',
    url: 'https://adspersoneelsapp.nl/fleet-tracking',
    siteName: 'ADSPersoneelapp',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/og-fleet-tracking.png',
        width: 1200,
        height: 630,
        alt: 'ADSPersoneelapp Fleet Tracking Integratie',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Tracking Integratie | ADSPersoneelapp',
    description: 'Automatische ritregistratie met RouteVision, FleetGO, Samsara en meer.',
  },
  alternates: {
    canonical: 'https://adspersoneelsapp.nl/fleet-tracking',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ADSPersoneelapp Fleet Tracking Integratie',
  description: 'Automatische ritregistratie door koppeling met fleet tracking systemen zoals RouteVision, FleetGO, Samsara, Webfleet, TrackJack en Verizon Connect.',
  provider: {
    '@type': 'Organization',
    name: 'ADSPersoneelapp',
    url: 'https://adspersoneelsapp.nl',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Netherlands',
  },
  serviceType: 'Fleet Management Integration',
};

const providers = [
  {
    name: 'RouteVision',
    region: 'NL',
    regionColor: 'text-orange-400',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Nederlandse market leader voor ritregistratie en GPS tracking.',
    features: ['Real-time tracking', 'Rithistorie', 'Kilometerstand', 'Bestuurder-identificatie'],
    status: 'Volledig geïntegreerd',
  },
  {
    name: 'FleetGO',
    region: 'NL',
    regionColor: 'text-orange-400',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Uitgebreide fleet management oplossing voor Nederlandse bedrijven.',
    features: ['Live locaties', 'Rijopdrachten', 'Brandstofverbruik', 'Onderhoudswaarschuwingen'],
    status: 'Volledig geïntegreerd',
  },
  {
    name: 'Samsara',
    region: 'Global',
    regionColor: 'text-blue-400',
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Enterprise-grade IoT platform voor connected operations.',
    features: ['AI-dashcams', 'Asset tracking', 'ELD compliance', 'Temperatuurmonitoring'],
    status: 'API Ready',
  },
  {
    name: 'Webfleet',
    region: 'EU',
    regionColor: 'text-green-400',
    gradient: 'from-red-500 to-orange-500',
    description: 'TomTom Telematics oplossing voor heel Europa.',
    features: ['Navigatie integratie', 'Werk opdrachten', 'Eco driving', 'Tachograaf data'],
    status: 'API Ready',
  },
  {
    name: 'TrackJack',
    region: 'NL',
    regionColor: 'text-orange-400',
    gradient: 'from-amber-500 to-yellow-500',
    description: 'Eenvoudige en betaalbare ritregistratie voor MKB.',
    features: ['Plug & play', 'Fiscale rapportages', 'Geen abonnement', 'OBD-II poort'],
    status: 'API Ready',
  },
  {
    name: 'Verizon Connect',
    region: 'Global',
    regionColor: 'text-blue-400',
    gradient: 'from-rose-500 to-pink-500',
    description: 'Wereldwijde fleet management voor enterprise organisaties.',
    features: ['Reveal platform', 'AI analytics', 'Video telematics', 'Workforce management'],
    status: 'API Ready',
  },
];

const benefits = [
  {
    icon: ClockIcon,
    title: '2+ Uur Bespaard per Week',
    description: 'Geen handmatige invoer meer van ritten en kilometers. Data wordt automatisch gesynchroniseerd.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: MapPinIcon,
    title: '100% GPS Nauwkeurigheid',
    description: 'Exacte locaties, routes en kilometers direct uit uw fleet tracking systeem.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: BoltIcon,
    title: 'Automatisch Matchen',
    description: 'Ritten worden intelligent gekoppeld aan urenregistraties en projecten.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ChartBarIcon,
    title: 'Fiscaal Compliant',
    description: 'Voldoet aan eisen van de Belastingdienst voor kilometerverantwoording.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Verbind uw provider',
    description: 'Koppel uw fleet tracking account in de instellingen. Wij ondersteunen de meeste grote providers.',
  },
  {
    step: 2,
    title: 'Configureer synchronisatie',
    description: 'Bepaal welke voertuigen en chauffeurs gesynchroniseerd worden en hoe vaak.',
  },
  {
    step: 3,
    title: 'Automatische import',
    description: 'Ritten worden dagelijks automatisch geïmporteerd en gekoppeld aan medewerkers.',
  },
  {
    step: 4,
    title: 'Verificatie en goedkeuring',
    description: 'Managers controleren en keuren ritten goed samen met de urenregistraties.',
  },
];

const faqs = [
  {
    question: 'Welke fleet tracking providers worden ondersteund?',
    answer: 'We ondersteunen RouteVision, FleetGO, Samsara, Webfleet, TrackJack en Verizon Connect. Nieuwe integraties worden regelmatig toegevoegd. Neem contact op als uw provider niet in de lijst staat.',
  },
  {
    question: 'Hoe vaak worden ritten gesynchroniseerd?',
    answer: 'Standaard worden ritten elke nacht automatisch gesynchroniseerd. Voor RouteVision en FleetGO is ook real-time synchronisatie mogelijk.',
  },
  {
    question: 'Is de data fiscaal compliant?',
    answer: 'Ja, de geïmporteerde ritdata voldoet aan de eisen van de Belastingdienst voor kilometerverantwoording en ritadministratie.',
  },
  {
    question: 'Kunnen ritten handmatig worden aangepast?',
    answer: 'Ja, geïmporteerde ritten kunnen door medewerkers worden gecontroleerd en indien nodig gecorrigeerd met een notitie.',
  },
  {
    question: 'Wat gebeurt er als een rit niet kan worden gekoppeld?',
    answer: 'Ongekoppelde ritten worden gemarkeerd voor handmatige review. Managers kunnen deze toewijzen aan de juiste medewerker.',
  },
  {
    question: 'Zijn er extra kosten voor de fleet integratie?',
    answer: 'De fleet tracking integratie is inbegrepen in alle Team en Organisatie abonnementen zonder extra kosten.',
  },
];

export default function FleetTrackingPage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
                <span className="text-xl font-bold text-white">ADSPersoneelapp</span>
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/features" className="text-gray-300 hover:text-white transition-colors">Functies</Link>
                <Link href="/fleet-tracking" className="text-violet-400 font-medium">Fleet Tracking</Link>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">Prijzen</Link>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-white hover:text-violet-300 transition-colors font-medium">Inloggen</Link>
                <Link href="/login" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-fuchsia-700 transition-all">
                  Start Demo
                </Link>
              </div>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm font-medium mb-8">
              <TruckIcon className="w-4 h-4 mr-2" />
              Fleet Tracking Integratie
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Automatische{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Ritregistratie
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Koppel uw fleet tracking systeem en bespaar 2+ uur per week op handmatige invoer.
              Ritten worden automatisch gesynchroniseerd en gekoppeld aan urenregistraties.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg"
              >
                Probeer gratis
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all"
              >
                Vraag een demo aan
              </Link>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 text-center">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${benefit.gradient} mb-4`}>
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-300">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Providers */}
        <section className="py-20 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ondersteunde Fleet Tracking Providers
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Wij integreren met de populairste fleet tracking systemen in Nederland en Europa
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map((provider, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-cyan-500/50 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${provider.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <TruckIcon className="w-8 h-8 text-white" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-white/10 ${provider.regionColor}`}>
                      {provider.region}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{provider.description}</p>

                  <div className="mb-4">
                    <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
                      Ondersteunde functies
                    </div>
                    <ul className="space-y-1">
                      {provider.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-300">
                          <CheckCircleIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-sm text-emerald-400 font-medium">{provider.status}</span>
                    <Link href="/contact" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                      Meer info →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-400 mb-4">
                Gebruikt u een andere provider? Neem contact op voor integratiemogelijkheden.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                <CogIcon className="w-5 h-5" />
                Vraag een custom integratie aan
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Hoe werkt het?
              </h2>
              <p className="text-xl text-gray-300">
                In 4 eenvoudige stappen automatisch ritten synchroniseren
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="relative">
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                  )}
                  <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg mb-4">
                      {step.step}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Detail */}
        <section className="py-20 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Volledige controle over uw wagenpark
                </h2>
                <p className="text-gray-300 text-lg mb-8">
                  Krijg volledig inzicht in het gebruik van uw wagenpark en koppel ritten automatisch
                  aan de juiste medewerkers en projecten.
                </p>

                <div className="space-y-4">
                  {[
                    { icon: CloudArrowUpIcon, text: 'Automatische dagelijkse synchronisatie' },
                    { icon: ShieldCheckIcon, text: 'AES-256 encryptie voor credentials' },
                    { icon: DocumentChartBarIcon, text: 'Uitgebreide ritrapportages' },
                    { icon: CheckCircleIcon, text: 'Goedkeuringsworkflow voor ritten' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <item.icon className="w-6 h-6 text-cyan-400 mr-3" />
                      <span className="text-white">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-6">Wat u krijgt:</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Real-time dashboard</span>
                      <p className="text-gray-400 text-sm">Zie direct alle ritten en kilometers</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Automatische matching</span>
                      <p className="text-gray-400 text-sm">Ritten gekoppeld aan urenregistraties</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Fiscale exports</span>
                      <p className="text-gray-400 text-sm">Belastingdienst-conforme rapportages</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-400 mr-3 mt-0.5" />
                    <div>
                      <span className="text-white font-medium">Handmatige correcties</span>
                      <p className="text-gray-400 text-sm">Pas ritten aan indien nodig</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Veelgestelde vragen
              </h2>
              <p className="text-xl text-gray-300">
                Alles wat u wilt weten over onze fleet tracking integratie
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20"
                >
                  <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Start vandaag met automatische ritregistratie
            </h2>
            <p className="text-xl text-cyan-100 mb-10 max-w-2xl mx-auto">
              Bespaar tijd, verminder fouten en krijg volledig inzicht in uw wagenpark.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-cyan-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-lg"
              >
                Start gratis trial
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all"
              >
                Vraag een demo aan
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg mr-3"></div>
                <span className="text-lg font-bold text-white">ADSPersoneelapp</span>
              </div>
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} ADSPersoneelapp. Alle rechten voorbehouden.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
