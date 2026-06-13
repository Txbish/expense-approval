"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppContext } from "@/lib/context";
import { inviteSchema } from "@/lib/validation";
import { startAction } from "@/lib/logger";
import type { Role } from "@/lib/types";

export interface InviteState {
  error?: string;
  token?: string;
  email?: string;
}

export async function inviteMember(_prev: InviteState, formData: FormData): Promise<InviteState> {
  startAction("member.invite");
  const ctx = await getAppContext();
  if (!ctx || ctx.role !== "admin") return { error: "Only admins can invite members." };

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .insert({
      org_id: ctx.org.id,
      email: parsed.data.email,
      role: parsed.data.role,
      invited_by: ctx.userId,
    })
    .select("token")
    .single<{ token: string }>();

  if (error || !data) return { error: "Could not create the invitation." };
  revalidatePath("/members");
  return { token: data.token, email: parsed.data.email };
}

export async function changeRole(formData: FormData): Promise<void> {
  startAction("member.change_role");
  const ctx = await getAppContext();
  if (!ctx || ctx.role !== "admin") return;
  const membershipId = String(formData.get("membershipId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  if (!["admin", "approver", "requester"].includes(role)) return;

  const supabase = await createClient();
  await supabase.from("memberships").update({ role }).eq("id", membershipId);
  revalidatePath("/members");
}

export async function removeMember(formData: FormData): Promise<void> {
  startAction("member.remove");
  const ctx = await getAppContext();
  if (!ctx || ctx.role !== "admin") return;
  const membershipId = String(formData.get("membershipId") ?? "");
  const targetUserId = String(formData.get("userId") ?? "");
  // Don't let an admin remove themselves (avoids accidental self-lockout).
  if (targetUserId === ctx.userId) return;

  const supabase = await createClient();
  await supabase.from("memberships").delete().eq("id", membershipId);
  revalidatePath("/members");
}

export async function revokeInvite(formData: FormData): Promise<void> {
  startAction("member.revoke_invite");
  const ctx = await getAppContext();
  if (!ctx || ctx.role !== "admin") return;
  const inviteId = String(formData.get("inviteId") ?? "");
  const supabase = await createClient();
  await supabase.from("invitations").delete().eq("id", inviteId);
  revalidatePath("/members");
}
