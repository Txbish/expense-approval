"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAppContext } from "@/lib/context";
import { newRequestSchema } from "@/lib/validation";
import { parseAmountToMinor } from "@/lib/format";
import { log, newRequestId } from "@/lib/logger";

export interface NewRequestState {
  error?: string;
}

export async function createRequest(
  _prev: NewRequestState,
  formData: FormData,
): Promise<NewRequestState> {
  const rid = newRequestId();
  const ctx = await getAppContext();
  if (!ctx) redirect("/onboarding");

  const amountMinor = parseAmountToMinor(String(formData.get("amount") ?? ""));
  const parsed = newRequestSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    amountMinor: amountMinor ?? NaN,
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();
  // currency is set server-side by the before-insert trigger; status is pinned
  // to 'pending'. We send a placeholder currency to satisfy NOT NULL.
  const { data, error } = await supabase
    .from("requests")
    .insert({
      org_id: ctx.org.id,
      requester_id: ctx.userId,
      title: parsed.data.title,
      category: parsed.data.category,
      amount_minor: parsed.data.amountMinor,
      description: parsed.data.description || null,
      currency: "XXX",
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) {
    log("error", "request.create_failed", { rid, org: ctx.org.id, reason: error?.message });
    return { error: "Could not submit your request. Please try again." };
  }

  log("info", "request.created", { rid, org: ctx.org.id, request: data.id });
  redirect(`/requests/${data.id}`);
}
