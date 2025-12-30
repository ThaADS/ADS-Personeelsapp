import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Betaling Geslaagd | ADSPersoneelapp',
  description: 'Uw abonnement is succesvol geactiveerd. Welkom bij ADSPersoneelapp!',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-8 shadow-lg shadow-green-500/25">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Betaling Geslaagd!
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Welkom bij ADSPersoneelapp! Uw abonnement is succesvol geactiveerd en uw 14 dagen
            gratis proefperiode is begonnen.
          </p>

          {/* What's Next */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-white mb-4">Wat nu?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium mr-3 mt-0.5">
                  1
                </span>
                <span className="text-gray-300">
                  U ontvangt een bevestigingsmail met uw accountgegevens
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium mr-3 mt-0.5">
                  2
                </span>
                <span className="text-gray-300">
                  Log in op het dashboard om uw bedrijf in te stellen
                </span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-medium mr-3 mt-0.5">
                  3
                </span>
                <span className="text-gray-300">
                  Nodig uw teamleden uit en begin met werken!
                </span>
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Ga naar Dashboard
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Terug naar Home
            </Link>
          </div>

          {/* Support Note */}
          <p className="mt-8 text-sm text-gray-500">
            Vragen? Neem contact op via{' '}
            <a href="mailto:support@adspersoneelapp.nl" className="text-purple-400 hover:text-purple-300">
              support@adspersoneelapp.nl
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
