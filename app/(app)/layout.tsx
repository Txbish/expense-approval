import { redirect } from "next/navigation";
import { getAppContext, isApprover } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app-nav";
import { AppTopBar } from "@/components/app-topbar";
import type { AppNotification } from "@/lib/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/onboarding");

  const supabase = await createClient();

  const { count: unread } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("org_id", ctx.org.id)
    .is("read_at", null);

  // Recent inbox for the bell popover; the full history lives at /notifications.
  const { data: notifData } = await supabase
    .from("notifications")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: false })
    .limit(10);
  const notifications = (notifData ?? []) as AppNotification[];

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
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-field focus:font-medium focus:text-cream"
      >
        Skip to content
      </a>
      <AppNav
        org={ctx.org}
        role={ctx.role}
        memberships={ctx.memberships}
        fullName={ctx.fullName}
        unreadCount={unread ?? 0}
        pendingCount={pending}
        notifications={notifications}
      />
      <AppTopBar
        orgName={ctx.org.name}
        fullName={ctx.fullName}
        role={ctx.role}
        unreadCount={unread ?? 0}
        notifications={notifications}
      />
      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-5 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] focus:outline-none sm:px-8 lg:py-12">{children}</main>
    </div>
  );
}
