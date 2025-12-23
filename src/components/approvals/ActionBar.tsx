"use client";

interface ActionBarProps {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
}

export default function ActionBar({ selectedCount, onApprove, onReject }: ActionBarProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-black">Goedkeuringen</h1>
        <div className="flex space-x-2">
          <button
            onClick={onApprove}
            disabled={selectedCount === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              selectedCount === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            }`}
          >
            Goedkeuren ({selectedCount})
          </button>
          <button
            onClick={onReject}
            disabled={selectedCount === 0}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              selectedCount === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            }`}
          >
            Afkeuren ({selectedCount})
          </button>
        </div>
      </div>
    </div>
  );
}
