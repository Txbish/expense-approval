import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, reviewMapFor } from "@/lib/queries";
import { ReviewableRequestList } from "@/components/reviewable-request-list";
import { RequestFilter } from "@/components/request-filter";
import { PageHeader } from "@/components/ui";
import type { ExpenseRequest, RequestStatus } from "@/lib/types";

const FILTERS: { value: RequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default async function AllRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const ctx = (await getAppContext())!;
  if (!isApprover(ctx.role)) redirect("/requests");

  const { status } = await searchParams;
  const active = FILTERS.some((f) => f.value === status) ? (status as RequestStatus | "all") : "all";

  const supabase = await createClient();
  let query = supabase
    .from("requests")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("updated_at", { ascending: false });
  if (active !== "all") query = query.eq("status", active);

  const { data } = await query;
  const requests = (data ?? []) as ExpenseRequest[];
  const [profiles, reviewable] = await Promise.all([
    profilesByIds(supabase, requests.map((r) => r.requester_id)),
    reviewMapFor(supabase, requests, ctx),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="All requests"
        description="Every expense request in this organization, across all statuses."
      />

      <RequestFilter filters={FILTERS} active={active} />

      <ReviewableRequestList
        requests={requests}
        profiles={profiles}
        reviewable={reviewable}
        showRequester
        threshold={ctx.org.approval_threshold_minor}
        from="all"
        currentUserId={ctx.userId}
        emptyLabel={active === "all" ? "No requests in this organization yet." : `No ${active} requests.`}
      />
    </div>
  );
}
