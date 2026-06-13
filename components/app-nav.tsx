"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { RoleBadge } from "@/components/status-badge";
import { OrgSwitcher } from "@/components/org-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { BrandMark } from "@/components/brand-mark";
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

type NavLink = { href: string; label: string; icon: keyof typeof ICONS; badge?: number; badgeTone?: "accent" };
type NavGroup = { heading?: string; links: NavLink[] };

export function AppNav({ org, role, memberships, fullName, unreadCount, pendingCount }: AppNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isApprover = role === "approver" || role === "admin";
  const isAdmin = role === "admin";
  const close = () => setOpen(false);

  const groups: NavGroup[] = [
    {
      links: [
        { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
        { href: "/requests", label: "My requests", icon: "requests" },
        { href: "/requests/new", label: "New request", icon: "plus" },
      ],
    },
    ...(isApprover
      ? [
          {
            heading: "Review",
            links: [
              {
                href: "/queue",
                label: "Approval queue",
                icon: "queue" as const,
                badge: pendingCount,
                badgeTone: "accent" as const,
              },
            ],
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            heading: "Administration",
            links: [
              { href: "/members", label: "Members", icon: "members" as const },
              { href: "/settings", label: "Settings", icon: "settings" as const },
            ],
          },
        ]
      : []),
    { heading: "Audit", links: [{ href: "/activity", label: "Activity", icon: "activity" }] },
  ];

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const nav = (
    <nav onClick={close} className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-4">
      {groups.map((group, gi) => (
        <div key={group.heading ?? gi} className="space-y-1">
          {group.heading && (
            <p className="px-3 pb-1 text-2xs font-semibold uppercase tracking-wider text-sidebar-muted/80">
              {group.heading}
            </p>
          )}
          {group.links.map((link) => {
            const active = isActive(link.href);
            const Icon = ICONS[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-sidebar-active text-sidebar-ink"
                    : "text-sidebar-muted hover:bg-sidebar-2 hover:text-sidebar-ink",
                )}
              >
                <Icon
                  className={clsx(
                    "h-[1.05rem] w-[1.05rem] shrink-0 transition-colors",
                    active ? "text-accent-bright" : "text-sidebar-muted group-hover:text-sidebar-ink",
                  )}
                />
                <span className="flex-1 truncate">{link.label}</span>
                {typeof link.badge === "number" && link.badge > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-2xs font-semibold tabular text-accent-contrast">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const header = (
    <div className="flex flex-col gap-3 border-b border-sidebar-line px-4 py-4">
      <Link href="/dashboard" className="inline-flex items-center gap-2.5 text-sidebar-ink">
        <BrandMark className="h-8 w-8" />
        <span className="text-base font-semibold tracking-tight">Approvals</span>
      </Link>
      <div className="flex items-center justify-between gap-2">
        <OrgSwitcher current={org} memberships={memberships} />
        <RoleBadge role={role} />
      </div>
    </div>
  );

  const footer = (
    <div className="mt-auto border-t border-sidebar-line px-3 py-3">
      <Link
        href="/notifications"
        onClick={close}
        aria-current={isActive("/notifications") ? "page" : undefined}
        className={clsx(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
          isActive("/notifications")
            ? "bg-sidebar-active text-sidebar-ink"
            : "text-sidebar-muted hover:bg-sidebar-2 hover:text-sidebar-ink",
        )}
      >
        <span className="relative">
          <ICONS.bell className="h-[1.05rem] w-[1.05rem]" />
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-3xs font-semibold tabular text-accent-contrast">
              {unreadCount}
            </span>
          )}
        </span>
        <span className="flex-1">Notifications</span>
      </Link>

      <div className="mt-2 flex items-center gap-2 rounded-md px-3 py-2">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sidebar-2 text-xs font-semibold text-sidebar-ink">
          {initials(fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sidebar-ink">{fullName ?? "You"}</p>
        </div>
        <ThemeToggle />
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-muted transition-colors duration-150 hover:bg-sidebar-2 hover:text-sidebar-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ICONS.signout className="h-[1.05rem] w-[1.05rem]" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-[40] flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur md:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-ink">
          <BrandMark className="h-7 w-7" />
          <span className="text-base font-semibold tracking-tight">Approvals</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
          >
            <ICONS.bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-3xs font-semibold tabular text-accent-contrast">
                {unreadCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-ink hover:bg-surface-2"
          >
            <ICONS.menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx(
          "fixed inset-0 z-[60] md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={clsx(
            "absolute inset-0 bg-black/50 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={clsx(
            "absolute inset-y-0 left-0 flex w-[17rem] max-w-[85%] flex-col bg-sidebar text-sidebar-ink shadow-lg transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-sidebar-line px-4 py-3">
            <span className="inline-flex items-center gap-2 text-sidebar-ink">
              <BrandMark className="h-7 w-7" />
              <span className="text-base font-semibold tracking-tight">Approvals</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sidebar-muted hover:bg-sidebar-2 hover:text-sidebar-ink"
            >
              <ICONS.close className="h-5 w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 border-b border-sidebar-line px-4 py-3">
            <OrgSwitcher current={org} memberships={memberships} />
            <RoleBadge role={role} />
          </div>
          {nav}
          {footer}
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-[40] hidden w-60 flex-col bg-sidebar text-sidebar-ink md:flex">
        {header}
        {nav}
        {footer}
      </aside>
    </>
  );
}

function initials(name: string | null): string {
  if (!name) return "·";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

/* ── Icons — one consistent 20px stroke set ──────────────────────────────── */
type IconProps = { className?: string };
const s = (children: React.ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        {children}
      </svg>
    );
  };

const ICONS = {
  dashboard: s(
    <>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
      <rect x="13.5" y="11" width="7.5" height="10" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </>,
  ),
  requests: s(
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>,
  ),
  plus: s(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>,
  ),
  queue: s(
    <>
      <path d="M3 7l2-3h14l2 3" />
      <path d="M3 7v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" />
      <path d="M3 12h5l1.5 2.5h5L16 12h5" />
    </>,
  ),
  members: s(
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" />
    </>,
  ),
  settings: s(
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V22a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1.8a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 3.6 5.6l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9 3.9V3.8a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.1.9Z" />
    </>,
  ),
  activity: s(<path d="M3 12h4l2.5 7 5-15L17 12h4" />),
  bell: s(
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
    </>,
  ),
  signout: s(
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>,
  ),
  menu: s(<path d="M4 7h16M4 12h16M4 17h16" />),
  close: s(<path d="M6 6l12 12M18 6 6 18" />),
};
