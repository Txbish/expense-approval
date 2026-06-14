"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Field, FormError, Input, Select, Spinner, Textarea } from "@/components/ui";
import { CATEGORIES } from "@/lib/validation";
import { parseAmountToMinor } from "@/lib/format";
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
  thresholdMinor,
  defaults,
  onSuccess,
}: {
  currency: string;
  threshold: string;
  thresholdMinor: number;
  defaults?: RequestDefaults;
  /** When provided, called with the new id instead of navigating to it. */
  onSuccess?: (id: string) => void;
}) {
  const [state, action, pending] = useActionState<NewRequestState, FormData>(createRequest, {});
  const router = useRouter();
  const handled = useRef(false);

  const defaultCategory =
    defaults?.category && (CATEGORIES as readonly string[]).includes(defaults.category)
      ? defaults.category
      : "Equipment";

  const [amount, setAmount] = useState(defaults?.amount ?? "");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

  const amountMinor = parseAmountToMinor(amount);
  const overThreshold = amountMinor !== null && amountMinor > thresholdMinor;

  useEffect(() => {
    if (state?.ok && state.id && !handled.current) {
      handled.current = true;
      if (onSuccess) onSuccess(state.id);
      else router.push(`/requests/${state.id}`);
    }
  }, [state, onSuccess, router]);

  function validateAmount() {
    if (amount.trim() === "") return setAmountError(null);
    const m = parseAmountToMinor(amount);
    setAmountError(m === null || m <= 0 ? "Enter a valid amount greater than zero." : null);
  }
  function validateTitle(value: string) {
    const t = value.trim();
    setTitleError(t.length > 0 && t.length < 3 ? "Give it a short title (3+ characters)." : null);
  }

  return (
    <form action={action} className="space-y-4">
      <Field label="Title" required>
        <Input
          name="title"
          required
          placeholder="New developer laptop"
          maxLength={120}
          defaultValue={defaults?.title}
          aria-invalid={titleError ? true : undefined}
          onBlur={(e) => validateTitle(e.currentTarget.value)}
        />
        {titleError && <FieldError>{titleError}</FieldError>}
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Category" required>
          <Select name="category" required defaultValue={defaultCategory}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={`Amount (${currency})`} required>
          <Input
            name="amount"
            required
            inputMode="decimal"
            placeholder="1200.00"
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            onBlur={validateAmount}
            aria-invalid={amountError ? true : undefined}
          />
          {amountError ? (
            <FieldError>{amountError}</FieldError>
          ) : overThreshold ? (
            <span className="flex items-center gap-1.5 text-caption font-medium text-ink" role="status">
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-orange" fill="currentColor" aria-hidden>
                <path d="M10 2.5 18.5 17H1.5L10 2.5Zm0 5.2a.9.9 0 0 0-.9.9v3a.9.9 0 1 0 1.8 0v-3a.9.9 0 0 0-.9-.9Zm0 6.1a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
              </svg>
              Above {threshold} — an admin will need to approve this.
            </span>
          ) : (
            <span className="block text-caption text-storm/70">Over {threshold} needs an admin.</span>
          )}
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

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <span role="alert" className="block text-caption text-destructive">
      {children}
    </span>
  );
}
