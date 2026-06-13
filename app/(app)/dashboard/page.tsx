import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import { Card, LinkButton } from "@/components/ui";
import { formatMoney } from "@/lib/format";
import type { ExpenseRequest, RequestStatus } from "@/lib/types";

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card className="p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ?? "text-slate-900"}`}>{value}</div>
    </Card>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{ctx.org.name}</h1>
          <p className="text-sm text-slate-500">
            Approvals above {formatMoney(ctx.org.approval_threshold_minor, ctx.org.default_currency)} require an admin.
          </p>
        </div>
        <LinkButton href="/requests/new">New request</LinkButton>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Pending" value={byStatus("pending")} accent="text-amber-600" />
        <Stat label="Approved" value={byStatus("approved")} accent="text-emerald-600" />
        <Stat label="Rejected" value={byStatus("rejected")} accent="text-rose-600" />
        <Stat
          label={approver ? "Pending value" : "My requests"}
          value={approver ? formatMoney(pendingValue, ctx.org.default_currency) : mine.length}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
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
          emptyLabel={approver ? "No requests in this organization yet." : "You haven't made any requests yet."}
        />
      </div>
    </div>
  );
}
