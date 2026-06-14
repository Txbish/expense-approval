import Link from "next/link";
import { clsx } from "clsx";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Money } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import { nameOf, type ProfileMap } from "@/lib/queries";
import type { ExpenseRequest } from "@/lib/types";

interface RequestListProps {
  requests: ExpenseRequest[];
  profiles: ProfileMap;
  showRequester?: boolean;
  threshold?: number;
  emptyLabel?: string;
  /** Adds a per-row action affordance (e.g. on the approval queue). */
  reviewable?: boolean;
  actionLabel?: string;
  /** Origin tag so the detail page's "Back" returns here (e.g. "dashboard"). */
  from?: string;
}

export function RequestList({
  requests,
  profiles,
  showRequester = false,
  threshold,
  emptyLabel = "No requests yet.",
  reviewable = false,
  actionLabel = "Review",
  from,
}: RequestListProps) {
  const hrefFor = (id: string) => (from ? `/requests/${id}?from=${from}` : `/requests/${id}`);

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        }
        title={emptyLabel}
        description="Requests you can see will appear here, newest first."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-cream">
      {/* Mobile / tablet: stacked cards (the whole row is the tap target).
          Cards run up to lg because below the lg sidebar layout there isn't
          room for the five-column table without clipping. */}
      <ul className="stagger-rise divide-y divide-mist/70 lg:hidden">
        {requests.map((r, i) => {
          const adminReq = threshold !== undefined && r.amount_minor > threshold && r.status === "pending";
          return (
            <li key={r.id} style={{ "--i": i } as React.CSSProperties}>
              <Link
                href={hrefFor(r.id)}
                className={clsx(
                  "flex min-h-[3.75rem] flex-col gap-2 px-4 py-3.5 transition-colors active:bg-ink/5 focus-visible:outline-none focus-visible:bg-ink/5",
                  adminReq && "bg-parchment/60",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">{r.title}</p>
                    <p className="truncate text-xs text-storm/60">
                      {r.category}
                      {showRequester && <> · {nameOf(profiles, r.requester_id)}</>}
                    </p>
                  </div>
                  <StatusBadge status={r.status} admin={adminReq} />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Money minor={r.amount_minor} currency={r.currency} className="font-medium text-ink" />
                  <span className="flex items-center gap-1.5 text-xs tabular text-storm/55">
                    {timeAgo(r.updated_at)}
                    {reviewable && (
                      <span aria-hidden className="font-medium text-blue">{actionLabel} →</span>
                    )}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {/* lg+: the ledger table. min-w-0 wrapper + overflow-x-auto keep it from
          ever forcing the page wider than the viewport. */}
      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="w-full min-w-[36rem] text-sm">
          <thead className="border-b border-mist text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-2xs [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-storm/60">
              <th>Request</th>
              {showRequester && <th>Requester</th>}
              <th className="text-right">Amount</th>
              <th className="text-center">Status</th>
              <th className="text-right">Updated</th>
              {reviewable && <th className="text-right sr-only">Action</th>}
            </tr>
          </thead>
          <tbody className="stagger-rise divide-y divide-mist/70">
            {requests.map((r, i) => {
              const adminReq = threshold !== undefined && r.amount_minor > threshold && r.status === "pending";
              return (
                <tr
                  key={r.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className={clsx(
                    "group transition-colors duration-150 hover:bg-ink/3",
                    adminReq && "bg-parchment/60",
                  )}
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={hrefFor(r.id)}
                      className="font-medium text-ink transition-colors group-hover:text-blue"
                    >
                      {r.title}
                    </Link>
                    <div className="text-xs text-storm/60">{r.category}</div>
                  </td>
                  {showRequester && (
                    <td className="px-4 py-3.5 text-storm/80">{nameOf(profiles, r.requester_id)}</td>
                  )}
                  <td className="px-4 py-3.5 text-right">
                    <Money minor={r.amount_minor} currency={r.currency} className="font-medium text-ink" />
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <StatusBadge status={r.status} admin={adminReq} />
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs tabular text-storm/60">{timeAgo(r.updated_at)}</td>
                  {reviewable && (
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={hrefFor(r.id)}
                        className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full bg-ink px-3.5 text-xs font-medium text-cream transition-colors hover:bg-storm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
                      >
                        {actionLabel} →
                      </Link>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
