import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { Card, Money } from "@/components/ui";
import { StatusBadge, Seal } from "@/components/status-badge";
import { EventTimeline } from "@/components/event-timeline";
import { DecisionPanel } from "@/components/decision-panel";
import { WithdrawButton } from "@/components/withdraw-button";
import { timeAgo } from "@/lib/format";
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
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5 7 10l5 5" />
        </svg>
        Back to requests
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold tracking-tight text-ink">{request.title}</h1>
                <p className="mt-1 text-sm text-muted">
                  {request.category} · requested by {nameOf(profiles, request.requester_id)} ·{" "}
                  {timeAgo(request.created_at)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <Money
                minor={request.amount_minor}
                currency={request.currency}
                className="text-3xl font-semibold text-ink"
              />
              {overLimit && (
                <span className="rounded-md bg-accent-wash px-2 py-1 text-xs font-semibold text-accent-ink ring-1 ring-inset ring-accent-line">
                  Above threshold · admin required
                </span>
              )}
            </div>

            {request.description && (
              <p className="mt-6 whitespace-pre-wrap rounded-lg border border-line bg-surface-sunken p-4 text-sm leading-relaxed text-ink-soft">
                {request.description}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="mb-5 text-sm font-semibold text-ink">History</h2>
            <EventTimeline events={events} profiles={profiles} />
          </Card>
        </div>

        <div className="space-y-6">
          {canDecide && (
            <Card className="p-5">
              <h2 className="mb-3 text-sm font-semibold text-ink">Review</h2>
              <DecisionPanel
                requestId={request.id}
                overLimit={overLimit}
                canApproveOverLimit={ctx.role === "admin"}
              />
            </Card>
          )}

          {isOwn && isPending && (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Your request</h2>
              <p className="mb-4 mt-1 text-sm text-muted">
                It&apos;s awaiting review. You can withdraw it any time before a decision.
              </p>
              <WithdrawButton requestId={request.id} />
            </Card>
          )}

          {!isPending && (
            <Card className="flex flex-col items-center p-6 text-center">
              <Seal status={request.status} />
              <p className="mt-4 text-sm font-semibold capitalize text-ink">{request.status}</p>
              <p className="mt-0.5 text-sm text-muted">
                {request.decided_by && <>by {nameOf(profiles, request.decided_by)}</>}
                {request.decided_at && <> · {timeAgo(request.decided_at)}</>}
              </p>
              {request.decision_note && (
                <p className="mt-4 w-full rounded-lg border border-line bg-surface-sunken p-3 text-left text-sm italic text-ink-soft">
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
