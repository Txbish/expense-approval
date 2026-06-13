import Link from "next/link";
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
  /** Adds a per-row action button (e.g. on the approval queue). */
  reviewable?: boolean;
  actionLabel?: string;
}

export function RequestList({
  requests,
  profiles,
  showRequester = false,
  threshold,
  emptyLabel = "No requests yet.",
  reviewable = false,
  actionLabel = "Review",
}: RequestListProps) {
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
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-mist text-left">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-2xs [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-storm/60">
              <th>Request</th>
              {showRequester && <th>Requester</th>}
              <th className="text-right">Amount</th>
              <th>Status</th>
              <th className="text-right">Updated</th>
              {reviewable && <th className="text-right sr-only">Action</th>}
            </tr>
          </thead>
          <tbody className="stagger-rise divide-y divide-mist/70">
            {requests.map((r, i) => {
              const overLimit = threshold !== undefined && r.amount_minor > threshold;
              return (
                <tr
                  key={r.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="group transition-colors duration-150 hover:bg-ink/3"
                >
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/requests/${r.id}`}
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
                    {overLimit && r.status === "pending" && (
                      <span className="ml-2 inline-flex rounded border border-orange/55 px-1.5 py-0.5 text-3xs font-semibold uppercase tracking-wide text-ink">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3.5 text-right text-xs tabular text-storm/60">{timeAgo(r.updated_at)}</td>
                  {reviewable && (
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/requests/${r.id}`}
                        className="inline-flex h-8 items-center gap-1 rounded-full bg-ink px-3.5 text-xs font-medium text-cream transition-colors hover:bg-storm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
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
