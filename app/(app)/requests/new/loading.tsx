import { Skel, SkeletonPageHeader } from "@/components/skeleton";

export default function NewRequestLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6" aria-busy="true" aria-label="Loading request form">
      <SkeletonPageHeader />
      <div className="space-y-5 rounded-2xl bg-card p-6 sm:p-8">
        {/* title */}
        <div className="space-y-2">
          <Skel className="h-2.5 w-16" />
          <Skel className="h-11 w-full rounded-lg" />
        </div>
        {/* category + amount */}
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skel className="h-2.5 w-24" />
              <Skel className="h-11 w-full rounded-lg" />
            </div>
          ))}
        </div>
        {/* justification */}
        <div className="space-y-2">
          <Skel className="h-2.5 w-28" />
          <Skel className="h-24 w-full rounded-lg" />
        </div>
        <div className="flex justify-end">
          <Skel className="h-11 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}
