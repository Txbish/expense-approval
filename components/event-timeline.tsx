import { nameOf, type ProfileMap } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import type { RequestEvent } from "@/lib/types";

const DOT: Record<string, string> = {
  created: "bg-slate-400",
  approved: "bg-emerald-500",
  rejected: "bg-rose-500",
  withdrawn: "bg-slate-400",
};

const VERB: Record<string, string> = {
  created: "submitted this request",
  approved: "approved this request",
  rejected: "rejected this request",
  withdrawn: "withdrew this request",
};

export function EventTimeline({ events, profiles }: { events: RequestEvent[]; profiles: ProfileMap }) {
  return (
    <ol className="space-y-4">
      {events.map((e) => (
        <li key={e.id} className="flex gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${DOT[e.type] ?? "bg-slate-400"}`} />
          <div className="flex-1">
            <p className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">{nameOf(profiles, e.actor_id)}</span>{" "}
              {VERB[e.type] ?? e.type}
            </p>
            {e.note && <p className="mt-0.5 text-sm text-slate-500">“{e.note}”</p>}
            <p className="text-xs text-slate-400">{timeAgo(e.created_at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
