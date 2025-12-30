"use client";

interface GPSIndicatorProps {
  hasData: boolean;
  showLabel?: boolean;
}

export function GPSIndicator({ hasData, showLabel = true }: GPSIndicatorProps) {
  if (hasData) {
    return (
      <span className="flex items-center px-2 py-1 rounded-lg backdrop-blur-sm bg-green-500/10 dark:bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
        <svg
          className="h-4 w-4 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
            clipRule="evenodd"
          />
        </svg>
        {showLabel && <span className="text-xs font-medium">GPS geverifieerd</span>}
      </span>
    );
  }

  return (
    <span className="flex items-center px-2 py-1 rounded-lg backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 text-gray-400 dark:text-gray-500">
      <svg
        className="h-4 w-4 mr-1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          clipRule="evenodd"
        />
      </svg>
      {showLabel && <span className="text-xs">Geen GPS</span>}
    </span>
  );
}
