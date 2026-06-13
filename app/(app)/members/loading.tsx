import { Skel, SkeletonForm, SkeletonPageHeader } from "@/components/skeleton";

export default function MembersLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading members">
      <SkeletonPageHeader />
      <div className="grid gap-6 lg:grid-cols-3">
        {/* members list */}
        <div className="lg:col-span-2">
          <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl border border-mist bg-cream">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <Skel className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="space-y-2">
                    <Skel className="h-4 w-32" />
                    <Skel className="h-3 w-40" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Skel className="h-11 w-full max-w-[12rem] rounded-lg" />
                  <Skel className="h-4 w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* invite a member */}
        <div className="h-fit space-y-4 rounded-2xl bg-card p-6">
          <Skel className="h-6 w-36" />
          <Skel className="h-4 w-full" />
          <SkeletonForm fields={2} />
        </div>
      </div>
    </div>
  );
}
