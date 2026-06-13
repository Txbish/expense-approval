"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export interface AuthState {
  error?: string;
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email and password are required." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    log("warn", "auth.signin_failed", { email });
    return { error: "Invalid email or password." };
  }
  redirect("/dashboard");
}
