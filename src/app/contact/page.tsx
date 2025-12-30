import { Metadata } from 'next';
import Link from 'next/link';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  BuildingOffice2Icon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Contact | ADSPersoneelapp - Neem Contact Op met Ons Team',
  description: 'Neem contact op met ADSPersoneelapp voor vragen over onze HR software, een demo aanvraag of technische ondersteuning. Wij helpen u graag verder met uw personeelsbeheer.',
  keywords: [
    'contact ADSPersoneelapp',
    'HR software support',
    'personeelssoftware contact',
    'demo aanvragen HR',
    'klantenservice personeelsbeheer',
    'technische ondersteuning HR software',
    'ADSPersoneelapp helpdesk',
    'HR oplossingen Nederland',
    'urenregistratie hulp',
    'verlofbeheer ondersteuning'
  ],
  openGraph: {
    title: 'Contact | ADSPersoneelapp - Neem Contact Op',
    description: 'Neem contact op voor vragen, demo aanvragen of ondersteuning. Ons team staat klaar om u te helpen met uw HR software behoeften.',
    url: 'https://adspersoneelsapp.nl/contact',
    siteName: 'ADSPersoneelapp',
    images: [
      {
        url: '/og-contact.png',
        width: 1200,
        height: 630,
        alt: 'ADSPersoneelapp Contact',
      },
    ],
    locale: 'nl_NL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact | ADSPersoneelapp',
    description: 'Neem contact op met ons team voor vragen of ondersteuning.',
    images: ['/og-contact.png'],
  },
  alternates: {
    canonical: 'https://adspersoneelsapp.nl/contact',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'ADSPersoneelapp Contact',
  description: 'Contactpagina voor ADSPersoneelapp HR software',
  url: 'https://adspersoneelsapp.nl/contact',
  mainEntity: {
    '@type': 'Organization',
    name: 'ADSPersoneelapp',
    description: 'Complete HR software oplossing voor Nederlandse bedrijven',
    url: 'https://adspersoneelsapp.nl',
    logo: 'https://adspersoneelsapp.nl/logo.png',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+31-85-123-4567',
        contactType: 'customer service',
        areaServed: 'NL',
        availableLanguage: ['Dutch', 'English'],
        hoursAvailable: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '09:00',
          closes: '17:30'
        }
      },
      {
        '@type': 'ContactPoint',
        telephone: '+31-85-123-4567',
        contactType: 'technical support',
        areaServed: 'NL',
        availableLanguage: ['Dutch', 'English']
      },
      {
        '@type': 'ContactPoint',
        telephone: '+31-85-123-4567',
        contactType: 'sales',
        areaServed: 'NL',
        availableLanguage: ['Dutch', 'English']
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Herengracht 500',
      addressLocality: 'Amsterdam',
      postalCode: '1017 CB',
      addressCountry: 'NL'
    },
    sameAs: [
      'https://www.linkedin.com/company/adspersoneelapp',
      'https://twitter.com/adspersoneelapp'
    ]
  }
};

const contactMethods = [
  {
    icon: PhoneIcon,
    title: 'Telefoon',
    description: 'Bel ons voor directe hulp',
    value: '+31 85 123 4567',
    action: 'tel:+31851234567',
    actionText: 'Bel nu',
  },
  {
    icon: EnvelopeIcon,
    title: 'E-mail',
    description: 'Stuur ons een bericht',
    value: 'info@adspersoneelapp.nl',
    action: 'mailto:info@adspersoneelapp.nl',
    actionText: 'Stuur e-mail',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Live Chat',
    description: 'Chat direct met ons team',
    value: 'Beschikbaar ma-vr 9:00-17:30',
    action: '#chat',
    actionText: 'Start chat',
  },
  {
    icon: MapPinIcon,
    title: 'Bezoekadres',
    description: 'Kom langs op kantoor',
    value: 'Herengracht 500, Amsterdam',
    action: 'https://maps.google.com/?q=Herengracht+500+Amsterdam',
    actionText: 'Bekijk kaart',
  },
];

