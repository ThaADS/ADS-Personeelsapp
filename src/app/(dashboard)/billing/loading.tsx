export default function BillingLoading() {
  return (
    <div className="min-h-screen p-4 md:p-6 animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="h-8 w-32 bg-white/10 rounded-lg mb-2" />
        <div className="h-4 w-56 bg-white/5 rounded" />
      </div>

      {/* Current plan card */}
      <div className="rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="h-4 w-24 bg-white/10 rounded mb-2" />
            <div className="h-8 w-40 bg-white/10 rounded mb-3" />
            <div className="h-4 w-48 bg-white/5 rounded" />
          </div>
          <div className="h-10 w-32 bg-white/10 rounded-lg" />
        </div>
      </div>

      {/* Billing details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Payment method */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="h-6 w-40 bg-white/10 rounded mb-4" />
          <div className="flex items-center gap-4">
            <div className="h-12 w-16 bg-white/10 rounded" />
            <div>
              <div className="h-4 w-32 bg-white/10 rounded mb-1" />
              <div className="h-3 w-24 bg-white/5 rounded" />
            </div>
          </div>
        </div>

        {/* Billing address */}
        <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
          <div className="h-6 w-32 bg-white/10 rounded mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-48 bg-white/10 rounded" />
            <div className="h-4 w-40 bg-white/5 rounded" />
            <div className="h-4 w-36 bg-white/5 rounded" />
          </div>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-6">
        <div className="h-6 w-28 bg-white/10 rounded mb-4" />

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-white/10 rounded" />
                <div>
                  <div className="h-4 w-32 bg-white/10 rounded mb-1" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-20 bg-white/10 rounded" />
                <div className="h-6 w-16 bg-green-500/20 rounded-full" />
                <div className="h-8 w-8 bg-white/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
