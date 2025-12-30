"use client";

interface ActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
}

export default function ActionBar({ selectedCount, onApprove, onReject }: ActionBarProps) {
  return (
    <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goedkeuringen</h1>
        <div className="flex space-x-2">
          <button
            onClick={onApprove}
            disabled={selectedCount === 0}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-lg text-white min-h-[44px] transition-all ${
              selectedCount === 0
                ? "backdrop-blur-sm bg-gray-400/50 dark:bg-gray-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            }`}
          >
            Goedkeuren ({selectedCount})
          </button>
          <button
            onClick={onReject}
            disabled={selectedCount === 0}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg shadow-lg text-white min-h-[44px] transition-all ${
              selectedCount === 0
                ? "backdrop-blur-sm bg-gray-400/50 dark:bg-gray-600/50 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            }`}
          >
            Afkeuren ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
