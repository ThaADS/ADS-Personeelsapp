'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';

const tiers = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect voor kleine teams die willen starten met digitaal HR',
    monthlyPrice: 19,
    yearlyPrice: 190,
    yearlyDiscount: '2 maanden gratis',
    users: 'Tot 5 gebruikers',
    icon: RocketLaunchIcon,
    gradient: 'from-cyan-500 to-blue-500',
    popular: false,
    features: [
      { text: 'Urenregistratie met GPS', included: true },
      { text: 'Verlof & TVT beheer', included: true },
      { text: 'Ziekmeldingen', included: true },
      { text: 'Goedkeuringsworkflows', included: true },
      { text: 'Basis rapportages', included: true },
      { text: 'Email support', included: true },
      { text: 'Fleet tracking integratie', included: false },
      { text: 'API toegang', included: false },
      { text: 'Prioriteit support', included: false },
    ],
  },
  {
    name: 'Team',
    id: 'team',
    description: 'Meest gekozen voor groeiende teams met uitgebreide behoeften',
    monthlyPrice: 39,
    yearlyPrice: 390,
    yearlyDiscount: '2 maanden gratis',
    users: 'Tot 15 gebruikers',
    icon: UserGroupIcon,
    gradient: 'from-violet-500 to-fuchsia-500',
    popular: true,
    features: [
      { text: 'Alles uit Starter', included: true },
      { text: 'Fleet tracking integratie', included: true },
      { text: 'Geavanceerde rapportages', included: true },
      { text: 'Bulk goedkeuringen', included: true },
      { text: 'Teamkalenders', included: true },
      { text: 'UWV Poortwachter alerts', included: true },
      { text: 'API toegang', included: true },
      { text: 'Chat & email support', included: true },
      { text: 'Dedicated account manager', included: false },
    ],
  },
  {
    name: 'Business',
    id: 'business',
    description: 'Voor grotere organisaties met enterprise behoeften',
    monthlyPrice: 79,
    yearlyPrice: 790,
    yearlyDiscount: '2 maanden gratis',
    users: 'Tot 50 gebruikers',
    icon: BuildingOfficeIcon,
    gradient: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      { text: 'Alles uit Team', included: true },
      { text: 'Onbeperkte fleet integraties', included: true },
      { text: 'Custom rapportages', included: true },
      { text: 'Multi-tenant ondersteuning', included: true },
      { text: 'SSO / SAML authenticatie', included: true },
      { text: 'SLA garantie (99.9%)', included: true },
      { text: 'Prioriteit support', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Onboarding sessies', included: true },
    ],
  },
];

const enterpriseTier = {
  name: 'Enterprise',
  description: 'Maatwerk voor grote organisaties',
  features: [
    'Onbeperkt aantal gebruikers',
    'Dedicated infrastructure',
    'Custom integraties',
    'On-premise optie beschikbaar',
    'GDPR Data Processing Agreement',
    '24/7 priority support',
    'Training en onboarding',
    'Quarterly business reviews',
  ],
};

