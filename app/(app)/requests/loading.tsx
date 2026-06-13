import { SkeletonPageHeader, SkeletonRequestList } from "@/components/skeleton";

export default function MyRequestsLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your requests">
      <SkeletonPageHeader actions />
      <SkeletonRequestList rows={5} />
    </div>
  );
}
