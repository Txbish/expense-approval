"use client";

import { useTransition } from "react";
import { switchOrg } from "@/app/(app)/actions";
import type { MembershipWithOrg } from "@/lib/context";
import type { Organization } from "@/lib/types";

export function OrgSwitcher({
  current,
  memberships,
}: {
  current: Organization;
  memberships: MembershipWithOrg[];
}) {
  const [pending, start] = useTransition();

  if (memberships.length <= 1) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-mist bg-parchment px-3 py-2">
        <OrgGlyph />
        <span className="truncate text-sm font-medium text-ink" title={current.name}>
          {current.name}
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <OrgGlyph className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" />
      <select
        disabled={pending}
        value={current.id}
        onChange={(e) => start(() => switchOrg(e.target.value))}
        className="w-full min-w-0 truncate appearance-none rounded-lg border border-mist bg-parchment py-2 pl-9 pr-9 text-sm font-medium text-ink outline-none transition-colors hover:border-storm/30 focus-visible:border-blue focus-visible:ring-2 focus-visible:ring-blue/30 disabled:opacity-60"
        aria-label="Switch organization"
      >
        {memberships.map((m) => (
          <option key={m.org_id} value={m.org_id} className="bg-cream text-ink">
            {m.organizations.name}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-storm/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  );
}

function OrgGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 text-storm/60 ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17h14M5 17V6l5-3 5 3v11M9 8h2M9 11h2M9 14h2" />
    </svg>
  );
}
