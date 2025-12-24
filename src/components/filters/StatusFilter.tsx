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
          return "bg-yellow-500 text-white";
        case "green":
          return "bg-green-500 text-white";
        case "red":
          return "bg-red-500 text-white";
        default:
          return "bg-gray-600 text-white";
      }
    }
    return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600";
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
                    ? "bg-white bg-opacity-30"
                    : "bg-gray-200 dark:bg-gray-600"
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
