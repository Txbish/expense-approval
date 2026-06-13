"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { decisionSchema } from "@/lib/validation";
import { log, startAction } from "@/lib/logger";

export interface DecisionState {
  error?: string;
  ok?: boolean;
}

export async function decideRequest(
  _prev: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const rid = startAction("request.decide");
  const parsed = decisionSchema.safeParse({
    requestId: formData.get("requestId"),
    decision: formData.get("decision"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { error: "Invalid decision." };

  const supabase = await createClient();
  // ALL authorization (approver role, no self-approval, threshold routing,
  // already-decided race) is enforced inside the RPC — the client cannot bypass it.
  const { error } = await supabase.rpc("decide_request", {
    p_request: parsed.data.requestId,
    p_decision: parsed.data.decision,
    p_note: parsed.data.note || undefined,
  });

  if (error) {
    log("warn", "request.decision_rejected", { rid, request: parsed.data.requestId, reason: error.message });
    return { error: error.message };
  }

  log("info", "request.decided", { rid, request: parsed.data.requestId, decision: parsed.data.decision });
  revalidatePath(`/requests/${parsed.data.requestId}`);
  revalidatePath("/queue");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function withdrawRequest(
  _prev: DecisionState,
  formData: FormData,
): Promise<DecisionState> {
  const rid = startAction("request.withdraw");
  const requestId = String(formData.get("requestId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("withdraw_request", { p_request: requestId });
  if (error) {
    log("warn", "request.withdraw_rejected", { rid, request: requestId, reason: error.message });
    return { error: error.message };
  }
  revalidatePath(`/requests/${requestId}`);
  revalidatePath("/requests");
  return { ok: true };
}
