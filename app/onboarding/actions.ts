"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ORG_COOKIE } from "@/lib/context";
import { createOrgSchema } from "@/lib/validation";
import { parseAmountToMinor } from "@/lib/format";
import { log } from "@/lib/logger";

export interface OnboardState {
  error?: string;
}

export async function createOrg(_prev: OnboardState, formData: FormData): Promise<OnboardState> {
  const thresholdMinor = parseAmountToMinor(String(formData.get("threshold") ?? "0")) ?? 0;
  const parsed = createOrgSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    thresholdMinor,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_organization", {
      p_name: parsed.data.name,
      p_currency: parsed.data.currency,
      p_threshold_minor: parsed.data.thresholdMinor,
    })
    .single<{ id: string }>();

  if (error || !data) {
    log("error", "org.create_failed", { reason: error?.message });
    return { error: "Could not create the organization. Please try again." };
  }

  (await cookies()).set(ORG_COOKIE, data.id, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect("/dashboard");
}

export async function joinByToken(_prev: OnboardState, formData: FormData): Promise<OnboardState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { error: "Paste the invite code you were given." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("accept_invitation", { p_token: token })
    .single<{ org_id: string }>();

  if (error || !data) {
    return { error: error?.message ?? "That invite code is not valid." };
  }

  (await cookies()).set(ORG_COOKIE, data.org_id, { httpOnly: true, sameSite: "lax", path: "/" });
  redirect("/dashboard");
}
