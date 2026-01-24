'use client';

/**
 * Offline Page
 * Shown when the user is offline and the requested page isn't cached
 */

import { WifiIcon } from '@heroicons/react/24/outline';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-8 shadow-lg">
          <WifiIcon className="w-12 h-12 text-white opacity-50" />
          <div className="absolute">
            <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 rounded-2xl shadow-xl border border-white/20 dark:border-purple-500/20 p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            U bent offline
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Controleer uw internetverbinding en probeer het opnieuw.
            Sommige functies zijn mogelijk beperkt beschikbaar zonder internetverbinding.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Opnieuw proberen
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Tip: Eerder bezochte pagina&apos;s zijn mogelijk nog beschikbaar
            </p>
          </div>
        </div>

        {/* App info */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          ADSPersoneelapp werkt het beste met een actieve internetverbinding
        </p>
      </div>
    </div>
  );
}
