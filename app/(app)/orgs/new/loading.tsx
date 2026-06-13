import { Skel, SkeletonForm, SkeletonPageHeader } from "@/components/skeleton";

export default function NewOrgLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <Skel className="h-3 w-36" /> {/* back link */}
      <SkeletonPageHeader />
      <div className="rounded-2xl bg-card p-6 sm:p-8">
        <Skel className="mb-1 h-6 w-52" />
        <Skel className="mb-5 h-4 w-64 max-w-full" />
        <SkeletonForm fields={3} />
      </div>
      <div className="rounded-2xl bg-card p-6 sm:p-8">
        <Skel className="mb-1 h-6 w-44" />
        <Skel className="mb-5 h-4 w-72 max-w-full" />
        <SkeletonForm fields={1} />
      </div>
    </div>
  );
}
