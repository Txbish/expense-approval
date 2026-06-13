import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import { Card, LinkButton, Money, PageHeader } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { ExpenseRequest, RequestStatus } from "@/lib/types";

type Tone = "pending" | "approved" | "rejected" | "neutral";
const TONE: Record<Tone, string> = {
  pending: "text-pending-fg",
  approved: "text-approved-fg",
  rejected: "text-rejected-fg",
  neutral: "text-ink",
};

function Stat({ label, value, tone = "neutral" }: { label: string; value: React.ReactNode; tone?: Tone }) {
  return (
    <div className="px-5 py-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1.5 text-2xl font-semibold tabular tracking-tight ${TONE[tone]}`}>{value}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = (await getAppContext())!;
  const supabase = await createClient();
  const approver = isApprover(ctx.role);

  // RLS scopes this automatically: requesters get only their own rows.
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

  const profiles = await profilesByIds(supabase, requests.map((r) => r.requester_id));
  const recent = requests.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageHeader
        title={ctx.org.name}
        description={`Requests above ${formatMoney(
          ctx.org.approval_threshold_minor,
          ctx.org.default_currency,
        )} require an admin to approve.`}
        actions={<LinkButton href="/requests/new">New request</LinkButton>}
      />

      <Card className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-4 sm:divide-y-0">
        <Stat label="Pending" value={byStatus("pending")} tone="pending" />
        <Stat label="Approved" value={byStatus("approved")} tone="approved" />
        <Stat label="Rejected" value={byStatus("rejected")} tone="rejected" />
        <Stat
          label={approver ? "Pending value" : "My requests"}
          value={
            approver ? (
              <Money minor={pendingValue} currency={ctx.org.default_currency} />
            ) : (
              mine.length
            )
          }
        />
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">
            {approver ? "Recent activity" : "My recent requests"}
          </h2>
          {approver && byStatus("pending") > 0 && (
            <LinkButton href="/queue" variant="secondary">
              Review {byStatus("pending")} pending
            </LinkButton>
          )}
        </div>
        <RequestList
          requests={approver ? recent : mine.slice(0, 6)}
          profiles={profiles}
          showRequester={approver}
          threshold={ctx.org.approval_threshold_minor}
          emptyLabel={
            approver ? "No requests in this organization yet." : "You haven't made any requests yet."
          }
        />
      </section>
    </div>
  );
}
