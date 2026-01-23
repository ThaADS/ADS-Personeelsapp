/**
 * Spinner Loading Components
 * Various spinner styles for different use cases
 */

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

/**
 * Basic spinner using Lucide icon
 */
export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin text-muted-foreground",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Centered spinner for full-section loading
 */
export function SpinnerCentered({
  size = "lg",
  text,
  className,
}: SpinnerProps & { text?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Spinner size={size} />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * Full page loading spinner
 */
export function FullPageSpinner({ text = "Laden..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <SpinnerCentered size="xl" text={text} />
    </div>
  );
}

/**
 * Inline spinner for buttons and small elements
 */
export function InlineSpinner({
  className,
}: {
  className?: string;
}) {
  return <Spinner size="sm" className={className} />;
}

/**
 * Button with loading state
 */
export function ButtonSpinner() {
  return <Spinner size="sm" className="mr-2" />;
}

/**
 * Card loading overlay
 */
export function CardLoadingOverlay({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-lg">
          <Spinner size="lg" />
        </div>
      )}
    </div>
  );
}

/**
 * Table loading state
 */
export function TableLoadingState({
  colSpan = 4,
  rows = 3,
}: {
  colSpan?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td colSpan={colSpan} className="p-4">
            <div className="h-4 bg-muted rounded w-full" />
          </td>
        </tr>
      ))}
    </>
  );
}

/**
 * Empty state with loading support
 */
export function LoadingOrEmpty({
  isLoading,
  isEmpty,
  loadingText = "Laden...",
  emptyTitle = "Geen data",
  emptyDescription = "Er zijn geen items om weer te geven.",
  emptyAction,
  children,
}: {
  isLoading: boolean;
  isEmpty: boolean;
  loadingText?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <SpinnerCentered text={loadingText} />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-foreground">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground mt-1">{emptyDescription}</p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return <>{children}</>;
}
