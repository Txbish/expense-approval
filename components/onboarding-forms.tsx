"use client";

import { useActionState } from "react";
import { Button, Card, Field, FormError, Input } from "@/components/ui";
import { createOrg, joinByToken, type OnboardState } from "@/app/onboarding/actions";

export function OnboardingForms() {
  const [createState, createAction, creating] = useActionState<OnboardState, FormData>(createOrg, {});
  const [joinState, joinAction, joining] = useActionState<OnboardState, FormData>(joinByToken, {});

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create an organization</h2>
        <p className="mt-1 text-sm text-slate-500">You&apos;ll be its admin and first approver.</p>
        <form action={createAction} className="mt-4 space-y-4">
          <Field label="Organization name">
            <Input name="name" required placeholder="Acme Inc" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Currency">
              <Input name="currency" required maxLength={3} defaultValue="USD" className="uppercase" />
            </Field>
            <Field label="Approval threshold" hint="Above this needs an admin.">
              <Input name="threshold" required defaultValue="1000" inputMode="decimal" />
            </Field>
          </div>
          <FormError message={createState?.error} />
          <Button type="submit" disabled={creating} className="w-full">
            {creating ? "Creating…" : "Create organization"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Join with an invite</h2>
        <p className="mt-1 text-sm text-slate-500">Paste the invite code an admin shared with you.</p>
        <form action={joinAction} className="mt-4 space-y-4">
          <Field label="Invite code">
            <Input name="token" required placeholder="e.g. 3f9a1c…" className="font-mono" />
          </Field>
          <FormError message={joinState?.error} />
          <Button type="submit" variant="secondary" disabled={joining} className="w-full">
            {joining ? "Joining…" : "Join organization"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
