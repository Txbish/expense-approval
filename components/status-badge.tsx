import { clsx } from "clsx";
import type { RequestStatus } from "@/lib/types";

const STYLES: Record<RequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-rose-100 text-rose-800 ring-rose-200",
  withdrawn: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset",
        STYLES[status],
      )}
    >
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700 ring-1 ring-inset ring-indigo-200">
      {role}
    </span>
  );
}
