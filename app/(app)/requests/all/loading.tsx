import { Skel, SkeletonPageHeader, SkeletonRequestList } from "@/components/skeleton";

export default function AllRequestsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading all requests">
      <SkeletonPageHeader />
      {/* status filter — a full-width filter button on phones, pill row at sm+ */}
      <Skel className="h-11 w-full rounded-full sm:hidden" />
      <div className="hidden flex-wrap gap-2 sm:flex">
        {["w-14", "w-20", "w-24", "w-20", "w-24"].map((w, i) => (
          <Skel key={i} className={`h-9 shrink-0 rounded-full ${w}`} />
        ))}
      </div>
      <SkeletonRequestList rows={6} showRequester />
    </div>
  );
}
