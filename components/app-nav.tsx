"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { OrgSwitcher } from "@/components/org-switcher";
import { BrandMark } from "@/components/brand-mark";
import { NotificationsMenu } from "@/components/notifications-menu";
import type { MembershipWithOrg } from "@/lib/context";
import type { AppNotification, Organization, Role } from "@/lib/types";

interface AppNavProps {
  org: Organization;
  role: Role;
  memberships: MembershipWithOrg[];
  fullName: string | null;
  unreadCount: number;
  pendingCount: number;
  notifications: AppNotification[];
}

type NavLink = { href: string; label: string; icon: keyof typeof ICONS; badge?: number };
type NavGroup = { heading: string; links: NavLink[] };

export function AppNav({ org, role, memberships, fullName, unreadCount, pendingCount, notifications }: AppNavProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isApprover = role === "approver" || role === "admin";
  const isAdmin = role === "admin";
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const close = () => setOpen(false);
  // Dismiss + return focus to the trigger (for the explicit close affordances).
  const dismiss = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // While the drawer is open: Escape closes it and focus moves inside, so
  // keyboard/SR users aren't left tabbing through the page behind the scrim.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const groups: NavGroup[] = [
    {
      heading: "Workspace",
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
              { href: "/queue", label: "Approval queue", icon: "queue" as const, badge: pendingCount },
              { href: "/requests/all", label: "All requests", icon: "requests" as const },
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

  // Active = the single longest nav href that prefixes the current path, so
  // "/requests/new" lights only New request, not My requests too.
  const allHrefs = groups.flatMap((g) => g.links.map((l) => l.href));
  const activeHref = allHrefs.reduce<string | null>((best, href) => {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (!matches) return best;
    return !best || href.length > best.length ? href : best;
  }, null);
  const isActive = (href: string) => href === activeHref;

  const nav = (
    <nav onClick={close} className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-5">
      {groups.map((group) => (
        <div key={group.heading} className="space-y-1">
          <p className="mb-1.5 px-3 text-3xs font-medium uppercase tracking-[0.16em] text-storm/55">
            {group.heading}
          </p>
          {group.links.map((link) => {
            const active = isActive(link.href);
            const Icon = ICONS[link.icon];
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 pointer-coarse:py-2.5",
                  active ? "bg-ink text-cream" : "text-storm/85 hover:bg-ink/6 hover:text-ink",
                )}
              >
                <Icon
                  className={clsx(
                    "h-4 w-4 shrink-0",
                    active ? "text-cream" : "text-storm/60 group-hover:text-ink",
                  )}
                />
                <span className="flex-1 truncate">{link.label}</span>
                {typeof link.badge === "number" && link.badge > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1.5 text-2xs font-semibold tabular text-ink">
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

  const orgFooter = (
    <div className="mt-auto border-t border-mist px-4 py-4">
      <p className="mb-2 px-1 text-3xs font-medium uppercase tracking-[0.16em] text-storm/55">
        Organization
      </p>
      <OrgSwitcher current={org} memberships={memberships} />
      {/* Multi-org users get "Add organization" inside the switcher menu; for a
          single-org user the trigger has no menu, so surface it here instead. */}
      {memberships.length <= 1 && (
        <Link
          href="/orgs/new"
          onClick={close}
          className="mt-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-storm/75 transition-colors hover:bg-ink/6 hover:text-ink">
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden>
            <path d="M10 5v10M5 10h10" />
          </svg>
          Add organization
        </Link>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-[40] flex h-14 items-center justify-between border-b border-mist bg-cream/90 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] backdrop-blur md:hidden">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-ink">
          <BrandMark className="h-6 w-6" />
          <span className="text-lg font-medium lowercase tracking-tight">approvals.</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationsMenu notifications={notifications} unreadCount={unreadCount} className="h-11 w-11" />
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-ink/6"
          >
            <ICONS.menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={clsx("fixed inset-0 z-[60] md:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <div
          onClick={dismiss}
          className={clsx(
            "absolute inset-0 bg-ink/60 transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          className={clsx(
            "absolute inset-y-0 left-0 flex w-[17rem] max-w-[85%] flex-col bg-cream transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-mist px-4">
            <span className="inline-flex items-center gap-2 text-ink">
              <BrandMark className="h-6 w-6" />
              <span className="text-lg font-medium lowercase tracking-tight">approvals.</span>
            </span>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={dismiss}
              aria-label="Close menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md text-storm/70 hover:bg-ink/6 hover:text-ink"
            >
              <ICONS.close className="h-5 w-5" />
            </button>
          </div>
          {nav}
          <div className="border-t border-mist px-4 py-3">
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-storm/85 transition-colors hover:bg-ink/6 hover:text-ink"
              >
                <ICONS.signout className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
          {orgFooter}
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-[40] hidden w-64 flex-col border-r border-mist bg-cream md:flex">
        <div className="flex h-16 items-center border-b border-mist px-5">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-ink">
            <BrandMark className="h-6 w-6" />
            <span className="text-xl font-medium lowercase tracking-tight">approvals.</span>
          </Link>
        </div>
        {nav}
        {orgFooter}
      </aside>
    </>
  );
}

/* ── Icons — one consistent 1.75px stroke set ────────────────────────────── */
type IconProps = { className?: string };
const s = (children: React.ReactNode) =>
  function Icon({ className }: IconProps) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  signout: s(
    <>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 17l5-5-5-5M21 12H9" />
    </>,
  ),
  menu: s(<path d="M4 7h16M4 12h16M4 17h16" />),
  close: s(<path d="M6 6l12 12M18 6 6 18" />),
};
