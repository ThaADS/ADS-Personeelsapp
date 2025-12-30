"use client";

import { useState } from "react";
import { ValidationWarning, ValidationError } from "@/types/approval";

interface ValidationBadgesProps {
  warnings: ValidationWarning[];
  errors: ValidationError[];
  compact?: boolean;
}

export default function ValidationBadges({ warnings, errors, compact = false }: ValidationBadgesProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (warnings.length === 0 && errors.length === 0) {
    if (compact) {
      return (
        <span className="inline-flex items-center text-green-600 dark:text-green-400" title="Geen problemen">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      );
    }
    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400">
        Geen problemen
      </span>
    );
  }

  // Compact mode - just show icons with counts
  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {errors.length > 0 && (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400"
            title={errors.map(e => e.message).join(', ')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {errors.length}
          </span>
        )}
        {warnings.length > 0 && (
          <span
            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400"
            title={warnings.map(w => w.message).join(', ')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {warnings.length}
          </span>
        )}
      </div>
    );
  }

  // Full mode with expandable details
  return (
    <div className="space-y-1">
      {errors.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400"
          >
            {errors.length} {errors.length === 1 ? "fout" : "fouten"}
          </button>

          {showDetails && errors.length > 0 && (
            <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 border border-gray-200 dark:border-purple-500/20">
              <h4 className="font-semibold text-xs text-red-800 dark:text-red-400 mb-1">Fouten:</h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc pl-4">
                {errors.map((error, index) => (
                  <li key={`error-${index}`}>{error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 dark:bg-amber-500/20 text-yellow-800 dark:text-amber-400"
          >
            {warnings.length} {warnings.length === 1 ? "waarschuwing" : "waarschuwingen"}
          </button>

          {showDetails && warnings.length > 0 && (
            <div className="absolute z-10 mt-1 w-64 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 border border-gray-200 dark:border-purple-500/20">
              <h4 className="font-semibold text-xs text-yellow-800 dark:text-amber-400 mb-1">Waarschuwingen:</h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 list-disc pl-4">
                {warnings.map((warning, index) => (
                  <li key={`warning-${index}`}>{warning.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
