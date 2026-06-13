import { Skel, SkeletonPageHeader } from "@/components/skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading activity">
      <SkeletonPageHeader />
      <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl border border-mist bg-cream">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="flex min-w-0 items-start gap-3">
              <Skel className="mt-1.5 h-2 w-2 rounded-full" />
              <Skel className="h-4 w-64 max-w-[60vw]" />
            </div>
            <Skel className="h-3 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
