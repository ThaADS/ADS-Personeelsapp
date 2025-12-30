'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// Plan configuration with base fee + per user pricing
const plans = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'Perfect voor kleine teams - Basis HR functionaliteit',
    baseFeeMonthly: 15,
    baseFeeYearly: 144, // 20% korting
    perUserMonthly: 6,
    perUserYearly: 57.60, // 20% korting
    minUsers: 3,
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
    name: 'Professional',
    id: 'professional',
    description: 'Voor groeiende teams - Uitgebreide HR & Fleet tracking',
    baseFeeMonthly: 25,
    baseFeeYearly: 240,
    perUserMonthly: 5,
    perUserYearly: 48,
    minUsers: 3,
    icon: CpuChipIcon,
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
    description: 'Enterprise oplossing - Volledige controle & ondersteuning',
    baseFeeMonthly: 39,
    baseFeeYearly: 374.40,
    perUserMonthly: 4,
    perUserYearly: 38.40,
    minUsers: 3,
    icon: BuildingOfficeIcon,
    gradient: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      { text: 'Alles uit Professional', included: true },
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
  description: 'Maatwerk voor grote organisaties met 50+ gebruikers',
  features: [
    'Onbeperkt aantal gebruikers',
    'Volume kortingen',
    'Dedicated infrastructure',
    'Custom integraties',
    'On-premise optie beschikbaar',
    'GDPR Data Processing Agreement',
    '24/7 priority support',
    'Quarterly business reviews',
  ],
};

const faqs = [
  {
    question: 'Hoe werkt de prijs per gebruiker?',
    answer: 'Je betaalt een vaste base fee voor het platform, plus een bedrag per actieve gebruiker. Bij jaarlijkse betaling krijg je 20% korting op zowel de base fee als de gebruikersprijs.',
  },
  {
    question: 'Wat is het minimum aantal gebruikers?',
    answer: 'Alle plannen hebben een minimum van 3 gebruikers. Dit zorgt ervoor dat je direct met je team kunt starten.',
  },
  {
    question: 'Kan ik later gebruikers toevoegen of verwijderen?',
    answer: 'Ja, je kunt op elk moment gebruikers toevoegen. Extra gebruikers worden pro-rata berekend. Verwijderen kan bij de volgende facturatieperiode.',
  },
  {
    question: 'Wat gebeurt er na de gratis trial?',
    answer: 'Na de 14 dagen gratis trial kun je kiezen voor een betaald abonnement. Als je niet doorgaat, wordt je account gedeactiveerd. Je data blijft 30 dagen beschikbaar voor export.',
  },
  {
    question: 'Kan ik op elk moment opzeggen?',
    answer: 'Ja, maandelijkse abonnementen zijn maandelijks opzegbaar. Jaarlijkse abonnementen lopen tot het einde van de periode.',
  },
  {
    question: 'Zijn er extra kosten voor fleet tracking?',
    answer: 'Nee, fleet tracking integraties zijn inbegrepen in Professional en Business zonder extra kosten per voertuig.',
  },
  {
    question: 'Hoe werkt de facturatie?',
    answer: 'Je ontvangt maandelijks of jaarlijks een factuur via email. Betaling kan via iDEAL, creditcard of automatische incasso.',
  },
  {
    question: 'Is mijn data veilig?',
    answer: 'Ja, we gebruiken AES-256 encryptie, dagelijkse backups en voldoen aan AVG/GDPR. Alle data wordt opgeslagen in EU datacenters.',
  },
];

