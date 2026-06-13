import { Skel, SkeletonPageHeader, SkeletonRequestList } from "@/components/skeleton";

export default function AllRequestsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading all requests">
      <SkeletonPageHeader />
      {/* status filter pills — scrollable row on phones, wrap on sm+ */}
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {["w-14", "w-20", "w-24", "w-20", "w-24"].map((w, i) => (
          <Skel key={i} className={`h-9 shrink-0 rounded-full ${w}`} />
        ))}
      </div>
      <SkeletonRequestList rows={6} showRequester />
    </div>
  );
}