const departments = [
  {
    name: 'Verkoop & Demo',
    description: 'Voor prijsinformatie, demo aanvragen en nieuwe klanten',
    email: 'sales@adspersoneelapp.nl',
    phone: '+31 85 123 4568',
    responseTime: 'Reactie binnen 4 uur',
  },
  {
    name: 'Technische Support',
    description: 'Voor technische vragen en probleemoplossing',
    email: 'support@adspersoneelapp.nl',
    phone: '+31 85 123 4569',
    responseTime: 'Reactie binnen 2 uur',
  },
  {
    name: 'Administratie',
    description: 'Voor facturen, betalingen en contracten',
    email: 'administratie@adspersoneelapp.nl',
    phone: '+31 85 123 4570',
    responseTime: 'Reactie binnen 24 uur',
  },
  {
    name: 'Partnerships',
    description: 'Voor samenwerkingen en integratiepartners',
    email: 'partners@adspersoneelapp.nl',
    phone: '+31 85 123 4571',
    responseTime: 'Reactie binnen 48 uur',
  },
];

const faqs = [
  {
    question: 'Hoe snel krijg ik reactie op mijn vraag?',
    answer: 'Wij streven ernaar alle vragen binnen 4 werkuren te beantwoorden. Voor technische support is onze reactietijd gemiddeld 2 uur. Buiten kantooruren kunt u altijd een e-mail sturen die de volgende werkdag wordt opgepakt.',
  },
  {
    question: 'Kan ik een gratis demo aanvragen?',
    answer: 'Ja, wij bieden gratis persoonlijke demo\'s aan. Tijdens de demo laten we alle functies zien en beantwoorden we al uw vragen. Een demo duurt ongeveer 30-45 minuten en kan zowel online als op locatie plaatsvinden.',
  },
  {
    question: 'Bieden jullie ondersteuning in het Engels?',
    answer: 'Ja, onze support is beschikbaar in zowel Nederlands als Engels. Al onze documentatie en handleidingen zijn ook in beide talen beschikbaar.',
  },
  {
    question: 'Wat zijn jullie openingstijden?',
    answer: 'Ons kantoor is geopend van maandag tot en met vrijdag, van 09:00 tot 17:30 uur. Technische support is tijdens kantooruren direct bereikbaar. E-mails buiten kantooruren worden de volgende werkdag beantwoord.',
  },
  {
    question: 'Kan ik langskomen op kantoor?',
    answer: 'Ja, u bent van harte welkom op ons kantoor in Amsterdam. Wij vragen u wel om vooraf een afspraak te maken zodat wij voldoende tijd voor u kunnen reserveren.',
  },
  {
    question: 'Hoe kan ik een klacht indienen?',
    answer: 'Klachten kunt u indienen via klachten@adspersoneelapp.nl. Wij nemen elke klacht serieus en streven ernaar binnen 5 werkdagen een oplossing te bieden.',
  },
];

