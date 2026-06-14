"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { clsx } from "clsx";
import { timeAgo } from "@/lib/format";
import { markAllRead, markRead } from "@/app/(app)/actions";
import type { AppNotification } from "@/lib/types";

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
      <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
    </svg>
  );
}

/**
 * The notification bell as a self-contained popover: the recent inbox opens in
 * an anchored panel instead of routing to a full page. Anchored top-right under
 * whichever header bar is showing (mobile bar < md, top bar ≥ md), so the same
 * responsive panel classes serve both instances. "View all" still deep-links to
 * the full /notifications history.
 */
export function NotificationsMenu({
  notifications,
  unreadCount,
  className,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const hasUnread = unreadCount > 0;

  const read = (n: AppNotification) => {
    if (!n.read_at) startTransition(() => markRead(n.id));
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={hasUnread ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={clsx(
          "relative inline-flex items-center justify-center rounded-md text-storm/70 transition-colors hover:bg-ink/6 hover:text-ink",
          className,
        )}
      >
        <BellIcon className="h-5 w-5" />
        {hasUnread && (
          <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-3xs font-semibold tabular text-ink">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* click-catcher / scrim */}
          <div onClick={() => setOpen(false)} className="fixed inset-0 z-[55] bg-ink/20" aria-hidden />

          <div
            role="dialog"
            aria-label="Notifications"
            className="animate-slide-down fixed right-3 top-[3.75rem] z-[60] flex max-h-[min(70vh,30rem)] w-[min(23rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-mist bg-cream md:right-6 md:top-[4.5rem] lg:right-8"
          >
            <div className="flex items-center justify-between gap-3 border-b border-mist px-4 py-3">
              <p className="text-2xs font-semibold uppercase tracking-[0.16em] text-storm">Notifications</p>
              {hasUnread && (
                <form action={markAllRead}>
                  <button
                    type="submit"
                    className="rounded text-xs font-medium text-blue transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
                  >
                    Mark all read
                  </button>
                </form>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <p className="text-field font-medium text-ink">You&apos;re all caught up</p>
                <p className="mt-1 text-caption text-storm/65">Updates on your requests show up here.</p>
              </div>
            ) : (
              <ul className="min-h-0 flex-1 divide-y divide-mist/70 overflow-y-auto overscroll-contain">
                {notifications.map((n) => {
                  const inner = (
                    <div className="flex items-start gap-2.5 px-4 py-3">
                      {n.read_at ? (
                        <span className="mt-1.5 h-2 w-2 shrink-0" />
                      ) : (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue" aria-label="Unread" />
                      )}
                      <div className="min-w-0">
                        <p className={n.read_at ? "text-field text-storm/70" : "text-field font-medium text-ink"}>
                          {n.body}
                        </p>
                        <p className="mt-0.5 text-xs tabular text-storm/55">{timeAgo(n.created_at)}</p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id}>
                      {n.request_id ? (
                        <Link
                          href={`/requests/${n.request_id}`}
                          onClick={() => {
                            read(n);
                            setOpen(false);
                          }}
                          className="block transition-colors hover:bg-ink/3 focus-visible:bg-ink/3 focus-visible:outline-none"
                        >
                          {inner}
                        </Link>
                      ) : n.read_at ? (
                        inner
                      ) : (
                        <button
                          type="button"
                          onClick={() => read(n)}
                          className="block w-full text-left transition-colors hover:bg-ink/3 focus-visible:bg-ink/3 focus-visible:outline-none"
                        >
                          {inner}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="border-t border-mist px-4 py-3 text-center text-xs font-medium text-blue transition-colors hover:bg-ink/3"
            >
              View all notifications
            </Link>
          </div>
        </>
      )}
    </>
  );
}
