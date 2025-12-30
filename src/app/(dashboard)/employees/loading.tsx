export default function EmployeesLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 w-40 bg-white/10 rounded-lg mb-2" />
          <div className="h-4 w-48 bg-white/5 rounded" />
        </div>
        <div className="h-10 w-44 bg-white/10 rounded-lg" />
      </div>

      {/* Search and filters */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 flex-1 max-w-md bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
        <div className="h-10 w-32 bg-white/10 rounded-lg" />
      </div>

      {/* Employee table */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b border-white/10 bg-white/5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-4 bg-white/10 rounded" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y divide-white/5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/10 rounded-full" />
                <div className="h-4 w-24 bg-white/10 rounded" />
              </div>
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-4 bg-white/5 rounded" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-white/10 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
