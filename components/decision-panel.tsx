"use client";

import { useActionState } from "react";
import { Button, FormError, Spinner, Textarea } from "@/components/ui";
import { decideRequest, type DecisionState } from "@/app/(app)/requests/[id]/actions";

export function DecisionPanel({
  requestId,
  overLimit,
  canDecideOverLimit,
  fallback = false,
}: {
  requestId: string;
  overLimit: boolean;
  /** True when this user may decide despite being over the threshold. */
  canDecideOverLimit: boolean;
  /** True when an approver is deciding only because no eligible admin exists. */
  fallback?: boolean;
}) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(decideRequest, {});
  const blockedByLimit = overLimit && !canDecideOverLimit;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      {overLimit && fallback && (
        <p className="rounded-lg border border-blue/35 bg-blue/8 px-3 py-2 text-xs text-ink">
          This is above the threshold, but <strong>no other admin is available</strong> — so you&apos;re
          authorized to decide it as an approver.
        </p>
      )}
      {overLimit && !fallback && (
        <p className="rounded-lg border border-orange/50 bg-orange/8 px-3 py-2 text-xs text-ink">
          This request is above the approval threshold
          {blockedByLimit ? (
            <> and requires an <strong>admin</strong> to decide.</>
          ) : (
            <>, an <strong>admin</strong> decision.</>
          )}
        </p>
      )}
      <Textarea
        name="note"
        rows={2}
        placeholder="Add a note (optional, shown to the requester)…"
        maxLength={1000}
      />
      <FormError message={state?.error} />
      <div className="flex gap-3">
        <Button
          type="submit"
          name="decision"
          value="approved"
          variant="approve"
          disabled={pending || blockedByLimit}
          className="flex-1"
        >
          {pending ? <Spinner /> : "Approve"}
        </Button>
        <Button
          type="submit"
          name="decision"
          value="rejected"
          variant="danger"
          disabled={pending || blockedByLimit}
          className="flex-1"
        >
          {pending ? <Spinner /> : "Reject"}
        </Button>
      </div>
      {blockedByLimit && (
        <p className="text-center text-xs text-storm/65">
          Only an admin can decide a request above the threshold.
        </p>
      )}
    </form>
  );
}
