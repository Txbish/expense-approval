import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { EventTimeline } from "@/components/event-timeline";
import { DecisionPanel } from "@/components/decision-panel";
import { WithdrawButton } from "@/components/withdraw-button";
import { formatMoney, timeAgo } from "@/lib/format";
import type { ExpenseRequest, RequestEvent } from "@/lib/types";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = (await getAppContext())!;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .maybeSingle<ExpenseRequest>();
  if (!request) notFound();

  const { data: eventData } = await supabase
    .from("request_events")
    .select("*")
    .eq("request_id", id)
    .order("created_at", { ascending: true });
  const events = (eventData ?? []) as RequestEvent[];

  const profiles = await profilesByIds(supabase, [
    request.requester_id,
    request.decided_by,
    ...events.map((e) => e.actor_id),
  ]);

  const isOwn = request.requester_id === ctx.userId;
  const isPending = request.status === "pending";
  const overLimit = request.amount_minor > ctx.org.approval_threshold_minor;
  const canDecide = isApprover(ctx.role) && !isOwn && isPending;

  return (
    <div className="space-y-6">
      <Link href="/requests" className="text-sm text-slate-500 hover:text-slate-700">
        ← Back
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-semibold text-slate-900">{request.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  {request.category} · requested by {nameOf(profiles, request.requester_id)} ·{" "}
                  {timeAgo(request.created_at)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-slate-900">
                {formatMoney(request.amount_minor, request.currency)}
              </span>
              {overLimit && (
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                  above threshold · admin required
                </span>
              )}
            </div>
            {request.description && (
              <p className="mt-5 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {request.description}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              History
            </h2>
            <EventTimeline events={events} profiles={profiles} />
          </Card>
        </div>

        <div className="space-y-6">
          {canDecide && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Review</h2>
              <DecisionPanel
                requestId={request.id}
                overLimit={overLimit}
                canApproveOverLimit={ctx.role === "admin"}
              />
            </Card>
          )}

          {isOwn && isPending && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">Your request</h2>
              <p className="mb-3 text-sm text-slate-500">It&apos;s awaiting review. You can withdraw it.</p>
              <WithdrawButton requestId={request.id} />
            </Card>
          )}

          {!isPending && (
            <Card className="p-5">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Decision</h2>
              <p className="text-sm text-slate-600">
                <StatusBadge status={request.status} />{" "}
                {request.decided_by && <>by {nameOf(profiles, request.decided_by)}</>}
                {request.decided_at && <> · {timeAgo(request.decided_at)}</>}
              </p>
              {request.decision_note && (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  “{request.decision_note}”
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
