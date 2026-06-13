"use client";

import { useActionState } from "react";
import { Button, FormError, Spinner, Textarea } from "@/components/ui";
import { decideRequest, type DecisionState } from "@/app/(app)/requests/[id]/actions";

export function DecisionPanel({
  requestId,
  overLimit,
  canApproveOverLimit,
}: {
  requestId: string;
  overLimit: boolean;
  canApproveOverLimit: boolean;
}) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(decideRequest, {});
  const blockedByLimit = overLimit && !canApproveOverLimit;

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="requestId" value={requestId} />
      {overLimit && (
        <p className="rounded-md border border-accent-line bg-accent-wash px-3 py-2 text-xs text-accent-ink">
          This request is above the approval threshold and requires an <strong>admin</strong> to decide.
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
          disabled={pending}
          className="flex-1"
        >
          {pending ? <Spinner /> : "Reject"}
        </Button>
      </div>
      {blockedByLimit && (
        <p className="text-center text-xs text-muted">
          You can still reject it, but only an admin can approve.
        </p>
      )}
    </form>
  );
}
