export default function EmployeeEditLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header skeleton */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20 p-4 md:p-6">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-14 w-14 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="backdrop-blur-xl bg-white/80 dark:bg-slate-800/50 shadow-lg rounded-2xl border border-white/20 dark:border-purple-500/20">
        <div className="border-b border-white/20 dark:border-purple-500/20 p-4">
          <div className="flex gap-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/20 dark:border-purple-500/20 p-4 flex justify-end gap-3 animate-pulse">
          <div className="h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-12 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}
