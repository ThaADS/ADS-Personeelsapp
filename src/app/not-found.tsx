'use client';

/**
 * Global 404 Not Found Page
 */

import { Button } from '@/components/ui/button';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl font-semibold text-foreground">
            Pagina niet gevonden
          </h2>
          <p className="text-muted-foreground">
            De pagina die je zoekt bestaat niet of is verplaatst.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 h-10 px-4 py-2">
            <Home className="w-4 h-4 mr-2" />
            Naar dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800 h-10 px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ga terug
          </button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground">
          Hulp nodig?{' '}
          <Link href="/support" className="text-primary hover:underline">
            Neem contact op
          </Link>
        </p>
      </div>
    </div>
  );
}
