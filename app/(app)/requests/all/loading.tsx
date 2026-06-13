import { Skel, SkeletonPageHeader, SkeletonRequestList } from "@/components/skeleton";

export default function AllRequestsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading all requests">
      <SkeletonPageHeader />
      {/* status filter pills */}
      <div className="flex flex-wrap gap-2">
        {["w-14", "w-20", "w-24", "w-20", "w-24"].map((w, i) => (
          <Skel key={i} className={`h-9 rounded-full ${w}`} />
        ))}
      </div>
      <SkeletonRequestList rows={6} showRequester />
    </div>
  );
}
