"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { RoleBadge } from "@/components/status-badge";
import { OrgSwitcher } from "@/components/org-switcher";
import type { MembershipWithOrg } from "@/lib/context";
import type { Organization, Role } from "@/lib/types";

interface AppNavProps {
  org: Organization;
  role: Role;
  memberships: MembershipWithOrg[];
  fullName: string | null;
  unreadCount: number;
  pendingCount: number;
}

export function AppNav({ org, role, memberships, fullName, unreadCount, pendingCount }: AppNavProps) {
  const pathname = usePathname();
  const isApprover = role === "approver" || role === "admin";
  const isAdmin = role === "admin";

  const links: { href: string; label: string; badge?: number }[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/requests", label: "My requests" },
    { href: "/requests/new", label: "New request" },
    ...(isApprover ? [{ href: "/queue", label: "Approval queue", badge: pendingCount }] : []),
    ...(isAdmin ? [{ href: "/members", label: "Members" }] : []),
    ...(isAdmin ? [{ href: "/settings", label: "Settings" }] : []),
    { href: "/activity", label: "Activity" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-base font-semibold tracking-tight text-slate-900">
            Approvals
          </Link>
          <OrgSwitcher current={org} memberships={memberships} />
          <RoleBadge role={role} />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="hidden text-right text-xs sm:block">
            <div className="font-medium text-slate-700">{fullName ?? "You"}</div>
          </div>
          <form action="/auth/signout" method="post">
            <button className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2">
        {links.map((l) => {
          const active = pathname === l.href || (l.href !== "/dashboard" && pathname.startsWith(l.href));
          return (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800",
              )}
            >
              {l.label}
              {typeof l.badge === "number" && l.badge > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  {l.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
