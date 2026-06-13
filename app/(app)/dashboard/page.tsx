import Link from "next/link";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import { LinkButton, Money } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { ExpenseRequest, RequestStatus } from "@/lib/types";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-cream px-6 py-5">
      <p className="text-2xs font-medium uppercase tracking-[0.14em] text-storm/55">{label}</p>
      <p className="mt-2 text-heading-sm tabular text-ink">{value}</p>
    </div>
  );
}

const STRIP: { status: RequestStatus; label: string }[] = [
  { status: "pending", label: "Pending" },
  { status: "approved", label: "Approved" },
  { status: "rejected", label: "Rejected" },
  { status: "withdrawn", label: "Withdrawn" },
];

export default async function DashboardPage() {
  const ctx = (await getAppContext())!;
  const supabase = await createClient();
  const approver = isApprover(ctx.role);

  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("updated_at", { ascending: false });
  const requests = (data ?? []) as ExpenseRequest[];

  const byStatus = (s: RequestStatus) => requests.filter((r) => r.status === s).length;
  const mine = requests.filter((r) => r.requester_id === ctx.userId);
  const pendingValue = requests
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + r.amount_minor, 0);
  const decided = byStatus("approved") + byStatus("rejected");
  const approvalRate = decided ? Math.round((byStatus("approved") / decided) * 100) : 0;
  // What this user can actually action — excludes their own pending requests.
  const pendingToReview = approver
    ? requests.filter((r) => r.status === "pending" && r.requester_id !== ctx.userId).length
    : 0;

  const profiles = await profilesByIds(supabase, requests.map((r) => r.requester_id));
  const recent = approver ? requests.slice(0, 6) : mine.slice(0, 6);
  const firstName = ctx.fullName?.trim().split(/\s+/)[0] ?? null;
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
            Today · {dateStr} · {ctx.org.name}
          </p>
          <h1 className="text-heading lowercase text-ink sm:text-heading-lg">
            {firstName ? `welcome back, ${firstName}.` : "here's the latest."}
          </h1>
          <p className="text-body-sm text-storm/80">
            Requests above {formatMoney(ctx.org.approval_threshold_minor, ctx.org.default_currency)}{" "}
            require an admin to approve.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <LinkButton href="/requests/new">+ New request</LinkButton>
          {pendingToReview > 0 && (
            <LinkButton href="/queue" variant="outline">
              Review {pendingToReview} pending ↗
            </LinkButton>
          )}
        </div>
      </section>

      {requests.length === 0 ? (
        <FirstRun isAdmin={ctx.role === "admin"} />
      ) : (
        <>
      {/* Stat panel */}
      <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-mist bg-mist sm:grid-cols-4">
        <Stat label="Requests" value={requests.length} />
        <Stat
          label={approver ? "Pending value" : "My requests"}
          value={approver ? <Money minor={pendingValue} currency={ctx.org.default_currency} /> : mine.length}
        />
        <Stat label="Approved" value={byStatus("approved")} />
        <Stat label={approver ? "Approval rate" : "Pending"} value={approver ? `${approvalRate}%` : byStatus("pending")} />
      </section>

      {/* Status strip */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
            Status · {requests.length} total
          </p>
          <Link
            href={approver ? "/requests/all" : "/requests"}
            className="text-2xs font-medium uppercase tracking-[0.12em] text-blue hover:underline"
          >
            All requests ↗
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STRIP.map((s) => {
            const count = byStatus(s.status);
            const highlight = s.status === "pending" && count > 0;
            return (
              <div
                key={s.status}
                className={
                  highlight
                    ? "rounded-xl bg-ink px-4 py-3.5 text-cream"
                    : "rounded-xl border border-mist bg-parchment px-4 py-3.5"
                }
              >
                <p
                  className={
                    highlight
                      ? "text-2xs font-medium uppercase tracking-[0.12em] text-cream/70"
                      : "text-2xs font-medium uppercase tracking-[0.12em] text-storm/55"
                  }
                >
                  {s.label}
                </p>
                <p className={highlight ? "mt-1 text-subheading tabular text-cream" : "mt-1 text-subheading tabular text-ink"}>
                  {count}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent + quick actions */}
      <section className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <div className="space-y-1">
              <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Recent</p>
              <h2 className="text-subheading text-ink">{approver ? "Latest activity" : "My recent requests"}</h2>
            </div>
          </div>
          <RequestList
            requests={recent}
            profiles={profiles}
            showRequester={approver}
            threshold={ctx.org.approval_threshold_minor}
            emptyLabel={approver ? "No requests in this organization yet." : "You haven't made any requests yet."}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Quick actions</p>
            <h2 className="text-subheading text-ink">Jump in</h2>
          </div>
          <div className="space-y-2.5">
            <QuickAction href="/requests/new" label="New expense request" />
            {approver && <QuickAction href="/queue" label="Review the approval queue" />}
            <QuickAction href="/activity" label="View the audit trail" />
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}

function FirstRun({ isAdmin }: { isAdmin: boolean }) {
  return (
    <section className="rounded-2xl border border-mist bg-card p-8 sm:p-10">
      <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Getting started</p>
      <h2 className="mt-2 text-subheading text-ink">Your workspace is ready.</h2>
      <p className="mt-2 max-w-xl text-body-sm text-storm/80">
        {isAdmin
          ? "Invite the people who'll submit and approve expenses, then log your first request. Add at least one approver so requests above your threshold can be decided."
          : "Submit your first expense request and it'll head to your approvers for review."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <LinkButton href="/requests/new">+ New request</LinkButton>
        {isAdmin && (
          <LinkButton href="/members" variant="outline">
            Invite your team ↗
          </LinkButton>
        )}
      </div>
    </section>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-mist bg-card px-4 py-3.5 text-field font-medium text-ink transition-colors hover:bg-mist/30"
    >
      {label}
      <span className="text-storm/50">↗</span>
    </Link>
  );
}
