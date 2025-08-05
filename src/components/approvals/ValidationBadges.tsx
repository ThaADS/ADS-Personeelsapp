"use client";

import { useState } from "react";
import { ValidationWarning, ValidationError } from "@/types/approval";

interface ValidationBadgesProps {
  warnings: ValidationWarning[];
  errors: ValidationError[];
}

export default function ValidationBadges({ warnings, errors }: ValidationBadgesProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (warnings.length === 0 && errors.length === 0) {
    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
        Geen problemen
      </span>
    );
  }

  return (
    <div className="space-y-1">
      {errors.length > 0 && (
        <div className="relative">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
          >
            {errors.length} {errors.length === 1 ? "fout" : "fouten"}
          </button>
          
          {showDetails && errors.length > 0 && (
            <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg p-2 border border-gray-200">
              <h4 className="font-semibold text-xs text-red-800 mb-1">Fouten:</h4>
              <ul className="text-xs text-gray-700 list-disc pl-4">
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
            className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
          >
            {warnings.length} {warnings.length === 1 ? "waarschuwing" : "waarschuwingen"}
          </button>
          
          {showDetails && warnings.length > 0 && (
            <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg p-2 border border-gray-200">
              <h4 className="font-semibold text-xs text-yellow-800 mb-1">Waarschuwingen:</h4>
              <ul className="text-xs text-gray-700 list-disc pl-4">
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
