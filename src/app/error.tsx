'use client';

/**
 * Global Error Boundary for Next.js App Router
 * Catches unhandled errors and displays a user-friendly error page
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service (production)
    console.error('Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Er is iets misgegaan
          </h1>
          <p className="text-muted-foreground">
            We hebben een onverwachte fout ondervonden. Onze excuses voor het ongemak.
          </p>
        </div>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted rounded-lg p-4 text-left">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Fout ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            variant="default"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Probeer opnieuw
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 h-10 px-4 py-2 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Terug naar dashboard
          </Link>
        </div>

        {/* Support Link */}
        <p className="text-sm text-muted-foreground">
          Blijft het probleem aanhouden?{' '}
          <Link href="/support" className="text-primary hover:underline">
            Neem contact op met support
          </Link>
        </p>
      </div>
    </div>
  );
}
