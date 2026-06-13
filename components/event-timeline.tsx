import { nameOf, type ProfileMap } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import type { RequestEvent } from "@/lib/types";

const DOT: Record<string, string> = {
  created: "bg-withdrawn-solid",
  approved: "bg-approved-solid",
  rejected: "bg-rejected-solid",
  withdrawn: "bg-withdrawn-solid",
};

const VERB: Record<string, string> = {
  created: "submitted this request",
  approved: "approved this request",
  rejected: "rejected this request",
  withdrawn: "withdrew this request",
};

export function EventTimeline({ events, profiles }: { events: RequestEvent[]; profiles: ProfileMap }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted">No history yet.</p>;
  }

  return (
    <ol className="relative space-y-5">
      {/* connector rail */}
      <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-line" />
      {events.map((e) => (
        <li key={e.id} className="relative flex gap-3.5">
          <span
            className={`relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-surface ${DOT[e.type] ?? "bg-withdrawn-solid"}`}
          />
          <div className="flex-1">
            <p className="text-sm text-ink-soft">
              <span className="font-medium text-ink">{nameOf(profiles, e.actor_id)}</span>{" "}
              {VERB[e.type] ?? e.type}
            </p>
            {e.note && <p className="mt-0.5 text-sm italic text-muted">“{e.note}”</p>}
            <p className="mt-0.5 text-xs tabular text-faint">{timeAgo(e.created_at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
