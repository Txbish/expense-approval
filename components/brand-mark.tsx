"use client";

import { useId } from "react";
import { clsx } from "clsx";

/* The seal mark — same geometry as the favicon (app/icon.svg). The product's
   icon and its core gesture (a sealed decision) are one and the same thing.
   The gradient id is unique per instance so multiple marks on one page (and
   marks inside hidden panels) never collide on a shared `url(#id)` reference. */
export function BrandMark({ className }: { className?: string }) {
  const gid = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Approvals">
      <defs>
        <linearGradient id={gid} x1="7" y1="4" x2="25" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-bright)" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="14" fill={`url(#${gid})`} />
      <circle cx="16" cy="16" r="10.5" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.25" />
      <path
        d="M10.5 16.4 14.3 20 21.7 11.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className, markClass }: { className?: string; markClass?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <BrandMark className={clsx("h-7 w-7", markClass)} />
      <span className="text-base font-semibold tracking-tight">Approvals</span>
    </span>
  );
}
