import { Skel } from "@/components/skeleton";

export default function NotificationsLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-busy="true" aria-label="Loading notifications">
      {/* header with "mark all read" action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2.5">
          <Skel className="h-3 w-16" />
          <Skel className="h-8 w-52" />
        </div>
        <Skel className="h-11 w-32 shrink-0 rounded-full" />
      </div>

      <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl border border-mist bg-cream">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-5 py-4">
            <Skel className="mt-1.5 h-2 w-2 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skel className="h-4 w-full max-w-md" />
              <Skel className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
