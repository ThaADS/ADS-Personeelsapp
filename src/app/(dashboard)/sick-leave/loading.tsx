export default function SickLeaveLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-40 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-56 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-36 bg-white/10 rounded-lg" />
      </div>

      {/* Active sick leave card */}
      <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 backdrop-blur-sm border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-white/10 rounded-full" />
          <div className="flex-1">
            <div className="h-5 w-48 bg-white/10 rounded mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded" />
          </div>
          <div className="h-10 w-28 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-4"
          >
            <div className="h-4 w-20 bg-white/10 rounded mb-2" />
            <div className="h-8 w-12 bg-white/10 rounded" />
          </div>
        ))}
      </div>

      {/* History list */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <div className="h-10 w-10 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-white/10 rounded mb-1" />
                <div className="h-3 w-28 bg-white/5 rounded" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
