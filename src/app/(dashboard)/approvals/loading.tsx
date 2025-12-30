export default function ApprovalsLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-40 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-64 bg-white/5 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 w-32 bg-white/10 rounded-lg" />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-40 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
      </div>

      {/* Approval cards */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="h-5 w-40 bg-white/10 rounded mb-1" />
                    <div className="h-4 w-32 bg-white/5 rounded" />
                  </div>
                  <div className="h-6 w-20 bg-white/10 rounded-full" />
                </div>
                <div className="h-4 w-full max-w-md bg-white/5 rounded mb-3" />
                <div className="flex gap-2">
                  <div className="h-9 w-24 bg-green-500/20 rounded-lg" />
                  <div className="h-9 w-24 bg-red-500/20 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
