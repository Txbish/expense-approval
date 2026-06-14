"use client";

import { useActionState, useState } from "react";
import { Button, Card, Field, FormError, Input, Spinner } from "@/components/ui";
import { parseAmountToMinor } from "@/lib/format";
import { createOrg, joinByToken, type OnboardState } from "@/app/onboarding/actions";

export function OnboardingForms() {
  const [createState, createAction, creating] = useActionState<OnboardState, FormData>(createOrg, {});
  const [joinState, joinAction, joining] = useActionState<OnboardState, FormData>(joinByToken, {});

  const [nameError, setNameError] = useState<string | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [thresholdError, setThresholdError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-subheading text-ink">Create an organization</h2>
        <p className="mt-1 text-caption text-storm/75">You&apos;ll be its admin and first approver.</p>
        <form action={createAction} className="mt-5 space-y-4">
          <Field label="Organization name" required error={nameError}>
            <Input
              name="name"
              required
              placeholder="Acme Inc"
              aria-invalid={nameError ? true : undefined}
              onBlur={(e) =>
                setNameError(e.currentTarget.value.trim().length < 2 ? "Organization name is too short." : null)
              }
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Currency" required error={currencyError}>
              <Input
                name="currency"
                required
                maxLength={3}
                defaultValue="USD"
                className="uppercase"
                aria-invalid={currencyError ? true : undefined}
                onBlur={(e) =>
                  setCurrencyError(/^[A-Za-z]{3}$/.test(e.currentTarget.value.trim()) ? null : "Use a 3-letter code, e.g. USD.")
                }
              />
            </Field>
            <Field label="Approval threshold" required error={thresholdError} hint="Above this needs an admin.">
              <Input
                name="threshold"
                required
                defaultValue="1000"
                inputMode="decimal"
                aria-invalid={thresholdError ? true : undefined}
                onBlur={(e) => {
                  const m = parseAmountToMinor(e.currentTarget.value);
                  setThresholdError(m === null || m < 0 ? "Enter a valid amount (0 or more)." : null);
                }}
              />
            </Field>
          </div>
          <FormError message={createState?.error} />
          <Button type="submit" disabled={creating} className="w-full">
            {creating && <Spinner />}
            {creating ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-subheading text-ink">Join with an invite</h2>
        <p className="mt-1 text-caption text-storm/75">Paste the invite code an admin shared with you.</p>
        <form action={joinAction} className="mt-5 space-y-4">
          <Field label="Invite code" required error={tokenError}>
            <Input
              name="token"
              required
              placeholder="e.g. 3f9a1c…"
              className="font-mono"
              aria-invalid={tokenError ? true : undefined}
              onBlur={(e) => {
                const v = e.currentTarget.value.trim();
                setTokenError(v.length > 0 && v.length < 6 ? "Paste the full invite code." : null);
              }}
            />
          </Field>
          <FormError message={joinState?.error} />
          <Button type="submit" variant="secondary" disabled={joining} className="w-full">
            {joining && <Spinner />}
            {joining ? "Joining…" : "Join organization"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
