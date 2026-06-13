import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/context";
import { createClient } from "@/lib/supabase/server";
import { profilesByIds, nameOf } from "@/lib/queries";
import { MembersAdmin, type MemberRow, type InviteRow } from "@/components/members-admin";
import type { Invitation, Membership } from "@/lib/types";

export default async function MembersPage() {
  const ctx = (await getAppContext())!;
  if (ctx.role !== "admin") redirect("/dashboard");

  const supabase = await createClient();
  const { data: membershipData } = await supabase
    .from("memberships")
    .select("*")
    .eq("org_id", ctx.org.id)
    .order("created_at", { ascending: true });
  const memberships = (membershipData ?? []) as Membership[];

  const profiles = await profilesByIds(supabase, memberships.map((m) => m.user_id));
  const members: MemberRow[] = memberships.map((m) => ({
    membershipId: m.id,
    userId: m.user_id,
    name: nameOf(profiles, m.user_id),
    email: profiles.get(m.user_id)?.email ?? "",
    role: m.role,
    isSelf: m.user_id === ctx.userId,
  }));

  const { data: inviteData } = await supabase
    .from("invitations")
    .select("*")
    .eq("org_id", ctx.org.id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });
  const invites: InviteRow[] = ((inviteData ?? []) as Invitation[]).map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    token: i.token,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Members &amp; roles</h1>
        <p className="text-sm text-slate-500">Manage who can request, approve, and administer {ctx.org.name}.</p>
      </div>
      <MembersAdmin members={members} invites={invites} />
    </div>
  );
}
