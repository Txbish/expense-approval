import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";

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
      .eq("status", "pending");
    pending = count ?? 0;
  }

  return (
    <div className="min-h-screen bg-bg md:pl-60">
      <AppNav
        org={ctx.org}
        role={ctx.role}
        memberships={ctx.memberships}
        fullName={ctx.fullName}
        unreadCount={unread ?? 0}
        pendingCount={pending}
      />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:px-8 lg:py-10">{children}</main>
    </div>
  );
}
