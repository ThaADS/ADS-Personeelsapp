"use client";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          bg: "backdrop-blur-sm bg-green-500/20 dark:bg-green-500/20 border border-green-500/30",
          text: "text-green-800 dark:text-green-300",
          label: "Goedgekeurd",
        };
      case "PENDING":
        return {
          bg: "backdrop-blur-sm bg-yellow-500/20 dark:bg-yellow-500/20 border border-yellow-500/30",
          text: "text-yellow-800 dark:text-yellow-300",
          label: "In behandeling",
        };
      case "REJECTED":
        return {
          bg: "backdrop-blur-sm bg-red-500/20 dark:bg-red-500/20 border border-red-500/30",
          text: "text-red-800 dark:text-red-300",
          label: "Afgekeurd",
        };
      default:
        return {
          bg: "backdrop-blur-sm bg-white/30 dark:bg-white/5 border border-white/20 dark:border-purple-500/20",
          text: "text-gray-800 dark:text-gray-300",
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${config.bg} ${config.text} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
