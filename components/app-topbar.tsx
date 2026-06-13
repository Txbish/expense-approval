"use client";

import { usePathname } from "next/navigation";
import { RoleBadge } from "@/components/status-badge";
import { NotificationsMenu } from "@/components/notifications-menu";
import type { AppNotification, Role } from "@/lib/types";

const LABELS: { test: (p: string) => boolean; label: string }[] = [
  { test: (p) => p === "/dashboard", label: "Dashboard" },
  { test: (p) => p === "/requests/new", label: "New request" },
  { test: (p) => p === "/requests/all", label: "All requests" },
  { test: (p) => p.startsWith("/requests/"), label: "Request" },
  { test: (p) => p === "/requests", label: "My requests" },
  { test: (p) => p === "/queue", label: "Approval queue" },
  { test: (p) => p === "/members", label: "Members" },
  { test: (p) => p === "/settings", label: "Settings" },
  { test: (p) => p === "/activity", label: "Activity" },
  { test: (p) => p === "/notifications", label: "Notifications" },
  { test: (p) => p === "/orgs/new", label: "Add organization" },
];

function pageLabel(pathname: string): string {
  return LABELS.find((l) => l.test(pathname))?.label ?? "Workspace";
}

function initials(name: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

export function AppTopBar({
  orgName,
  fullName,
  role,
  unreadCount,
  notifications,
}: {
  orgName: string;
  fullName: string | null;
  role: Role;
  unreadCount: number;
  notifications: AppNotification[];
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-[40] hidden h-16 items-center justify-between border-b border-mist bg-cream/85 px-8 backdrop-blur md:flex">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="max-w-[16rem] truncate text-sm font-medium text-ink" title={orgName}>
          {orgName}
        </span>
        <span className="text-mist">/</span>
        <span className="text-sm text-storm/70">{pageLabel(pathname)}</span>
      </div>

      <div className="flex items-center gap-3">
        <RoleBadge role={role} />
        <NotificationsMenu notifications={notifications} unreadCount={unreadCount} className="h-9 w-9" />
        <div className="flex items-center gap-2 border-l border-mist pl-3">
          <span
            className="grid h-8 w-8 place-items-center rounded-full bg-ink text-2xs font-semibold uppercase text-cream"
            title={fullName ?? "You"}
          >
            {initials(fullName)}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-storm/70 transition-colors hover:bg-ink/6 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
                <path d="M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
