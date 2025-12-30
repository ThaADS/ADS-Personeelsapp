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
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 border border-white/20 dark:border-purple-500/20 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
      {/* Header: Date + Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {formattedDate}
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {hours}u {minutes}m
          </div>
        </div>
        <StatusBadge status={entry.status} />
      </div>

      {/* Time Details */}
      <div className="space-y-2 mb-3 backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 rounded-lg p-3">
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
        <div className="mb-3 p-3 backdrop-blur-sm bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
            Omschrijving
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {entry.description}
          </div>
        </div>
      )}

      {/* Footer: GPS + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 dark:border-purple-500/10">
        <GPSIndicator hasData={hasGpsData} />
        <button
          onClick={() => onDetailsClick(entry.id)}
          className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium text-sm flex items-center min-h-[44px] px-3"
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
