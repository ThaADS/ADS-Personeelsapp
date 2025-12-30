export default function TimesheetLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-40 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-white/5 rounded" />
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-40 bg-white/10 rounded-lg" />
        <div className="h-10 w-40 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
      </div>

      {/* Calendar/Table view */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        {/* Week header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-6 bg-white/10 rounded" />
          ))}
        </div>

        {/* Time entries */}
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-16 bg-white/5 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className="h-4 w-24 bg-white/10 rounded mb-2" />
            <div className="h-6 w-16 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
