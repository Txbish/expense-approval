export default function AppLoading() {
  return (
    <div className="space-y-12" aria-busy="true" aria-label="Loading">
      <div className="space-y-3">
        <div className="skeleton h-3 w-40" />
        <div className="skeleton h-10 w-72" />
        <div className="skeleton h-4 w-80" />
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-mist bg-mist sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3 bg-cream px-6 py-5">
            <div className="skeleton h-3 w-16" />
            <div className="skeleton h-8 w-14" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-mist bg-cream">
        <div className="border-b border-mist px-4 py-3">
          <div className="skeleton h-3 w-24" />
        </div>
        <div className="divide-y divide-mist/70">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-20" />
              </div>
              <div className="skeleton h-6 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
