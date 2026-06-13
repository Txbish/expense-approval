"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { switchOrg } from "@/app/(app)/actions";
import type { MembershipWithOrg } from "@/lib/context";
import type { Organization } from "@/lib/types";

/**
 * Active-org control. A single membership is a static plate; multiple
 * memberships become a popover that lists every org (with its role), marks the
 * active one, and offers "Add organization". Selecting an org calls switchOrg,
 * which re-renders the whole app in that tenant.
 */
export function OrgSwitcher({
  current,
  memberships,
}: {
  current: Organization;
  memberships: MembershipWithOrg[];
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  const currentRole = memberships.find((m) => m.org_id === current.id)?.role ?? null;
  const multi = memberships.length > 1;

  // Close on outside pointer + Escape while open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (orgId: string) => {
    setOpen(false);
    if (orgId !== current.id) start(() => switchOrg(orgId));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => multi && setOpen((v) => !v)}
        disabled={pending || !multi}
        aria-haspopup={multi ? "menu" : undefined}
        aria-expanded={multi ? open : undefined}
        className={clsx(
          "flex w-full items-center gap-2.5 rounded-lg border border-mist bg-parchment px-3 py-2 text-left transition-colors",
          multi && "hover:border-storm/30 focus-visible:border-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/25",
          pending && "opacity-60",
          !multi && "cursor-default",
        )}
        title={current.name}
      >
        <OrgGlyph className="text-storm/60" />
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-medium text-ink">{current.name}</span>
          {currentRole && <span className="eyebrow block">{currentRole}</span>}
        </span>
        {multi && (
          <svg
            viewBox="0 0 20 20"
            className={clsx(
              "h-4 w-4 shrink-0 text-storm/55 transition-transform duration-200",
              open && "rotate-180",
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 12l4-4 4 4" />
          </svg>
        )}
      </button>

      {open && multi && (
        <div
          role="menu"
          className="absolute bottom-full left-0 right-0 z-[50] mb-2 overflow-hidden rounded-lg border border-mist bg-cream py-1 animate-scale-in origin-bottom"
        >
          <p className="eyebrow px-3 pb-1 pt-1.5">Switch organization</p>
          {memberships.map((m) => {
            const active = m.org_id === current.id;
            return (
              <button
                key={m.org_id}
                type="button"
                role="menuitem"
                onClick={() => select(m.org_id)}
                className={clsx(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  active ? "bg-ink/[0.04]" : "hover:bg-ink/6",
                )}
              >
                <OrgGlyph className={active ? "text-ink" : "text-storm/55"} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block truncate text-sm font-medium text-ink">{m.organizations.name}</span>
                  <span className="eyebrow block">{m.role}</span>
                </span>
                {active && (
                  <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-blue" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4.5 10.5 8.2 14.2 15.5 5.8" />
                  </svg>
                )}
              </button>
            );
          })}
          <div className="my-1 border-t border-mist" />
          <Link
            href="/orgs/new"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-storm/80 transition-colors hover:bg-ink/6 hover:text-ink"
          >
            <span className="flex h-5 w-5 items-center justify-center text-storm/55">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
                <path d="M10 5v10M5 10h10" />
              </svg>
            </span>
            Add organization
          </Link>
        </div>
      )}
    </div>
  );
}

function OrgGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 shrink-0 ${className ?? ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 17h14M5 17V6l5-3 5 3v11M9 8h2M9 11h2M9 14h2" />
    </svg>
  );
}
