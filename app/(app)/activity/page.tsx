import Link from "next/link";
import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { Card } from "@/components/ui";
import { timeAgo } from "@/lib/format";
import type { ExpenseRequest, RequestEvent } from "@/lib/types";

const VERB: Record<string, string> = {
  created: "submitted",
  approved: "approved",
  rejected: "rejected",
  withdrawn: "withdrew",
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
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Activity</h1>
        <p className="text-sm text-slate-500">A complete, append-only audit trail of every decision.</p>
      </div>
      <Card className="divide-y divide-slate-100">
        {events.length === 0 && <p className="p-6 text-sm text-slate-500">No activity yet.</p>}
        {events.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <div>
              <span className="font-medium text-slate-900">{nameOf(profiles, e.actor_id)}</span>{" "}
              <span className="text-slate-600">{VERB[e.type] ?? e.type}</span>{" "}
              <Link href={`/requests/${e.request_id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                {titles.get(e.request_id) ?? "a request"}
              </Link>
              {e.note && <span className="text-slate-500"> — “{e.note}”</span>}
            </div>
            <span className="shrink-0 text-xs text-slate-400">{timeAgo(e.created_at)}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
