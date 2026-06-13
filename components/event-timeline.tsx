import { nameOf, type ProfileMap } from "@/lib/queries";
import { timeAgo } from "@/lib/format";
import type { RequestEvent } from "@/lib/types";

const DOT: Record<string, string> = {
  created: "bg-storm",
  approved: "bg-success",
  rejected: "bg-destructive",
  withdrawn: "bg-storm/50",
};

const VERB: Record<string, string> = {
  created: "submitted this request",
  approved: "approved this request",
  rejected: "rejected this request",
  withdrawn: "withdrew this request",
};

export function EventTimeline({ events, profiles }: { events: RequestEvent[]; profiles: ProfileMap }) {
  if (events.length === 0) {
    return <p className="text-caption text-storm/70">No history yet.</p>;
  }

  return (
    <ol className="relative space-y-5">
      <span aria-hidden className="absolute bottom-2 left-[5px] top-2 w-px bg-mist" />
      {events.map((e) => (
        <li key={e.id} className="relative flex gap-3.5">
          <span
            className={`relative z-[1] mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-card ${DOT[e.type] ?? "bg-storm"}`}
          />
          <div className="flex-1">
            <p className="text-field text-storm">
              <span className="font-medium text-ink">{nameOf(profiles, e.actor_id)}</span>{" "}
              {VERB[e.type] ?? e.type}
            </p>
            {e.note && <p className="mt-0.5 text-field italic text-storm/70">“{e.note}”</p>}
            <p className="mt-0.5 text-xs tabular text-storm/55">{timeAgo(e.created_at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
