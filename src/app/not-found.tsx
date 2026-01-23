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
          <Button asChild variant="default">
            <Link href="/dashboard">
              <Home className="w-4 h-4 mr-2" />
              Naar dashboard
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="javascript:history.back()">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Ga terug
            </Link>
          </Button>
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
