import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import type { ExpenseRequest } from "@/lib/types";

export default async function QueuePage() {
  const ctx = (await getAppContext())!;
  if (!isApprover(ctx.role)) redirect("/dashboard");

  const supabase = await createClient();
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("org_id", ctx.org.id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const requests = (data ?? []) as ExpenseRequest[];
  const profiles = await profilesByIds(supabase, requests.map((r) => r.requester_id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Approval queue</h1>
        <p className="text-sm text-slate-500">
          {requests.length} request{requests.length === 1 ? "" : "s"} awaiting review.
          {ctx.role === "approver" && " Items marked “admin” are above your limit."}
        </p>
      </div>
      <RequestList
        requests={requests}
        profiles={profiles}
        showRequester
        threshold={ctx.org.approval_threshold_minor}
        emptyLabel="Nothing to review — you're all caught up. 🎉"
      />
    </div>
  );
}
