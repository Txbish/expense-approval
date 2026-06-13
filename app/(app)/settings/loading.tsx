import { SkeletonForm, SkeletonPageHeader } from "@/components/skeleton";

export default function SettingsLoading() {
  return (
    <div className="mx-auto max-w-xl space-y-6" aria-busy="true" aria-label="Loading settings">
      <SkeletonPageHeader />
      <div className="rounded-2xl bg-card p-6 sm:p-8">
        <SkeletonForm fields={3} />
      </div>
    </div>
  );
}
