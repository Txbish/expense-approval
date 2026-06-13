import { clsx } from "clsx";

/* A monochrome layered mark (the aop. stacked-mountain spirit), drawn in
   currentColor so it reads ink on the cream sidebar and cream on the ink
   auth panel without any per-instance gradient. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="currentColor" role="img" aria-label="approvals">
      <path d="M11 11.5 16 8.5l5 3" strokeWidth="2.2" />
      <path d="M9 16.5 16 12.5l7 4" strokeWidth="2.2" />
      <path d="M7.5 21.5 16 16.8l8.5 4.7" strokeWidth="2.2" />
    </svg>
  );
}

export function Wordmark({ className, markClass }: { className?: string; markClass?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <BrandMark className={clsx("h-6 w-6", markClass)} />
      <span className="text-xl font-medium lowercase tracking-tight">approvals.</span>
    </span>
  );
}
