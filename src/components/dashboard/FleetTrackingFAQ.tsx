'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  question: string;
  answer: string;
  link?: {
    text: string;
    href: string;
  };
}

const faqItems: FAQItem[] = [
  {
    question: 'Hoe stel ik fleet tracking in voor mijn bedrijf?',
    answer: 'Fleet tracking wordt per bedrijf/tenant ingesteld. Ga naar Instellingen → Fleet Provider en kies uw provider (bijv. RouteVision, FleetGO, Samsara). Na configuratie worden voertuigen automatisch gesynchroniseerd.',
    link: { text: 'Naar Fleet Provider instellingen', href: '/settings' }
  },
  {
    question: 'Hoe koppel ik een voertuig aan een medewerker?',
    answer: 'Dit kan op drie manieren: 1) Via Instellingen → Fleet Provider → Voertuig-Medewerker Koppelingen, 2) Bij het aanmaken van een nieuwe medewerker (stap 4: Voertuigen), 3) In het medewerkerprofiel onder de Voertuigen tab.',
    link: { text: 'Naar medewerkers', href: '/employees' }
  },
  {
    question: 'Worden ritten automatisch geregistreerd?',
    answer: 'Ja! Zodra een voertuig aan een medewerker is gekoppeld, worden ritten automatisch geïmporteerd. De ritten verschijnen onder Ritten en kunnen worden goedgekeurd als werkuren.',
    link: { text: 'Bekijk ritten', href: '/trips' }
  },
  {
    question: 'Wat is het verschil tussen provider- en medewerkerkoppeling?',
    answer: 'De fleet provider (RouteVision, FleetGO, etc.) wordt eenmalig per bedrijf geconfigureerd. Voertuigen worden vervolgens per medewerker gekoppeld. Zo weet het systeem welke ritten bij welke medewerker horen.',
  },
  {
    question: 'Hoe vaak worden voertuiggegevens gesynchroniseerd?',
    answer: 'Standaard gebeurt dit dagelijks om 06:00 (indien automatische sync is ingeschakeld). U kunt ook handmatig synchroniseren via de "Nu Synchroniseren" knop in de Fleet Provider instellingen.',
  }
];

export default function FleetTrackingFAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Veelgestelde Vragen
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fleet Tracking & Voertuigbeheer
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden border border-gray-200 dark:border-purple-500/20"
            >
              <button
                onClick={() => toggleExpand(index)}
                className="w-full flex items-center justify-between p-4 text-left bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm pr-2">
                  {item.question}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expandedIndex === index && (
                <div className="px-4 pb-4 bg-gray-50 dark:bg-white/5">
                  <p className="text-sm text-gray-600 dark:text-gray-300 pt-2">
                    {item.answer}
                  </p>
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1 mt-3 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {item.link.text}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-purple-500/20">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Fleet Provider configureren
          </Link>
        </div>
      </div>
    </div>
  );
}
