export default function ProfileLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-32 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-white/5 rounded" />
      </div>

      {/* Profile card */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 mb-6">
        <div className="flex items-center gap-6 mb-6">
          <div className="h-24 w-24 bg-white/10 rounded-full" />
          <div>
            <div className="h-6 w-40 bg-white/10 rounded mb-2" />
            <div className="h-4 w-32 bg-white/5 rounded mb-1" />
            <div className="h-4 w-24 bg-white/5 rounded" />
          </div>
        </div>

        {/* Form fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 bg-white/10 rounded mb-2" />
              <div className="h-10 w-full bg-white/5 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <div className="h-10 w-32 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Security section */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="h-6 w-32 bg-white/10 rounded mb-4" />

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-lg bg-white/5">
            <div>
              <div className="h-4 w-40 bg-white/10 rounded mb-1" />
              <div className="h-3 w-56 bg-white/5 rounded" />
            </div>
            <div className="h-9 w-28 bg-white/10 rounded-lg" />
          </div>

          <div className="flex justify-between items-center p-4 rounded-lg bg-white/5">
            <div>
              <div className="h-4 w-48 bg-white/10 rounded mb-1" />
              <div className="h-3 w-64 bg-white/5 rounded" />
            </div>
            <div className="h-9 w-28 bg-white/10 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
