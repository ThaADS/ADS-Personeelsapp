"use client";

import { StatusBadge } from "./StatusBadge";

interface VacationRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  description: string | null;
  status: string;
  createdAt: string;
}

interface VacationCardProps {
  request: VacationRequest;
  onDetailsClick?: (id: string) => void;
}

export function VacationCard({ request, onDetailsClick }: VacationCardProps) {
  const getVacationTypeConfig = (type: string) => {
    switch (type) {
      case "VACATION":
        return {
          label: "Vakantie",
          icon: "🏖️",
          bgGradient: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
        };
      case "SPECIAL":
        return {
          label: "Bijzonder verlof",
          icon: "📋",
          bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
        };
      case "UNPAID":
        return {
          label: "Onbetaald verlof",
          icon: "📝",
          bgGradient: "from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50",
        };
      default:
        return {
          label: type,
          icon: "📅",
          bgGradient: "from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50",
        };
    }
  };

  const config = getVacationTypeConfig(request.type);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 border border-white/20 dark:border-purple-500/20 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{config.icon}</span>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {config.label}
          </div>
        </div>
        <StatusBadge status={request.status} />
      </div>

      {/* Date Range */}
      <div className={`bg-gradient-to-r ${config.bgGradient} rounded-lg p-3 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-xs text-gray-600 dark:text-gray-400">Van</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(request.startDate)}
            </div>
          </div>
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
            <div className="text-xs text-gray-600 dark:text-gray-400">Tot</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDate(request.endDate)}
            </div>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {request.totalDays}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
            {request.totalDays === 1 ? "dag" : "dagen"}
          </span>
        </div>
      </div>

      {/* Description */}
      {request.description && (
        <div className="p-3 backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/10 rounded-lg mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reden</div>
          <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {request.description}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20 dark:border-purple-500/10">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Ingediend op {new Date(request.createdAt).toLocaleDateString("nl-NL")}
        </div>
        {onDetailsClick && (
          <button
            onClick={() => onDetailsClick(request.id)}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-800 font-medium text-sm flex items-center min-h-[44px] px-3"
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
