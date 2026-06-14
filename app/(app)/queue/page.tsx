import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { PageHeader } from "@/components/ui";
import { QueueReview, type ReviewItem } from "@/components/queue-review";
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
  const profiles = await profilesByIds(supabase, requests.map((r) => r.requester_id));

  const threshold = ctx.org.approval_threshold_minor;
  const isAdmin = ctx.role === "admin";

  // Resolve each row's decision capability server-side so the drawer never
  // offers an action the decide_request RPC would reject. Above-threshold rows
  // need an admin UNLESS no eligible (non-requester) admin exists — in which
  // case an approver may decide as a fallback. We only pay for that RPC on the
  // rows that actually need it (over-limit, viewer is not an admin).
  const items: ReviewItem[] = await Promise.all(
    requests.map(async (r): Promise<ReviewItem> => {
      const overLimit = r.amount_minor > threshold;
      let canDecide = true;
      let fallback = false;
      if (overLimit && !isAdmin) {
        const { data: exists, error } = await supabase.rpc("request_eligible_admin_exists", {
          p_request: r.id,
        });
        const eligibleAdminExists = error ? true : exists === true;
        canDecide = !eligibleAdminExists;
        fallback = !eligibleAdminExists;
      }
      return {
        id: r.id,
        title: r.title,
        category: r.category,
        amountMinor: r.amount_minor,
        currency: r.currency,
        requesterName: nameOf(profiles, r.requester_id),
        createdAt: r.created_at,
        description: r.description ?? null,
        overLimit,
        canDecide,
        fallback,
      };
    }),
  );

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
      <QueueReview initialItems={items} />
    </div>
  );
}
