import Link from "next/link";
import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { EmptyState, PageHeader } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { ExpenseRequest, RequestEvent } from "@/lib/types";

const VERB: Record<string, string> = {
  created: "submitted",
  approved: "approved",
  rejected: "rejected",
  withdrawn: "withdrew",
};

const DOT: Record<string, string> = {
  created: "bg-storm/50",
  approved: "bg-success",
  rejected: "bg-destructive",
  withdrawn: "bg-storm/50",
};

export default async function ActivityPage() {
  const ctx = (await getAppContext())!;
  const supabase = await createClient();

  // RLS scopes this: approvers see the whole org's events, requesters see only
  // events on their own requests.
  const { data: eventData } = await supabase
    .from("request_events")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const events = (eventData ?? []) as RequestEvent[];

  const reqIds = [...new Set(events.map((e) => e.request_id))];
  const { data: reqData } = await supabase.from("requests").select("id, title").in("id", reqIds);
  const titles = new Map((reqData as Pick<ExpenseRequest, "id" | "title">[] | null)?.map((r) => [r.id, r.title]) ?? []);
  const profiles = await profilesByIds(supabase, events.map((e) => e.actor_id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit"
        title="Activity"
        description="A complete, append-only audit trail of every decision."
      />
      {events.length === 0 ? (
        <EmptyState
          icon={
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 12h4l2.5 7 5-15L17 12h4" />
            </svg>
          }
          title="No activity yet"
          description="Once requests are submitted and decided, every action will be logged here."
        />
      ) : (
        <div className="divide-y divide-mist/70 overflow-hidden rounded-2xl border border-mist bg-cream">
          {events.map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
              <div className="flex min-w-0 items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[e.type] ?? "bg-storm/50"}`} />
                <div className="min-w-0">
                  <span className="font-medium text-ink">{nameOf(profiles, e.actor_id)}</span>{" "}
                  <span className="text-storm/70">{VERB[e.type] ?? e.type}</span>{" "}
                  <Link
                    href={`/requests/${e.request_id}?from=activity`}
                    className="font-medium text-blue transition-colors hover:underline"
                  >
                    {titles.get(e.request_id) ?? "a request"}
                  </Link>
                  {e.note && <span className="text-storm/70"> — “{e.note}”</span>}
                </div>
              </div>
              <span className="shrink-0 text-xs tabular text-storm/55">{timeAgo(e.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
