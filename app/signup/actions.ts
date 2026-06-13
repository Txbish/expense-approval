"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import type { AuthState } from "@/app/login/actions";

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) {
    log("warn", "auth.signup_failed", { email, reason: error.message });
    return { error: error.message };
  }
  // Email confirmation is disabled for this demo, so the user is signed in now.
  redirect("/onboarding");
}
