"use client";

import { useActionState, useState } from "react";
import { Button, Field, FormError, Input, Spinner } from "@/components/ui";
import type { AuthState } from "@/app/login/actions";

interface AuthFormProps {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  mode: "login" | "signup";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "signup" && (
        <Field label="Full name" required>
          <Input name="full_name" required autoComplete="name" placeholder="Jane Doe" />
        </Field>
      )}
      <Field label="Work email" required error={emailError}>
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={emailError ? true : undefined}
          onBlur={(e) => {
            const v = e.currentTarget.value.trim();
            setEmailError(v && !EMAIL_RE.test(v) ? "Enter a valid email address." : null);
          }}
        />
      </Field>
      <Field
        label="Password"
        required
        error={passwordError}
        hint={mode === "signup" ? "At least 8 characters." : undefined}
      >
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          aria-invalid={passwordError ? true : undefined}
          onBlur={(e) => {
            const v = e.currentTarget.value;
            // Only nudge on sign-up; existing accounts may pre-date the rule.
            setPasswordError(mode === "signup" && v.length > 0 && v.length < 8 ? "Use at least 8 characters." : null);
          }}
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
