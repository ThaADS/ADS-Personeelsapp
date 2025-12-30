export default function VacationLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-32 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-40 bg-white/10 rounded-lg" />
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className="h-4 w-28 bg-white/10 rounded mb-3" />
            <div className="h-10 w-20 bg-white/10 rounded mb-2" />
            <div className="h-3 w-32 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Requests table */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />

        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 pb-3 border-b border-white/10 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-white/10 rounded" />
          ))}
        </div>

        {/* Table rows */}
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 py-3">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-white/5 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
