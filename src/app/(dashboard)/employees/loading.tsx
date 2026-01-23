import {
  Skeleton,
  SkeletonPageHeader,
  SkeletonTable,
  SkeletonAvatar,
} from "@/components/ui/skeleton";

export default function EmployeesLoading() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with action button */}
      <div className="flex justify-between items-start">
        <SkeletonPageHeader />
        <Skeleton className="h-10 w-44" />
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 max-w-md" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Employee table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 p-4 border-b bg-muted/50">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-20" />
          ))}
        </div>

        {/* Table rows */}
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4 p-4 items-center">
              <div className="flex items-center gap-3">
                <SkeletonAvatar />
                <Skeleton className="h-4 w-24" />
              </div>
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
