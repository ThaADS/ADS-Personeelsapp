"use client";

interface ApprovalTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  counts: {
    all: number;
    timesheet: number;
    vacation: number;
    sickleave: number;
  };
}

export default function ApprovalTabs({ activeTab, setActiveTab, counts }: ApprovalTabsProps) {
  return (
    <div className="border-b border-white/20 dark:border-purple-500/20">
      <nav className="-mb-px flex overflow-x-auto" aria-label="Tabs">
        <button
          onClick={() => setActiveTab("all")}
          className={`${
            activeTab === "all"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
              : "border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300"
          } flex-1 min-w-0 py-4 px-1 text-center border-b-2 font-medium text-sm min-h-[44px] transition-colors`}
        >
          Alle ({counts.all})
        </button>
        <button
          onClick={() => setActiveTab("timesheet")}
          className={`${
            activeTab === "timesheet"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
              : "border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300"
          } flex-1 min-w-0 py-4 px-1 text-center border-b-2 font-medium text-sm min-h-[44px] transition-colors`}
        >
          Tijdregistraties ({counts.timesheet})
        </button>
        <button
          onClick={() => setActiveTab("vacation")}
          className={`${
            activeTab === "vacation"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
              : "border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300"
          } flex-1 min-w-0 py-4 px-1 text-center border-b-2 font-medium text-sm min-h-[44px] transition-colors`}
        >
          Vakanties ({counts.vacation})
        </button>
        <button
          onClick={() => setActiveTab("sickleave")}
          className={`${
            activeTab === "sickleave"
              ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
              : "border-transparent text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300"
          } flex-1 min-w-0 py-4 px-1 text-center border-b-2 font-medium text-sm min-h-[44px] transition-colors`}
        >
          Ziekmeldingen ({counts.sickleave})
        </button>
      </nav>
    </div>
  );
}
