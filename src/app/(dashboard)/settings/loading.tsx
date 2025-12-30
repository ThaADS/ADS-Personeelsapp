export default function SettingsLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-40 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-white/5 rounded" />
      </div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* General settings */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />

          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <div>
                  <div className="h-4 w-32 bg-white/10 rounded mb-1" />
                  <div className="h-3 w-48 bg-white/5 rounded" />
                </div>
                <div className="h-6 w-12 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Notification settings */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="h-6 w-36 bg-white/10 rounded mb-4" />

          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/10 rounded" />
                  <div>
                    <div className="h-4 w-36 bg-white/10 rounded mb-1" />
                    <div className="h-3 w-52 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-6 w-12 bg-white/10 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Language settings */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="h-6 w-24 bg-white/10 rounded mb-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="h-4 w-16 bg-white/10 rounded mb-2" />
              <div className="h-10 w-full bg-white/5 rounded-lg" />
            </div>
            <div>
              <div className="h-4 w-20 bg-white/10 rounded mb-2" />
              <div className="h-10 w-full bg-white/5 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
