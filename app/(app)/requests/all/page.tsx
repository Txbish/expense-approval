import Link from "next/link";
import { redirect } from "next/navigation";
import { clsx } from "clsx";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
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
  const profiles = await profilesByIds(supabase, requests.map((r) => r.requester_id));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Review"
        title="All requests"
        description="Every expense request in this organization, across all statuses."
      />

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = f.value === active;
          const href = f.value === "all" ? "/requests/all" : `/requests/all?status=${f.value}`;
          return (
            <Link
              key={f.value}
              href={href}
              className={clsx(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-ink bg-ink text-cream"
                  : "border-mist bg-cream text-storm/80 hover:border-storm/30 hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <RequestList
        requests={requests}
        profiles={profiles}
        showRequester
        threshold={ctx.org.approval_threshold_minor}
        emptyLabel={active === "all" ? "No requests in this organization yet." : `No ${active} requests.`}
      />
    </div>
  );
}
