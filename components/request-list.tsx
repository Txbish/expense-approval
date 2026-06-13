import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { formatMoney, timeAgo } from "@/lib/format";
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
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Request</th>
            {showRequester && <th className="px-4 py-3 font-medium">Requester</th>}
            <th className="px-4 py-3 font-medium">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {requests.map((r) => {
            const overLimit = threshold !== undefined && r.amount_minor > threshold;
            return (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/requests/${r.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                    {r.title}
                  </Link>
                  <div className="text-xs text-slate-500">{r.category}</div>
                </td>
                {showRequester && (
                  <td className="px-4 py-3 text-slate-600">{nameOf(profiles, r.requester_id)}</td>
                )}
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-900">{formatMoney(r.amount_minor, r.currency)}</span>
                  {overLimit && r.status === "pending" && (
                    <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">
                      admin
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">{timeAgo(r.updated_at)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
