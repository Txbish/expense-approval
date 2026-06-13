import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds } from "@/lib/queries";
import { RequestList } from "@/components/request-list";
import { LinkButton } from "@/components/ui";
import type { ExpenseRequest } from "@/lib/types";

export default async function MyRequestsPage() {
  const ctx = (await getAppContext())!;
  const supabase = await createClient();

  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("org_id", ctx.org.id)
    .eq("requester_id", ctx.userId)
    .order("created_at", { ascending: false });
  const requests = (data ?? []) as ExpenseRequest[];
  const profiles = await profilesByIds(supabase, [ctx.userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">My requests</h1>
        <LinkButton href="/requests/new">New request</LinkButton>
      </div>
      <RequestList
        requests={requests}
        profiles={profiles}
        threshold={ctx.org.approval_threshold_minor}
        emptyLabel="You haven't made any requests yet. Create your first one."
      />
    </div>
  );
}
