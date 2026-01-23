'use client';

/**
 * Reusable Error Boundary Component
 * Use this to wrap specific sections of your app that might fail
 */

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showReset?: boolean;
  title?: string;
  description?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="p-6 rounded-lg border border-destructive/20 bg-destructive/5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">
                {this.props.title || 'Er ging iets mis'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {this.props.description ||
                  'Dit onderdeel kon niet worden geladen. Probeer het opnieuw of vernieuw de pagina.'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <p className="text-xs font-mono text-destructive mt-2">
                  {this.state.error.message}
                </p>
              )}
              {this.props.showReset !== false && (
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Probeer opnieuw
                </Button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper for async components with suspense-like error handling
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Simple inline error display for smaller components
 */
interface InlineErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function InlineError({ message, onRetry }: InlineErrorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-destructive p-2 rounded bg-destructive/10">
      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
      <span>{message || 'Er is een fout opgetreden'}</span>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className="ml-auto h-6 px-2"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
