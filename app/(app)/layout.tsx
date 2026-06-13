import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { AppTopBar } from "@/components/app-topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/onboarding");

  const supabase = await createClient();

  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  let pending = 0;
  if (isApprover(ctx.role)) {
    const { count } = await supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("org_id", ctx.org.id)
      .eq("status", "pending")
      .neq("requester_id", ctx.userId); // count only what this user can actually review
    pending = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-cream md:pl-64">
      <AppNav
        org={ctx.org}
        role={ctx.role}
        memberships={ctx.memberships}
        fullName={ctx.fullName}
        unreadCount={unread ?? 0}
        pendingCount={pending}
      />
      <AppTopBar fullName={ctx.fullName} role={ctx.role} unreadCount={unread ?? 0} />
      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 lg:py-12">{children}</main>
    </div>
  );
}
