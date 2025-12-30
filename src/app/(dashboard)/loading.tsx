export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:gap-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 h-24"
            >
              <div className="h-4 w-20 bg-white/10 rounded mb-2" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 w-full max-w-[200px] bg-white/10 rounded mb-2" />
                  <div className="h-3 w-full max-w-[150px] bg-white/5 rounded" />
                </div>
                <div className="h-8 w-20 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
