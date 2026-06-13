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
}

export function RequestList({
  requests,
  profiles,
  showRequester = false,
  threshold,
  emptyLabel = "No requests yet.",
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
    <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="border-b border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Request</th>
              {showRequester && <th className="px-4 py-2.5 font-medium">Requester</th>}
              <th className="px-4 py-2.5 text-right font-medium">Amount</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 text-right font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="stagger-rise divide-y divide-line">
            {requests.map((r, i) => {
              const overLimit = threshold !== undefined && r.amount_minor > threshold;
              return (
                <tr
                  key={r.id}
                  style={{ "--i": i } as React.CSSProperties}
                  className="group transition-colors duration-150 hover:bg-surface-2"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/requests/${r.id}`}
                      className="font-medium text-ink transition-colors group-hover:text-accent-ink"
                    >
                      {r.title}
                    </Link>
                    <div className="text-xs text-muted">{r.category}</div>
                  </td>
                  {showRequester && (
                    <td className="px-4 py-3 text-muted">{nameOf(profiles, r.requester_id)}</td>
                  )}
                  <td className="px-4 py-3 text-right">
                    <Money minor={r.amount_minor} currency={r.currency} className="font-medium text-ink" />
                    {overLimit && r.status === "pending" && (
                      <span className="ml-2 inline-flex rounded bg-accent-wash px-1.5 py-0.5 text-3xs font-semibold uppercase tracking-wide text-accent-ink ring-1 ring-inset ring-accent-line">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular text-muted">{timeAgo(r.updated_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
