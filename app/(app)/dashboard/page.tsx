import Link from "next/link";
import type { ReactNode } from "react";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import { LinkButton } from "@/components/ui";
import { formatMoney, formatMoneyCompact } from "@/lib/format";
import type { ExpenseRequest, RequestStatus } from "@/lib/types";

/* A compact stat tile — muted surface, small label over an 18px value. */
function StatCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl bg-parchment px-3 py-2.5">
      <p className="truncate text-2xs font-medium uppercase tracking-[0.12em] text-storm/55">{label}</p>
      <p className="mt-1 truncate text-body-sm font-medium tabular text-ink">{value}</p>
    </div>
  );
}

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

  const pendingCount = byStatus("pending");
  const currency = ctx.org.default_currency;

  return (
    <div className="space-y-8">
      {/* Header — eyebrow + heading on the left, primary actions top-right.
          Stays stacked until lg so the heading and date line never get
          squeezed into ragged wraps by the buttons beside them. */}
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 space-y-1.5">
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
            Today · {dateStr} · {ctx.org.name}
          </p>
          <h1 className="text-heading-sm text-ink">
            {firstName ? `Welcome back, ${firstName}` : "Here's the latest"}
          </h1>
        </div>
        <div className="flex shrink-0 gap-3">
          <LinkButton href="/requests/new" className="flex-1 lg:flex-none">
            + New request
          </LinkButton>
          {pendingToReview > 0 && (
            <LinkButton href="/queue" variant="outline" className="flex-1 lg:flex-none">
              Review {pendingToReview} pending ↗
            </LinkButton>
          )}
        </div>
      </header>

      {requests.length === 0 ? (
        <FirstRun isAdmin={ctx.role === "admin"} />
      ) : (
        <>
          {/* Stats — one compact row of four (2×2 on mobile) */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label="Pending"
              value={pendingCount > 0 ? `${pendingCount} · ${formatMoneyCompact(pendingValue, currency)}` : "0"}
            />
            <StatCard label="Approved" value={byStatus("approved")} />
            <StatCard label="Rejected" value={byStatus("rejected")} />
            <StatCard label="Approval rate" value={`${approvalRate}%`} />
          </section>

          {/* Latest activity — the primary content area */}
          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Recent</p>
                <h2 className="text-subheading text-ink">{approver ? "Latest activity" : "My recent requests"}</h2>
              </div>
              <Link
                href={approver ? "/requests/all" : "/requests"}
                className="shrink-0 text-2xs font-medium uppercase tracking-[0.12em] text-blue hover:underline"
              >
                All requests ↗
              </Link>
            </div>
            <RequestList
              requests={recent}
              profiles={profiles}
              showRequester={approver}
              threshold={ctx.org.approval_threshold_minor}
              emptyLabel={approver ? "No requests in this organization yet." : "You haven't made any requests yet."}
            />
          </section>

          {/* Quick actions — a slim row of links (stacked on mobile) */}
          <section className="space-y-3">
            <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Quick actions</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <QuickAction href="/requests/new" label="New request" icon={<IconPlus />} />
              {approver && <QuickAction href="/queue" label="Approval queue" icon={<IconQueue />} />}
              <QuickAction href="/activity" label="Audit trail" icon={<IconTrail />} />
            </div>
          </section>

          <p className="text-xs text-storm/55">
            Requests above {formatMoney(ctx.org.approval_threshold_minor, currency)} require an admin to
            approve.
          </p>
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

function QuickAction({ href, label, icon }: { href: string; label: string; icon: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex flex-1 items-center gap-2.5 rounded-xl border border-mist bg-card px-4 py-2.5 text-field font-medium text-ink transition-colors hover:bg-mist/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
    >
      <span className="shrink-0 text-storm/70">{icon}</span>
      {label}
    </Link>
  );
}

/* ── Quick-action glyphs (Lucide-weight, inherit stroke rounding from globals) */

function IconPlus() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 4.5v11M4.5 10h11" />
    </svg>
  );
}

function IconQueue() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="10" cy="10" r="6.5" />
      <path d="M7 10l2 2 4-4.2" />
    </svg>
  );
}

function IconTrail() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 5.5h10M5 10h10M5 14.5h6.5" />
    </svg>
  );
}
