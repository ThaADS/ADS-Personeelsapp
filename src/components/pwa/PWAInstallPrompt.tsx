'use client';

import { useState, useEffect, useCallback } from 'react';
import { XMarkIcon, DevicePhoneMobileIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed or in standalone mode
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsStandalone(isInStandaloneMode);

    // Don't show prompt if already installed
    if (isInStandaloneMode) {
      return;
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
    setIsIOS(isIOSDevice);

    // Check if user dismissed prompt recently (within 7 days)
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event (Chrome/Edge/etc)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show our custom prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show instructions after a delay
    if (isIOSDevice) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;

    // Show the browser's install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
  }, []);

  // Don't render if already installed or prompt not ready
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[60] animate-slide-in-from-bottom">
      <div className="backdrop-blur-xl bg-white/95 dark:bg-slate-800/95 rounded-2xl shadow-2xl border border-purple-200 dark:border-purple-500/30 p-4 sm:p-5">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Sluiten"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
              Installeer ADSPersoneelapp
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isIOS
                ? 'Voeg toe aan je startscherm voor snelle toegang'
                : 'Installeer de app voor snelle toegang en offline gebruik'
              }
            </p>

            {/* iOS Instructions */}
            {isIOS ? (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Hoe te installeren:</span>
                </p>
                <ol className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1 list-decimal list-inside">
                  <li>Tik op het deel-icoon <span className="inline-block">⬆️</span></li>
                  <li>Scroll en tik op &quot;Zet op beginscherm&quot;</li>
                  <li>Tik op &quot;Voeg toe&quot;</li>
                </ol>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Installeren
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if app is running as installed PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  return isPWA;
}

/**
 * Hook to manage service worker registration
 */
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          setRegistration(reg);

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  const update = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  return { registration, updateAvailable, update };
}
