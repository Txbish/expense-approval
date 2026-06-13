import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { Card, LinkButton, Money } from "@/components/ui";
import { StatusBadge, Seal } from "@/components/status-badge";
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
  const isAdmin = ctx.role === "admin";
  const isPending = request.status === "pending";
  const overLimit = request.amount_minor > ctx.org.approval_threshold_minor;
  const canDecide = isApprover(ctx.role) && !isOwn && isPending;

  // Above-threshold requests need an admin for ANY decision (matches the
  // decide_request RPC) — UNLESS no eligible (non-requester) admin exists, in
  // which case an approver may decide. We ask the DB so UI and RPC never
  // disagree; if the helper isn't deployed yet we keep the stricter behavior.
  let eligibleAdminExists = true;
  if (overLimit && isPending) {
    const { data, error } = await supabase.rpc(
      "request_eligible_admin_exists",
      { p_request: id },
    );
    eligibleAdminExists = error ? true : data === true;
  }
  const approverFallback =
    canDecide && !isAdmin && overLimit && !eligibleAdminExists;
  const canDecideNow = canDecide && (isAdmin || !overLimit || approverFallback);
  const blockedAsApprover =
    canDecide && !isAdmin && overLimit && eligibleAdminExists;
  const canResubmit =
    isOwn && (request.status === "rejected" || request.status === "withdrawn");
  const resubmitHref =
    "/requests/new?" +
    new URLSearchParams({
      title: request.title,
      category: request.category,
      amount: (request.amount_minor / 100).toFixed(2),
      ...(request.description ? { description: request.description } : {}),
    }).toString();

  return (
    <div className="space-y-6">
      <Link
        href="/requests"
        className="inline-flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.12em] text-storm/60 transition-colors hover:text-ink">
        <svg
          viewBox="0 0 20 20"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden>
          <path d="M12 5 7 10l5 5" />
        </svg>
        Back to requests
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <p className="text-2xs font-medium uppercase tracking-[0.14em] text-storm/55">
                  {request.category}
                </p>
                <h1 className="text-heading-sm text-ink">{request.title}</h1>
                <p className="text-caption text-storm/70">
                  requested by {nameOf(profiles, request.requester_id)} ·{" "}
                  {timeAgo(request.created_at)}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <Money
                minor={request.amount_minor}
                currency={request.currency}
                className="text-heading-lg text-ink"
              />
              {overLimit && (
                <span className="rounded-md border border-orange/55 bg-orange/8 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ink">
                  Above threshold · admin required
                </span>
              )}
            </div>

            {request.description && (
              <p className="mt-6 whitespace-pre-wrap rounded-xl border border-mist bg-cream p-4 text-field leading-relaxed text-storm">
                {request.description}
              </p>
            )}
          </Card>

          <Card className="p-6 sm:p-8">
            <p className="mb-5 text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
              History
            </p>
            <EventTimeline events={events} profiles={profiles} />
          </Card>
        </div>

        <div className="space-y-6">
          {canDecideNow && (
            <Card className="p-6">
              <p className="mb-4 text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
                Review
              </p>
              <DecisionPanel
                requestId={request.id}
                overLimit={overLimit}
                canDecideOverLimit={isAdmin || approverFallback}
                fallback={approverFallback}
              />
            </Card>
          )}

          {blockedAsApprover && (
            <Card className="p-6">
              <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
                Review
              </p>
              <div className="mt-3 rounded-xl border border-orange/50 bg-orange/8 p-4">
                <p className="text-field font-medium text-ink">
                  An admin must decide this one
                </p>
                <p className="mt-1 text-caption text-storm/75">
                  At {formatMoney(request.amount_minor, request.currency)}, this
                  is above the{" "}
                  {formatMoney(
                    ctx.org.approval_threshold_minor,
                    ctx.org.default_currency,
                  )}{" "}
                  threshold. Only an admin can approve or reject it — not just
                  approve.
                </p>
              </div>
            </Card>
          )}

          {isOwn && isPending && (
            <Card className="p-6">
              <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
                Your request
              </p>
              {overLimit ? (
                <div className="mb-4 mt-2 space-y-2">
                  <p className="text-caption text-storm/75">
                    At {formatMoney(request.amount_minor, request.currency)},
                    this is above the{" "}
                    {formatMoney(
                      ctx.org.approval_threshold_minor,
                      ctx.org.default_currency,
                    )}{" "}
                    threshold.
                  </p>
                  {eligibleAdminExists ? (
                    <p className="text-caption text-storm/75">
                      It needs <strong>a different admin </strong> to decide —
                      you can&apos;t approve your own request.
                      {isAdmin && (
                        <>
                          {" "}
                          Add another admin in{" "}
                          <Link
                            href="/members"
                            className="font-medium text-blue hover:underline">
                            Members
                          </Link>
                          , lower the limit in{" "}
                          <Link
                            href="/settings"
                            className="font-medium text-blue hover:underline">
                            Settings
                          </Link>
                          , or withdraw below.
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="text-caption text-storm/75">
                      Since there&apos;s <strong>no other admin</strong>, an
                      approver can decide it for you.
                      {isAdmin && (
                        <>
                          {" "}
                          You can also lower the limit in{" "}
                          <Link
                            href="/settings"
                            className="font-medium text-blue hover:underline">
                            Settings
                          </Link>{" "}
                          or withdraw below.
                        </>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <p className="mb-4 mt-2 text-caption text-storm/75">
                  It&apos;s awaiting review. You can withdraw it any time before
                  a decision.
                </p>
              )}
              <WithdrawButton requestId={request.id} />
            </Card>
          )}

          {!isPending && (
            <Card className="flex flex-col items-center p-6 text-center sm:p-8">
              <Seal status={request.status} />
              <p className="mt-4 text-subheading capitalize text-ink">
                {request.status}
              </p>
              <p className="mt-0.5 text-caption text-storm/70">
                {request.decided_by && (
                  <>by {nameOf(profiles, request.decided_by)}</>
                )}
                {request.decided_at && <> · {timeAgo(request.decided_at)}</>}
              </p>
              {request.decision_note && (
                <p className="mt-4 w-full rounded-xl border border-mist bg-cream p-3 text-left text-field italic text-storm">
                  “{request.decision_note}”
                </p>
              )}
            </Card>
          )}

          {canResubmit && (
            <Card className="p-6">
              <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
                Need to try again?
              </p>
              <p className="mb-4 mt-2 text-caption text-storm/75">
                Start a fresh request pre-filled from this one — add your
                justification and resubmit. This request stays on the record.
              </p>
              <LinkButton
                href={resubmitHref}
                variant="secondary"
                className="w-full">
                Resubmit as new request
              </LinkButton>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
