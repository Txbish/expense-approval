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
    return <span className="text-sm text-slate-400">·&nbsp; {current.name}</span>;
  }

  return (
    <select
      disabled={pending}
      value={current.id}
      onChange={(e) => start(() => switchOrg(e.target.value))}
      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-slate-700 outline-none hover:bg-slate-100"
      aria-label="Switch organization"
    >
      {memberships.map((m) => (
        <option key={m.org_id} value={m.org_id}>
          {m.organizations.name}
        </option>
      ))}
    </select>
  );
}
