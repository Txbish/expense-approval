import { Skel } from "@/components/skeleton";

export default function RequestDetailLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading request">
      <Skel className="h-3 w-32" /> {/* back link */}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* main column */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-card p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-2.5">
                <Skel className="h-2.5 w-20" />
                <Skel className="h-7 w-56 max-w-full" />
                <Skel className="h-3.5 w-44" />
              </div>
              <Skel className="h-7 w-24 shrink-0 rounded-md" />
            </div>
            <Skel className="mt-6 h-10 w-40" /> {/* amount */}
            <Skel className="mt-6 h-20 w-full rounded-xl" /> {/* description */}
          </div>

          <div className="rounded-2xl bg-card p-6 sm:p-8">
            <Skel className="mb-5 h-2.5 w-16" />
            <ul className="space-y-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Skel className="mt-1 h-2.5 w-2.5 rounded-full" />
                  <div className="space-y-2">
                    <Skel className="h-4 w-52 max-w-full" />
                    <Skel className="h-3 w-16" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* side column — review / status card */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl bg-card p-6">
            <Skel className="h-2.5 w-16" />
            <Skel className="h-24 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skel className="h-11 flex-1 rounded-full" />
              <Skel className="h-11 flex-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