const supportFeatures = [
  'Persoonlijke accountmanager voor Team en Business abonnementen',
  'Uitgebreide online kennisbank met handleidingen',
  'Video tutorials voor alle functies',
  'Webinars en trainingen',
  'Community forum voor tips en best practices',
  'Regelmatige product updates en verbeteringen',
];

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                <span className="text-xl font-bold text-white">ADSPersoneelapp</span>
              </Link>
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
                <Link href="/contact" className="text-purple-400 font-medium">
                  Contact
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  Inloggen
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Neem <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Contact</span> Op
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-300">
                Heeft u vragen over onze HR software? Wilt u een demo aanvragen of technische
                ondersteuning? Ons team staat klaar om u te helpen.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 -mt-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method) => (
                <div
                  key={method.title}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-purple-500/50 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 mb-4">
                    <method.icon className="h-6 w-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{method.title}</h3>
                  <p className="text-sm text-gray-400 mb-2">{method.description}</p>
                  <p className="text-white font-medium mb-4">{method.value}</p>
                  <a
                    href={method.action}
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    {method.actionText}
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6">Stuur ons een bericht</h2>
                <form className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        Voornaam *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        placeholder="Uw voornaam"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Achternaam *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                        placeholder="Uw achternaam"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      E-mailadres *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="uw@email.nl"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-300 mb-2">
                      Bedrijfsnaam
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                      placeholder="Uw bedrijfsnaam"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                      Onderwerp *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    >
                      <option value="" className="bg-slate-900">Selecteer een onderwerp</option>
                      <option value="demo" className="bg-slate-900">Demo aanvragen</option>
                      <option value="pricing" className="bg-slate-900">Prijsinformatie</option>
                      <option value="support" className="bg-slate-900">Technische support</option>
                      <option value="partnership" className="bg-slate-900">Samenwerking</option>
                      <option value="other" className="bg-slate-900">Overig</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Bericht *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
                      placeholder="Hoe kunnen wij u helpen?"
                    />
                  </div>

                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="privacy"
                      name="privacy"
                      required
                      className="mt-1 h-4 w-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="privacy" className="ml-3 text-sm text-gray-400">
                      Ik ga akkoord met de{' '}
                      <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                        privacyverklaring
                      </Link>{' '}
                      en het verwerken van mijn gegevens.
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
                  >
                    Verstuur bericht
                  </button>
                </form>
              </div>

              {/* Company Info */}
              <div className="space-y-8">
                {/* Opening Hours */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="flex items-center mb-6">
                    <ClockIcon className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">Openingstijden</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-300">
                      <span>Maandag - Vrijdag</span>
                      <span className="text-white font-medium">09:00 - 17:30</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Zaterdag</span>
                      <span className="text-gray-500">Gesloten</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Zondag</span>
                      <span className="text-gray-500">Gesloten</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
                    Technische support via e-mail wordt ook buiten kantooruren gemonitord voor
                    urgente problemen.
                  </p>
                </div>

                {/* Office Location */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <div className="flex items-center mb-6">
                    <BuildingOffice2Icon className="h-6 w-6 text-purple-400 mr-3" />
                    <h3 className="text-xl font-bold text-white">Ons Kantoor</h3>
                  </div>
                  <address className="not-italic text-gray-300 space-y-1">
                    <p className="text-white font-medium">ADSPersoneelapp B.V.</p>
                    <p>Herengracht 500</p>
                    <p>1017 CB Amsterdam</p>
                    <p>Nederland</p>
                  </address>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-400 mb-2">KvK: 12345678</p>
                    <p className="text-sm text-gray-400">BTW: NL123456789B01</p>
                  </div>
                  <a
                    href="https://maps.google.com/?q=Herengracht+500+Amsterdam"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    Bekijk op Google Maps
                    <ArrowRightIcon className="ml-1 h-4 w-4" />
                  </a>
                </div>

                {/* Support Features */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-6">Wat wij bieden</h3>
                  <ul className="space-y-3">
                    {supportFeatures.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Departments */}
        <section className="py-16 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Direct Contact per Afdeling</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Neem direct contact op met de juiste afdeling voor de snelste hulp.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {departments.map((dept) => (
                <div
                  key={dept.name}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300"
                >
                  <h3 className="text-xl font-semibold text-white mb-2">{dept.name}</h3>
                  <p className="text-gray-400 mb-4">{dept.description}</p>
                  <div className="space-y-2">
                    <a
                      href={`mailto:${dept.email}`}
                      className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <EnvelopeIcon className="h-4 w-4 mr-2" />
                      {dept.email}
                    </a>
                    <a
                      href={`tel:${dept.phone.replace(/\s/g, '')}`}
                      className="flex items-center text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      {dept.phone}
                    </a>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{dept.responseTime}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Veelgestelde Vragen</h2>
              <p className="text-gray-400">
                Antwoorden op de meest gestelde vragen over contact en support.
              </p>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-purple-900/50 to-pink-900/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Klaar om te starten?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Vraag een gratis demo aan en ontdek hoe ADSPersoneelapp uw personeelsbeheer
              kan vereenvoudigen. Geen verplichtingen, geen creditcard nodig.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
              >
                Bekijk prijzen
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-8 py-3 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                Gratis proberen
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-950/80 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
                <ul className="space-y-2">
                  <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Functies</Link></li>
                  <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Prijzen</Link></li>
                  <li><Link href="/fleet-tracking" className="text-gray-400 hover:text-white transition-colors">Fleet Tracking</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Bedrijf</h4>
                <ul className="space-y-2">
                  <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Over ons</Link></li>
                  <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                  <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Vacatures</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Support</h4>
                <ul className="space-y-2">
                  <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentatie</Link></li>
                  <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Helpcentrum</Link></li>
                  <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-4">Juridisch</h4>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Voorwaarden</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500" />
                <span className="text-lg font-bold text-white">ADSPersoneelapp</span>
              </div>
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} ADSPersoneelapp B.V. Alle rechten voorbehouden.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
