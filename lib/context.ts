import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Membership, Organization, Role } from "@/lib/types";

export const ORG_COOKIE = "current_org";

export interface MembershipWithOrg extends Membership {
  organizations: Organization;
}

export interface AppContext {
  userId: string;
  email: string | null;
  fullName: string | null;
  memberships: MembershipWithOrg[];
  org: Organization;
  role: Role;
}

/**
 * Resolves the signed-in user's active org + role. Returns null when there is no
 * authenticated user OR the user has no membership yet (caller routes them to
 * onboarding). The active org comes from the `current_org` cookie when valid,
 * otherwise the earliest membership.
 */
export async function getAppContext(): Promise<AppContext | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // NOTE: the memberships RLS policy lets members see co-members (for the admin
  // Members screen), so this MUST be scoped to the current user — otherwise we'd
  // read the whole org's memberships and mis-resolve this user's role.
  const { data } = await supabase
    .from("memberships")
    .select("*, organizations(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const memberships = (data ?? []) as MembershipWithOrg[];
  if (memberships.length === 0) return null;

  const cookieStore = await cookies();
  const wanted = cookieStore.get(ORG_COOKIE)?.value;
  const active =
    memberships.find((m) => m.org_id === wanted) ?? memberships[0];

  return {
    userId: user.id,
    email: user.email ?? null,
    fullName: (user.user_metadata?.full_name as string) ?? null,
    memberships,
    org: active.organizations,
    role: active.role as Role,
  };
}

export function isApprover(role: Role): boolean {
  return role === "approver" || role === "admin";
}
