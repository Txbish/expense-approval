import { Skel, SkeletonRequestList } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading dashboard">
      {/* header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2.5">
          <Skel className="h-3 w-56 max-w-full" />
          <Skel className="h-8 w-60 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skel className="h-11 flex-1 rounded-full sm:w-36 sm:flex-none" />
          <Skel className="h-11 flex-1 rounded-full sm:w-40 sm:flex-none" />
        </div>
      </div>

      {/* stat tiles */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2.5 rounded-xl bg-parchment px-3 py-2.5">
            <Skel className="h-2.5 w-16" />
            <Skel className="h-5 w-20" />
          </div>
        ))}
      </div>

      {/* latest activity */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-3">
          <div className="space-y-1.5">
            <Skel className="h-2.5 w-16" />
            <Skel className="h-6 w-40" />
          </div>
          <Skel className="h-2.5 w-24" />
        </div>
        <SkeletonRequestList rows={6} showRequester />
      </div>

      {/* quick actions */}
      <div className="space-y-3">
        <Skel className="h-2.5 w-24" />
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skel key={i} className="h-10 rounded-xl sm:flex-1" />
          ))}
        </div>
      </div>
    </div>
  );
}
