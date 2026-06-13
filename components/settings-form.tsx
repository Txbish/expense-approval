"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input } from "@/components/ui";
import { updateSettings, type SettingsState } from "@/app/(app)/settings/actions";

export function SettingsForm({
  name,
  currency,
  threshold,
}: {
  name: string;
  currency: string;
  threshold: string;
}) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(updateSettings, {});

  return (
    <form action={action} className="space-y-4">
      <Field label="Organization name">
        <Input name="name" required defaultValue={name} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Default currency">
          <Input name="currency" required maxLength={3} defaultValue={currency} className="uppercase" />
        </Field>
        <Field label="Approval threshold" hint="Requests above this require an admin.">
          <Input name="threshold" required inputMode="decimal" defaultValue={threshold} />
        </Field>
      </div>
      <FormError message={state?.error} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state?.ok && <span className="text-sm text-emerald-600">Saved ✓</span>}
      </div>
    </form>
  );
}
