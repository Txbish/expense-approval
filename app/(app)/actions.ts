"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE, getAppContext } from "@/lib/context";
import { startAction } from "@/lib/logger";

/**
 * Switch the active organization (multi-tenant users). The whole app re-renders
 * in the target org because every query reads the active org from this cookie.
 * `redirectTo` lets a deep link (e.g. the cross-org banner) land you back on the
 * page you came from, now in the right org; otherwise we reset to the dashboard.
 */
export async function switchOrg(orgId: string, redirectTo?: string): Promise<void> {
  startAction("org.switch");
  // Confirm the user actually belongs to the target org (RLS returns nothing otherwise).
  const supabase = await createClient();
  const { data } = await supabase.from("memberships").select("org_id").eq("org_id", orgId).maybeSingle();
  if (data) {
    (await cookies()).set(ORG_COOKIE, orgId, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  // Only honor in-app paths — never an open redirect.
  const dest =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/dashboard";
  redirect(dest);
}

/** Mark the active org's notifications as read (notifications are org-scoped). */
export async function markAllRead(): Promise<void> {
  startAction("notifications.mark_all_read");
  const ctx = await getAppContext();
  if (!ctx) return;
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("org_id", ctx.org.id)
    .is("read_at", null);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
