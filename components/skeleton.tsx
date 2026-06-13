import { clsx } from "clsx";

/**
 * Skeleton primitives. Each route owns a `loading.tsx` that composes these into
 * a placeholder mirroring its real content, so the Suspense fallback matches the
 * page that's loading instead of a generic shimmer. Uses the `.skeleton` shimmer
 * defined in globals.css (parchment pan, no elevation — on brand).
 */

export function Skel({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} />;
}

/** Mirrors <PageHeader>: eyebrow · title · optional description · optional action. */
export function SkeletonPageHeader({
  description = true,
  actions = false,
}: {
  description?: boolean;
  actions?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2.5">
        <Skel className="h-3 w-24" />
        <Skel className="h-8 w-60 max-w-full" />
        {description && <Skel className="h-4 w-80 max-w-full" />}
      </div>
      {actions && <Skel className="h-11 w-40 shrink-0 rounded-full" />}
    </div>
  );
}

/**
 * Mirrors <RequestList>: stacked cards below lg, the ledger table at lg+ — the
 * same breakpoint the real list switches at, so the skeleton never reflows into
 * a different shape than what loads.
 */
export function SkeletonRequestList({
  rows = 5,
  showRequester = false,
  reviewable = false,
}: {
  rows?: number;
  showRequester?: boolean;
  reviewable?: boolean;
}) {
  const items = Array.from({ length: rows });
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-cream" aria-hidden>
      {/* mobile / tablet: stacked cards */}
      <ul className="divide-y divide-mist/70 lg:hidden">
        {items.map((_, i) => (
          <li key={i} className="flex flex-col gap-2.5 px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <Skel className="h-4 w-40 max-w-[60vw]" />
                <Skel className="h-3 w-24" />
              </div>
              <Skel className="h-7 w-24 shrink-0 rounded-md" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Skel className="h-4 w-20" />
              <Skel className="h-3 w-12" />
            </div>
          </li>
        ))}
      </ul>

      {/* lg+: the ledger table */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-4 border-b border-mist px-4 py-3">
          <Skel className="h-2.5 w-16" />
          {showRequester && <Skel className="h-2.5 w-16" />}
          <Skel className="ml-auto h-2.5 w-14" />
          <Skel className="h-2.5 w-12" />
          <Skel className="h-2.5 w-12" />
        </div>
        <div className="divide-y divide-mist/70">
          {items.map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <div className="min-w-0 flex-1 space-y-2">
                <Skel className="h-4 w-44" />
                <Skel className="h-3 w-20" />
              </div>
              {showRequester && <Skel className="h-4 w-28" />}
              <Skel className="h-4 w-16" />
              <Skel className="h-7 w-24 rounded-md" />
              <Skel className="h-3 w-12" />
              {reviewable && <Skel className="h-8 w-20 rounded-full" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A form-shaped card body: N labelled fields + a submit button. */
export function SkeletonForm({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skel className="h-2.5 w-24" />
          <Skel className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <div className="flex justify-end pt-1">
        <Skel className="h-11 w-36 rounded-full" />
      </div>
    </div>
  );
}
