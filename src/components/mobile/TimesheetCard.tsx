"use client";

import { StatusBadge } from "./StatusBadge";
import { GPSIndicator } from "./GPSIndicator";

interface TimesheetEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  description: string | null;
  status: string;
  startLat: number | null;
  startLng: number | null;
  endLat: number | null;
  endLng: number | null;
}

interface TimesheetCardProps {
  entry: TimesheetEntry;
  onDetailsClick: (id: string) => void;
}

export function TimesheetCard({ entry, onDetailsClick }: TimesheetCardProps) {
  const calculateWorkTime = (entry: TimesheetEntry) => {
    const startTime = new Date(`${entry.date}T${entry.startTime}`);
    const endTime = new Date(`${entry.date}T${entry.endTime}`);

    if (endTime <= startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    const totalMinutes =
      (endTime.getTime() - startTime.getTime()) / (1000 * 60) -
      (entry.breakDuration || 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.round(totalMinutes % 60);
    return { hours, minutes };
  };

  const { hours, minutes } = calculateWorkTime(entry);
  const hasGpsData = entry.startLat !== null || entry.endLat !== null;

  const formattedDate = new Date(entry.date).toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Date + Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {formattedDate}
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {hours}u {minutes}m
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Time Details */}
      <div className="space-y-2 mb-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Werktijd</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {entry.startTime} - {entry.endTime}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Pauze</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {entry.breakDuration} min
          </span>
        </div>
      </div>

      {/* Description */}
      {entry.description && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
            Omschrijving
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {entry.description}
          </div>
        </div>
      )}

      {/* Footer: GPS + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <GPSIndicator hasData={hasGpsData} />
        <button
          onClick={() => onDetailsClick(entry.id)}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm flex items-center min-h-[44px] px-3"
        >
          Details
          <svg
            className="w-4 h-4 ml-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
