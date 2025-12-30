"use client";

interface StatusFilterProps {
  value: string;
  onChange: (status: string) => void;
  counts?: {
    all?: number;
    PENDING?: number;
    APPROVED?: number;
    REJECTED?: number;
  };
}

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
  const statuses = [
    { value: "all", label: "Alle", color: "gray" },
    { value: "PENDING", label: "In behandeling", color: "yellow" },
    { value: "APPROVED", label: "Goedgekeurd", color: "green" },
    { value: "REJECTED", label: "Afgekeurd", color: "red" },
  ];

  const getButtonClasses = (status: string, color: string, isActive: boolean) => {
    if (isActive) {
      switch (color) {
        case "yellow":
          return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg";
        case "green":
          return "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg";
        case "red":
          return "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg";
        default:
          return "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg";
      }
    }
    return "backdrop-blur-sm bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-white/10";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => {
        const count = counts?.[status.value as keyof typeof counts];
        const isActive = value === status.value;

        return (
          <button
            key={status.value}
            onClick={() => onChange(status.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] flex items-center ${getButtonClasses(
              status.value,
              status.color,
              isActive
            )}`}
          >
            {status.label}
            {count !== undefined && count > 0 && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded text-xs ${
                  isActive
                    ? "bg-white/30"
                    : "backdrop-blur-sm bg-white/30 dark:bg-white/10"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
