"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE } from "@/lib/context";
import { startAction } from "@/lib/logger";

/** Switch the active organization (multi-tenant users). */
export async function switchOrg(orgId: string): Promise<void> {
  startAction("org.switch");
  // Confirm the user actually belongs to the target org (RLS returns nothing otherwise).
  const supabase = await createClient();
  const { data } = await supabase.from("memberships").select("org_id").eq("org_id", orgId).maybeSingle();
  if (data) {
    (await cookies()).set(ORG_COOKIE, orgId, { httpOnly: true, sameSite: "lax", path: "/" });
  }
  redirect("/dashboard");
}

/** Mark all of the current user's notifications as read. */
export async function markAllRead(): Promise<void> {
  startAction("notifications.mark_all_read");
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);
  revalidatePath("/notifications");
  revalidatePath("/", "layout");
}
