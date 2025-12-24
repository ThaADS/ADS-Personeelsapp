"use client";

import { StatusBadge } from "./StatusBadge";

interface SickLeave {
  id: string;
  startDate: string;
  endDate: string | null;
  reason: string | null;
  status: string;
  createdAt: string;
}

interface SickLeaveCardProps {
  sickLeave: SickLeave;
  onDetailsClick?: (id: string) => void;
}

export function SickLeaveCard({ sickLeave, onDetailsClick }: SickLeaveCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDays = () => {
    if (!sickLeave.endDate) return null;
    const start = new Date(sickLeave.startDate);
    const end = new Date(sickLeave.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const days = calculateDays();
  const isOngoing = !sickLeave.endDate;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🏥</span>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              Ziekmelding
            </div>
            {isOngoing && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                Nog actief
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={sickLeave.status} />
      </div>

      {/* Date Info */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">Start</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(sickLeave.startDate)}
            </div>
          </div>
          {sickLeave.endDate && (
            <>
              <svg
                className="w-5 h-5 text-gray-400 mx-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
              <div className="text-center flex-1">
                <div className="text-xs text-gray-600 dark:text-gray-400">Einde</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(sickLeave.endDate)}
                </div>
              </div>
            </>
          )}
        </div>
        {days !== null && (
          <div className="text-center mt-2">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {days}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
              {days === 1 ? "dag" : "dagen"}
            </span>
          </div>
        )}
        {isOngoing && (
          <div className="text-center mt-2">
            <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
              Duur nog onbekend
            </span>
          </div>
        )}
      </div>

      {/* Reason */}
      {sickLeave.reason && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reden</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {sickLeave.reason}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Gemeld op {new Date(sickLeave.createdAt).toLocaleDateString("nl-NL")}
        </div>
        {onDetailsClick && (
          <button
            onClick={() => onDetailsClick(sickLeave.id)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium text-sm flex items-center min-h-[44px] px-3"
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
        )}
      </div>
    </div>
  );
}