const faqs = [
  {
    question: 'Kan ik op elk moment opzeggen?',
    answer: 'Ja, ADSPersoneelapp is maandelijks opzegbaar. Er zijn geen langetermijnverplichtingen. Je kunt je abonnement op elk moment stopzetten via de instellingen.',
  },
  {
    question: 'Wat gebeurt er na de gratis trial?',
    answer: 'Na de 14 dagen gratis trial kun je kiezen voor een betaald abonnement. Als je niet doorgaat, wordt je account automatisch gedeactiveerd. Je data blijft 30 dagen beschikbaar voor export.',
  },
  {
    question: 'Kan ik later upgraden of downgraden?',
    answer: 'Absoluut! Je kunt op elk moment je abonnement wijzigen. Bij een upgrade krijg je direct toegang tot de extra functies. Bij een downgrade wordt de wijziging actief bij je volgende facturatieperiode.',
  },
  {
    question: 'Zijn er extra kosten voor fleet tracking?',
    answer: 'Nee, fleet tracking integraties zijn inbegrepen in het Team en Business abonnement zonder extra kosten. De Starter tier heeft geen fleet tracking ondersteuning.',
  },
  {
    question: 'Hoe werkt de facturatie?',
    answer: 'Je ontvangt maandelijks een factuur via email. Betaling kan via iDEAL, creditcard of automatische incasso. Jaarlijks betalen geeft 2 maanden korting.',
  },
  {
    question: 'Bieden jullie korting voor non-profits of startups?',
    answer: 'Ja, we bieden speciale tarieven voor non-profit organisaties en startups in een accelerator programma. Neem contact met ons op voor meer informatie.',
  },
  {
    question: 'Wat als ik meer dan 50 gebruikers heb?',
    answer: 'Voor organisaties met meer dan 50 gebruikers bieden we Enterprise maatwerk. Neem contact op voor een offerte op maat met volume korting.',
  },
  {
    question: 'Is mijn data veilig?',
    answer: 'Ja, we gebruiken AES-256 encryptie, dagelijkse backups en voldoen aan AVG/GDPR. Alle data wordt opgeslagen in EU datacenters met ISO 27001 certificering.',
  },
];

