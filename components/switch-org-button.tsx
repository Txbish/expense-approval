"use client";

import { useTransition } from "react";
import { clsx } from "clsx";
import { switchOrg } from "@/app/(app)/actions";
import { Spinner } from "@/components/ui";

/** Switches the active org (optionally returning to `redirectTo`) and re-renders
    the whole app in that org. Used by the cross-org banner. */
export function SwitchOrgButton({
  orgId,
  redirectTo,
  children,
  className,
}: {
  orgId: string;
  redirectTo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => switchOrg(orgId, redirectTo))}
      className={clsx(
        "inline-flex h-9 items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-cream transition-colors duration-200 hover:bg-storm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40 disabled:opacity-60",
        className,
      )}
    >
      {pending && <Spinner />}
      {children}
    </button>
  );
}
