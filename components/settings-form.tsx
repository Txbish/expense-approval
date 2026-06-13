"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Spinner } from "@/components/ui";
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
          {pending && <Spinner />}
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state?.ok && (
          <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4.5 10.5 8.2 14.2 15.5 5.8" />
            </svg>
            Saved
          </span>
        )}
      </div>
    </form>
  );
}
