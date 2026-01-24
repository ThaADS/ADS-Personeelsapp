'use client';

import { useEffect, useState } from 'react';
import { PWAInstallPrompt, useServiceWorker } from './PWAInstallPrompt';
import { useToast } from '@/components/ui/toast';

interface PWAProviderProps {
  children: React.ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const { updateAvailable, update } = useServiceWorker();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const toast = useToast();

  // Show update notification when available
  useEffect(() => {
    if (updateAvailable) {
      setShowUpdateBanner(true);
      toast?.info('Update beschikbaar', 'Er is een nieuwe versie van de app beschikbaar.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateAvailable]);

  return (
    <>
      {children}

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Update Banner */}
      {showUpdateBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-sm font-medium">
              Er is een nieuwe versie beschikbaar!
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowUpdateBanner(false)}
                className="px-3 py-1 text-sm hover:bg-white/10 rounded-lg transition-colors"
              >
                Later
              </button>
              <button
                onClick={update}
                className="px-4 py-1 text-sm bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Nu updaten
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