const comparisonFeatures = [
  { feature: 'Gebruikers', starter: 'Tot 5', team: 'Tot 15', business: 'Tot 50' },
  { feature: 'Urenregistratie', starter: '✓', team: '✓', business: '✓' },
  { feature: 'GPS verificatie', starter: '✓', team: '✓', business: '✓' },
  { feature: 'Verlofbeheer', starter: '✓', team: '✓', business: '✓' },
  { feature: 'Ziekmeldingen', starter: '✓', team: '✓', business: '✓' },
  { feature: 'UWV Poortwachter alerts', starter: '—', team: '✓', business: '✓' },
  { feature: 'Fleet tracking', starter: '—', team: '✓', business: '✓' },
  { feature: 'API toegang', starter: '—', team: '✓', business: '✓' },
  { feature: 'SSO / SAML', starter: '—', team: '—', business: '✓' },
  { feature: 'SLA garantie', starter: '—', team: '—', business: '99.9%' },
  { feature: 'Support', starter: 'Email', team: 'Chat & Email', business: 'Priority' },
];

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'ADSPersoneelapp',
  description: 'HR Software abonnementen voor Nederlandse bedrijven',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '19',
      priceCurrency: 'EUR',
      description: 'Tot 5 gebruikers',
    },
    {
      '@type': 'Offer',
      name: 'Team',
      price: '39',
      priceCurrency: 'EUR',
      description: 'Tot 15 gebruikers',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '79',
      priceCurrency: 'EUR',
      description: 'Tot 50 gebruikers',
    },
  ],
};

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setLoadingPlan(planId);

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          billing: billingPeriod,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Checkout error:', data.error);
        alert('Er is een fout opgetreden. Probeer het opnieuw.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Er is een fout opgetreden. Probeer het opnieuw.');
    } finally {
      setLoadingPlan(null);
    }
  };

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
                <Link href="/fleet-tracking" className="text-gray-300 hover:text-white transition-colors">Fleet Tracking</Link>
                <Link href="/pricing" className="text-violet-400 font-medium">Prijzen</Link>
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
        <section className="relative pt-32 pb-16 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              14 dagen gratis proberen
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Eenvoudige, transparante{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                prijzen
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Geen verborgen kosten, geen lange contracten. Kies het plan dat bij jouw team past.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-white' : 'text-gray-400'}`}>
                Maandelijks
              </span>
              <button
                type="button"
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                aria-label={`Wissel naar ${billingPeriod === 'monthly' ? 'jaarlijks' : 'maandelijks'} factureren`}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                  billingPeriod === 'yearly' ? 'bg-gradient-to-r from-emerald-500 to-green-500' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    billingPeriod === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
                Jaarlijks
              </span>
              {billingPeriod === 'yearly' && (
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                  2 maanden gratis!
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400">
              Alle prijzen zijn exclusief BTW • Maandelijks opzegbaar
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {tiers.map((tier, index) => (
                <div
                  key={index}
                  className={`relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border ${
                    tier.popular ? 'border-violet-500 shadow-xl shadow-violet-500/20' : 'border-white/20'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-full">
                        Meest gekozen
                      </span>
                    </div>
                  )}

                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${tier.gradient} mb-6`}>
                    <tier.icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{tier.description}</p>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-white">
                        €{billingPeriod === 'monthly' ? tier.monthlyPrice : tier.yearlyPrice}
                      </span>
                      <span className="text-gray-400 ml-2">
                        /{billingPeriod === 'monthly' ? 'maand' : 'jaar'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{tier.users}</div>
                  </div>

                  {billingPeriod === 'yearly' && (
                    <div className="mb-6 p-3 bg-emerald-500/10 rounded-lg">
                      <p className="text-sm text-emerald-400">
                        {tier.yearlyDiscount} - Bespaar €{tier.monthlyPrice * 2}
                      </p>
                    </div>
                  )}

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        {feature.included ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        ) : (
                          <span className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0 text-center">—</span>
                        )}
                        <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => handleCheckout(tier.id)}
                    disabled={loadingPlan === tier.id}
                    className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                      tier.popular
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    {loadingPlan === tier.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Bezig...
                      </>
                    ) : (
                      <>
                        Start 14 dagen gratis
                        <ArrowRightIcon className="ml-2 w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-3xl p-8 border border-amber-500/30">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-4">
                    Enterprise
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{enterpriseTier.name}</h3>
                  <p className="text-gray-300 mb-4">{enterpriseTier.description}</p>
                  <div className="text-4xl font-bold text-white mb-6">Op aanvraag</div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Neem contact op
                  </Link>
                </div>
                <div>
                  <ul className="space-y-3">
                    {enterpriseTier.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-gray-300">
                        <CheckCircleIcon className="w-5 h-5 text-amber-400 mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Vergelijk alle functies</h2>
              <p className="text-gray-300">Bekijk welk plan het beste bij jouw organisatie past</p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Functie</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Starter</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-violet-400">Team</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-6 py-4 text-sm text-white">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400">{row.starter}</td>
                      <td className="px-6 py-4 text-center text-sm text-white bg-violet-500/5">{row.team}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400">{row.business}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 bg-gradient-to-br from-slate-900/50 to-purple-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <ShieldCheckIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-1">AVG Compliant</h4>
                <p className="text-sm text-gray-400">Data in EU datacenters</p>
              </div>
              <div>
                <CheckCircleIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-1">Geen creditcard nodig</h4>
                <p className="text-sm text-gray-400">Voor de gratis trial</p>
              </div>
              <div>
                <ChatBubbleLeftRightIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-1">Nederlandse support</h4>
                <p className="text-sm text-gray-400">Binnen 24 uur reactie</p>
              </div>
              <div>
                <ArrowRightIcon className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h4 className="font-semibold text-white mb-1">Maandelijks opzegbaar</h4>
                <p className="text-sm text-gray-400">Geen lange contracten</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Veelgestelde vragen over prijzen</h2>
              <p className="text-gray-300">Heb je nog vragen? We helpen je graag.</p>
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
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600"></div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Klaar om te beginnen?
            </h2>
            <p className="text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
              Start vandaag met je 14 dagen gratis trial. Geen creditcard vereist.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => handleCheckout('team')}
                disabled={loadingPlan === 'team-cta'}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-violet-600 bg-white rounded-xl hover:bg-gray-50 transition-all shadow-lg disabled:opacity-70"
              >
                Start gratis trial
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </button>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-xl hover:bg-white/10 transition-all"
              >
                Plan een demo
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
