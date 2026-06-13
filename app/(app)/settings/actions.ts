"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAppContext } from "@/lib/context";
import { orgSettingsSchema } from "@/lib/validation";
import { parseAmountToMinor } from "@/lib/format";

export interface SettingsState {
  error?: string;
  ok?: boolean;
}

export async function updateSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const ctx = await getAppContext();
  if (!ctx || ctx.role !== "admin") return { error: "Only admins can change settings." };

  const thresholdMinor = parseAmountToMinor(String(formData.get("threshold") ?? "")) ?? 0;
  const parsed = orgSettingsSchema.safeParse({
    name: formData.get("name"),
    currency: formData.get("currency"),
    thresholdMinor,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: parsed.data.name,
      default_currency: parsed.data.currency,
      approval_threshold_minor: parsed.data.thresholdMinor,
    })
    .eq("id", ctx.org.id);

  if (error) return { error: "Could not save settings." };
  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
