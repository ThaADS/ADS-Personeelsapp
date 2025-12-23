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
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex" aria-label="Tabs">
        <button
          onClick={() => setActiveTab("all")}
          className={`${
            activeTab === "all"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-black hover:text-blue-600 hover:border-blue-300"
          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
        >
          Alle ({counts.all})
        </button>
        <button
          onClick={() => setActiveTab("timesheet")}
          className={`${
            activeTab === "timesheet"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-black hover:text-blue-600 hover:border-blue-300"
          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
        >
          Tijdregistraties ({counts.timesheet})
        </button>
        <button
          onClick={() => setActiveTab("vacation")}
          className={`${
            activeTab === "vacation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-black hover:text-blue-600 hover:border-blue-300"
          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
        >
          Vakanties ({counts.vacation})
        </button>
        <button
          onClick={() => setActiveTab("sickleave")}
          className={`${
            activeTab === "sickleave"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-black hover:text-blue-600 hover:border-blue-300"
          } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
        >
          Ziekmeldingen ({counts.sickleave})
        </button>
      </nav>
    </div>
  );
}
