import { Skel, SkeletonPageHeader } from "@/components/skeleton";

/**
 * Generic fallback for any (app) route without its own loading.tsx. Each route
 * ships a tailored skeleton; this neutral header-plus-panel keeps surprises
 * graceful if a new route is added without one.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <SkeletonPageHeader />
      <div className="space-y-3 rounded-2xl border border-mist bg-cream p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skel key={i} className="h-5 w-full" />
        ))}
        <Skel className="h-5 w-2/3" />
      </div>
    </div>
  );
}
