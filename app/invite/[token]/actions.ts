"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE } from "@/lib/context";
import { startAction } from "@/lib/logger";

export interface AcceptState {
  error?: string;
}

export async function acceptInvite(_prev: AcceptState, formData: FormData): Promise<AcceptState> {
  startAction("invite.accept");
  const token = String(formData.get("token") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("accept_invitation", { p_token: token })
    .single<{ org_id: string }>();
  if (error || !data) return { error: error?.message ?? "Could not accept this invitation." };

  (await cookies()).set(ORG_COOKIE, data.org_id, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect("/dashboard");
}
