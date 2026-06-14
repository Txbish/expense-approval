"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Spinner } from "@/components/ui";
import type { AuthState } from "@/app/login/actions";

interface AuthFormProps {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "signup";
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <Field label="Full name" required>
          <Input name="full_name" required autoComplete="name" placeholder="Jane Doe" />
        </Field>
      )}
      <Field label="Work email" required>
        <Input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </Field>
      <Field label="Password" required hint={mode === "signup" ? "At least 8 characters." : undefined}>
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </Field>
      <FormError message={state?.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner />}
        {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
