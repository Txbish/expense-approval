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
      <span className="truncate text-sm font-medium text-sidebar-ink" title={current.name}>
        {current.name}
      </span>
    );
  }

  return (
    <select
      disabled={pending}
      value={current.id}
      onChange={(e) => start(() => switchOrg(e.target.value))}
      className="min-w-0 max-w-full truncate rounded-md border border-sidebar-line bg-sidebar-2 px-2 py-1 text-sm font-medium text-sidebar-ink outline-none transition-colors hover:border-sidebar-muted focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
      aria-label="Switch organization"
    >
      {memberships.map((m) => (
        <option key={m.org_id} value={m.org_id} className="bg-surface text-ink">
          {m.organizations.name}
        </option>
      ))}
    </select>
  );
}
