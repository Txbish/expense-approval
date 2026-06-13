import { SkeletonPageHeader, SkeletonRequestList } from "@/components/skeleton";

export default function QueueLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading approval queue">
      <SkeletonPageHeader />
      <SkeletonRequestList rows={4} showRequester reviewable />
    </div>
  );
}