// Comparison table data
const comparisonFeatures = [
  { feature: 'Base fee', starter: '€15/mnd', professional: '€25/mnd', business: '€39/mnd' },
  { feature: 'Per gebruiker', starter: '€6/mnd', professional: '€5/mnd', business: '€4/mnd' },
  { feature: 'Min. gebruikers', starter: '3', professional: '3', business: '3' },
  { feature: 'Urenregistratie', starter: '✓', professional: '✓', business: '✓' },
  { feature: 'GPS verificatie', starter: '✓', professional: '✓', business: '✓' },
  { feature: 'Verlofbeheer', starter: '✓', professional: '✓', business: '✓' },
  { feature: 'UWV Poortwachter', starter: '—', professional: '✓', business: '✓' },
  { feature: 'Fleet tracking', starter: '—', professional: '✓', business: '✓' },
  { feature: 'API toegang', starter: '—', professional: '✓', business: '✓' },
  { feature: 'SSO / SAML', starter: '—', professional: '—', business: '✓' },
  { feature: 'SLA garantie', starter: '—', professional: '—', business: '99.9%' },
  { feature: 'Support', starter: 'Email', professional: 'Chat & Email', business: 'Priority' },
];

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'ADSPersoneelapp',
  description: 'HR Software abonnementen voor Nederlandse bedrijven - Base fee + per gebruiker',
  offers: [
    {
      '@type': 'Offer',
      name: 'Starter',
      price: '15',
      priceCurrency: 'EUR',
      description: 'Base fee €15/mnd + €6/gebruiker',
    },
    {
      '@type': 'Offer',
      name: 'Professional',
      price: '25',
      priceCurrency: 'EUR',
      description: 'Base fee €25/mnd + €5/gebruiker',
    },
    {
      '@type': 'Offer',
      name: 'Business',
      price: '39',
      priceCurrency: 'EUR',
      description: 'Base fee €39/mnd + €4/gebruiker',
    },
  ],
};

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [userCount, setUserCount] = useState(5);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // Calculate prices based on user count and billing period
  const calculatePrice = useMemo(() => {
    return (plan: typeof plans[0]) => {
      const users = Math.max(plan.minUsers, userCount);
      if (billingPeriod === 'monthly') {
        return plan.baseFeeMonthly + (users * plan.perUserMonthly);
      } else {
        // Yearly price shown per month
        return (plan.baseFeeYearly + (users * plan.perUserYearly)) / 12;
      }
    };
  }, [userCount, billingPeriod]);

  // Calculate yearly savings
  const calculateSavings = (plan: typeof plans[0]) => {
    const users = Math.max(plan.minUsers, userCount);
    const monthlyTotal = (plan.baseFeeMonthly + (users * plan.perUserMonthly)) * 12;
    const yearlyTotal = plan.baseFeeYearly + (users * plan.perUserYearly);
    return Math.round(monthlyTotal - yearlyTotal);
  };

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
          users: Math.max(3, userCount),
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

  const adjustUsers = (delta: number) => {
    setUserCount(prev => Math.max(3, Math.min(100, prev + delta)));
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
        <section className="relative pt-32 pb-8 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4 mr-2" />
              14 dagen gratis proberen
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Transparante{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                prijzen
              </span>
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Base fee + prijs per gebruiker. Geen verborgen kosten, schaal mee met je team.
            </p>
          </div>
        </section>

        {/* User Slider + Billing Toggle */}
        <section className="py-6">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* User Count Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    <UserGroupIcon className="w-5 h-5 inline mr-2" />
                    Aantal gebruikers
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => adjustUsers(-1)}
                      disabled={userCount <= 3}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Verminder gebruikers"
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="range"
                        min="3"
                        max="100"
                        value={userCount}
                        onChange={(e) => setUserCount(Number(e.target.value))}
                        aria-label="Aantal gebruikers selecteren"
                        title="Aantal gebruikers"
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => adjustUsers(1)}
                      disabled={userCount >= 100}
                      className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      aria-label="Voeg gebruiker toe"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    <div className="w-20 text-center">
                      <span className="text-3xl font-bold text-white">{userCount}</span>
                      <span className="text-sm text-gray-400 block">users</span>
                    </div>
                  </div>
                </div>

                {/* Billing Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Facturatieperiode
                  </label>
                  <div className="flex items-center gap-4">
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
                        20% korting!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => {
                const totalPrice = calculatePrice(plan);
                const savings = calculateSavings(plan);
                const effectiveUsers = Math.max(plan.minUsers, userCount);

                return (
                  <div
                    key={index}
                    className={`relative backdrop-blur-xl bg-white/10 rounded-3xl p-8 border ${
                      plan.popular ? 'border-violet-500 shadow-xl shadow-violet-500/20' : 'border-white/20'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-full">
                          Meest gekozen
                        </span>
                      </div>
                    )}

                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${plan.gradient} mb-6`}>
                      <plan.icon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                    {/* Pricing breakdown */}
                    <div className="mb-4 p-4 bg-white/5 rounded-xl">
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>Base fee</span>
                        <span>€{billingPeriod === 'monthly' ? plan.baseFeeMonthly : (plan.baseFeeYearly / 12).toFixed(0)}/mnd</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400 mb-1">
                        <span>{effectiveUsers} gebruikers × €{billingPeriod === 'monthly' ? plan.perUserMonthly : (plan.perUserYearly / 12).toFixed(2)}</span>
                        <span>€{(effectiveUsers * (billingPeriod === 'monthly' ? plan.perUserMonthly : plan.perUserYearly / 12)).toFixed(0)}/mnd</span>
                      </div>
                      <div className="border-t border-white/10 mt-2 pt-2 flex justify-between">
                        <span className="font-semibold text-white">Totaal</span>
                        <span className="font-bold text-white">€{totalPrice.toFixed(0)}/mnd</span>
                      </div>
                    </div>

                    {billingPeriod === 'yearly' && (
                      <div className="mb-6 p-3 bg-emerald-500/10 rounded-lg">
                        <p className="text-sm text-emerald-400">
                          Bespaar €{savings}/jaar met jaarlijkse betaling
                        </p>
                      </div>
                    )}

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
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
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loadingPlan === plan.id}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
                        plan.popular
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700'
                          : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}
                    >
                      {loadingPlan === plan.id ? (
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
                );
              })}
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
                    <th className="px-6 py-4 text-center text-sm font-semibold text-violet-400">Professional</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((row, index) => (
                    <tr key={index} className="border-b border-white/5">
                      <td className="px-6 py-4 text-sm text-white">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-400">{row.starter}</td>
                      <td className="px-6 py-4 text-center text-sm text-white bg-violet-500/5">{row.professional}</td>
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
                onClick={() => handleCheckout('professional')}
                disabled={loadingPlan === 'professional-cta'}
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
