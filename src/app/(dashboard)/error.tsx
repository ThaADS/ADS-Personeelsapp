'use client';

/**
 * Dashboard Error Boundary
 * Handles errors within the dashboard layout
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-xl">Er is een fout opgetreden</CardTitle>
          <CardDescription>
            We konden deze pagina niet laden. Dit kan een tijdelijk probleem zijn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs font-mono text-destructive break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button onClick={reset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Probeer opnieuw
            </Button>
            <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 h-10 px-4 py-2 w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar overzicht
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            Als het probleem aanhoudt, neem dan contact op met{' '}
            <Link href="/support" className="text-primary hover:underline">
              support
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
