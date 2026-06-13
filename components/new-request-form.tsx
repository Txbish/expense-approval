"use client";

import { useActionState } from "react";
import { Button, Field, FormError, Input, Select, Spinner, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/lib/validation";
import { createRequest, type NewRequestState } from "@/app/(app)/requests/new/actions";

export interface RequestDefaults {
  title?: string;
  category?: string;
  amount?: string;
  description?: string;
}

export function NewRequestForm({
  currency,
  threshold,
  defaults,
}: {
  currency: string;
  threshold: string;
  defaults?: RequestDefaults;
}) {
  const [state, action, pending] = useActionState<NewRequestState, FormData>(createRequest, {});
  const defaultCategory =
    defaults?.category && (CATEGORIES as readonly string[]).includes(defaults.category)
      ? defaults.category
      : "Equipment";

  return (
    <form action={action} className="space-y-4">
      <Field label="Title">
        <Input
          name="title"
          required
          placeholder="New developer laptop"
          maxLength={120}
          defaultValue={defaults?.title}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Category">
          <Select name="category" required defaultValue={defaultCategory}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Amount (${currency})`} hint={`Over ${threshold} needs an admin.`}>
          <Input name="amount" required inputMode="decimal" placeholder="1200.00" defaultValue={defaults?.amount} />
        </Field>
      </div>
      <Field label="Justification" hint="Optional — context helps approvers decide faster.">
        <Textarea
          name="description"
          rows={4}
          maxLength={2000}
          placeholder="What is this for?"
          defaultValue={defaults?.description}
        />
      </Field>
      <FormError message={state?.error} />
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending && <Spinner />}
          {pending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
