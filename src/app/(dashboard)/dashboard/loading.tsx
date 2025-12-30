export default function DashboardPageLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Welcome header */}
      <div className="mb-6">
        <div className="h-8 w-64 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      {/* Quick clock-in card */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-5 w-32 bg-white/10 rounded mb-2" />
            <div className="h-8 w-24 bg-white/10 rounded" />
          </div>
          <div className="h-12 w-32 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className="h-4 w-20 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded mb-1" />
            <div className="h-3 w-24 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="h-6 w-40 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="h-8 w-8 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-white/10 rounded mb-1" />
                <div className="h-3 w-32 bg-white/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
