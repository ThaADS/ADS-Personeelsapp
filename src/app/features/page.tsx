import { Metadata } from 'next';
import Link from 'next/link';
import {
  ClockIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CogIcon,
  BellAlertIcon,
  DocumentChartBarIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  CloudArrowUpIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Functies | ADSPersoneelapp - Complete HR Software voor Nederland',
  description: 'Ontdek alle functies van ADSPersoneelapp: urenregistratie met GPS, verlofbeheer, ziekmeldingen, goedkeuringsworkflows, rapportages en meer. AVG-compliant HR software voor Nederlandse bedrijven.',
  keywords: [
    'HR software Nederland',
    'urenregistratie software',
    'verlofbeheer systeem',
    'ziekmeldingen app',
    'personeelsadministratie',
    'tijdregistratie GPS',
    'AVG compliant HR',
    'UWV Poortwachter',
    'goedkeuringsworkflows',
    'HR rapportages',
  ],
  openGraph: {
    title: 'Functies | ADSPersoneelapp - Complete HR Software',
    description: 'Alle functies die je nodig hebt voor efficiënt personeelsbeheer. Van urenregistratie tot verlofbeheer, alles in één platform.',
    url: 'https://adspersoneelsapp.nl/features',
    siteName: 'ADSPersoneelapp',
    locale: 'nl_NL',
    type: 'website',
    images: [
      {
        url: '/og-features.png',
        width: 1200,
        height: 630,
        alt: 'ADSPersoneelapp Functies Overzicht',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Functies | ADSPersoneelapp',
    description: 'Complete HR software met urenregistratie, verlofbeheer en meer.',
  },
  alternates: {
    canonical: 'https://adspersoneelsapp.nl/features',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ADSPersoneelapp',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '19',
    priceCurrency: 'EUR',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
  featureList: [
    'Urenregistratie met GPS-verificatie',
    'Verlof- en TVT-beheer',
    'Ziekmeldingen met UWV-alerts',
    'Goedkeuringsworkflows',
    'Rapportages en analytics',
    'Multi-tenant architectuur',
    'AVG-compliant',
  ],
};

const mainFeatures = [
  {
    id: 'urenregistratie',
    title: 'Urenregistratie',
    subtitle: 'GPS-verificatie en slimme validatie',
    icon: ClockIcon,
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Registreer werktijden nauwkeurig met GPS-verificatie voor buitendienstmedewerkers. Automatische validaties voorkomen fouten en besparen tijd.',
    features: [
      'Start/stop klokfunctie of handmatige invoer',
      'GPS-locatie verificatie bij inklokken',
      'Automatische pauzeberekening',
      'Slimme validaties (weekend, lange dagen, minimum pauze)',
      'Notities en projectcodes per registratie',
      'Mobiel en desktop ondersteuning',
    ],
    benefits: [
      'Tot 20 minuten per dag bespaard per medewerker',
      '100% nauwkeurige urenverantwoording',
      'Volledige transparantie voor managers',
    ],
    useCases: [
      'Bouwbedrijven met buitendienstpersoneel',
      'Consultancies met projecturen',
      'Zorgorganisaties met dienstroosters',
    ],
  },
  {
    id: 'verlofbeheer',
    title: 'Verlof & Tijd-voor-Tijd',
    subtitle: 'Realtime saldi en automatische berekeningen',
    icon: CalendarIcon,
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Beheer vakantiedagen, TVT-uren en bijzonder verlof met realtime saldo-inzicht. Medewerkers zien direct hoeveel dagen beschikbaar zijn.',
    features: [
      'Vakantie-, TVT- en bijzonder verlof aanvragen',
      'Realtime saldo-inzicht per medewerker',
      'Automatische berekening van opbouw en verval',
      'Teamkalender met beschikbaarheidsoverzicht',
      'Configureerbare goedkeuringsflows',
      'Export naar externe systemen',
    ],
    benefits: [
      'Geen handmatige saldo-administratie meer',
      'Direct inzicht in teamcapaciteit',
      'Compliance met Nederlandse wetgeving',
    ],
    useCases: [
      'HR-afdelingen die administratie willen reduceren',
      'Managers die teamplanning willen optimaliseren',
      'Medewerkers die zelfstandig verlof willen beheren',
    ],
  },
  {
    id: 'ziekmeldingen',
    title: 'Ziekmeldingen & UWV-Alerts',
    subtitle: 'Poortwachter-compliant ziekteverzuimbeheer',
    icon: ShieldCheckIcon,
    gradient: 'from-rose-500 to-pink-600',
    description: 'Voldoe aan de Wet Poortwachter met automatische UWV-alerts. Ontvang herinneringen voor de 42-dagen melding en andere cruciale deadlines.',
    features: [
      'Eenvoudige ziekmelding via app of web',
      'Automatische UWV 42-dagen alerts',
      'Herstelprognose en opvolging',
      'Bijlagen en documentatie per case',
      'Verzuimrapportages en statistieken',
      'GDPR-compliant gegevensbeheer',
    ],
    benefits: [
      'Nooit meer een UWV-deadline missen',
      'Volledig overzicht van verzuimhistorie',
      'Proactief verzuimbeheer',
    ],
    useCases: [
      'HR-managers met Poortwachter-verantwoordelijkheid',
      'Bedrijven met arbo-dienst integratie',
      'Organisaties die verzuim willen reduceren',
    ],
  },
  {
    id: 'goedkeuringen',
    title: 'Goedkeuringsworkflows',
    subtitle: 'Efficiënte processen met volledige audit trail',
    icon: CheckCircleIcon,
    gradient: 'from-amber-500 to-orange-600',
    description: 'Stroomlijn goedkeuringsprocessen met configureerbare workflows. Managers keuren uren, verlof en ziekmeldingen goed vanuit één overzicht.',
    features: [
      'Centrale goedkeuringslijst met filters',
      'Bulk-goedkeuring voor efficiëntie',
      'Opmerkingen en feedback per aanvraag',
      'Automatische herinneringen voor openstaande items',
      'Volledige audit trail voor compliance',
      'Rolgebaseerde goedkeuringsrechten',
    ],
    benefits: [
      '80% snellere goedkeuringsprocessen',
      'Volledige traceerbaarheid voor audits',
      'Minder administratieve last voor managers',
    ],
    useCases: [
      'Managers met grote teams',
      'Organisaties met strikte compliance-eisen',
      'Bedrijven die processen willen digitaliseren',
    ],
  },
  {
    id: 'rapportages',
    title: 'Rapportages & Analytics',
    subtitle: 'Realtime dashboards en exporteerbare data',
    icon: ChartBarIcon,
    gradient: 'from-indigo-500 to-blue-600',
    description: 'Krijg direct inzicht in uren, verzuim en verlof met interactieve dashboards. Exporteer data naar Excel, PDF of koppel met externe systemen.',
    features: [
      'Realtime KPI-dashboards',
      'Uren per project/team/medewerker',
      'Verzuimstatistieken en trends',
      'Export naar CSV, XLSX en PDF',
      'Geautomatiseerde maandrapportages',
      'API voor externe integraties',
    ],
    benefits: [
      'Data-gedreven besluitvorming',
      'Directe rapportage voor management',
      'Minder tijd kwijt aan handmatige rapportages',
    ],
    useCases: [
      'Finance teams voor facturatie',
      'HR voor management rapportages',
      'Projectmanagers voor resource planning',
    ],
  },
  {
    id: 'medewerkers',
    title: 'Medewerkersbeheer & RBAC',
    subtitle: 'Multi-tenant architectuur met fijngranulaire rechten',
    icon: UserGroupIcon,
    gradient: 'from-violet-500 to-purple-600',
    description: 'Beheer medewerkers, teams en rechten met een volledig Role-Based Access Control systeem. Geschikt voor multi-tenant omgevingen.',
    features: [
      'Medewerkerprofielen met contactgegevens',
      'Teams en afdelingen structuur',
      'Rolgebaseerde toegangscontrole (RBAC)',
      'Uitnodigen en deactiveren van accounts',
      'Multi-tenant ondersteuning',
      'SSO en 2FA authenticatie',
    ],
    benefits: [
      'AVG-compliant toegangsbeheer',
      'Schaalbaar naar meerdere vestigingen',
      'Veilige scheiding van data',
    ],
    useCases: [
      'Groeiende organisaties',
      'Bedrijven met meerdere locaties',
      'Franchises en holding-structuren',
    ],
  },
];

const additionalFeatures = [
  {
    title: 'Automatische Herinneringen',
    description: 'Notificaties voor ontbrekende uren, goedkeuringen en deadlines',
    icon: BellAlertIcon,
  },
  {
    title: 'Maandelijkse Rapportages',
    description: 'Automatisch gegenereerde overzichten per email',
    icon: DocumentChartBarIcon,
  },
  {
    title: 'Multi-taal Ondersteuning',
    description: 'Nederlands en Engels interface',
    icon: GlobeAltIcon,
  },
  {
    title: 'Mobiele App',
    description: 'Volledig responsive voor smartphone en tablet',
    icon: DevicePhoneMobileIcon,
  },
  {
    title: 'Cloud-gebaseerd',
    description: 'Geen installatie nodig, altijd de nieuwste versie',
    icon: CloudArrowUpIcon,
  },
  {
    title: 'API Integraties',
    description: 'Koppel met Stripe, webhooks en externe systemen',
    icon: CogIcon,
  },
];

export default function FeaturesPage() {
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
                <Link href="/features" className="text-violet-400 font-medium">Functies</Link>
                <Link href="/fleet-tracking" className="text-gray-300 hover:text-white transition-colors">Fleet Tracking</Link>
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
            <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              Complete HR Software voor Nederland
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Alle functies voor{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                modern HR-beheer
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Van urenregistratie met GPS tot UWV-compliant ziekteverzuimbeheer.
              Alles wat je nodig hebt voor efficiënt personeelsbeheer in één platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:from-violet-700 hover:to-fuchsia-700 transition-all shadow-lg"
              >
                Start 14 dagen gratis
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/20 rounded-xl hover:bg-white/10 transition-all"
              >
                Bekijk prijzen
              </Link>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.id}
                id={feature.id}
                className={`py-16 ${index !== 0 ? 'border-t border-white/10' : ''}`}
              >
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                      {feature.title}
                    </h2>
                    <p className="text-lg text-violet-400 mb-4">{feature.subtitle}</p>
                    <p className="text-gray-300 text-lg mb-8">{feature.description}</p>

                    <div className="space-y-4 mb-8">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-start">
                          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Voordelen</h3>
                      <ul className="space-y-3 mb-6">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start text-emerald-400">
                            <span className="mr-2">✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-lg font-semibold text-white mb-4">Ideaal voor</h3>
                      <ul className="space-y-2">
                        {feature.useCases.map((useCase, i) => (
                          <li key={i} className="text-gray-400 text-sm">
                            • {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                En nog veel meer...
              </h2>
              <p className="text-xl text-gray-300">
                Extra functies die je werkdag nog makkelijker maken
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20 hover:border-violet-500/50 transition-all"
                >
                  <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              Start vandaag nog met je gratis trial. Geen creditcard vereist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-lg"
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
