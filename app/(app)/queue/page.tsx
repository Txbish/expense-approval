import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, reviewMapFor } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { ReviewableRequestList } from "@/components/reviewable-request-list";
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
    .neq("requester_id", ctx.userId) // you can't review your own request — keep the queue actionable
    .order("created_at", { ascending: true });
  const requests = (data ?? []) as ExpenseRequest[];

  const [profiles, reviewable] = await Promise.all([
    profilesByIds(supabase, requests.map((r) => r.requester_id)),
    reviewMapFor(supabase, requests, ctx),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="Approval queue"
        description={
          <>
            {requests.length} request{requests.length === 1 ? "" : "s"} awaiting review, oldest first.
            {ctx.role === "approver" && " Items marked “admin” are above your limit."}
          </>
        }
      />
      <ReviewableRequestList
        requests={requests}
        profiles={profiles}
        reviewable={reviewable}
        showRequester
        threshold={ctx.org.approval_threshold_minor}
        from="queue"
        emptyLabel="You're all caught up — nothing to review."
      />
    </div>
  );
}
