"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, FormError, Spinner, Textarea } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { decideRequest, type DecisionState } from "@/app/(app)/requests/[id]/actions";

type Decision = "approved" | "rejected";

export function DecisionPanel({
  requestId,
  overLimit,
  canDecideOverLimit,
  fallback = false,
  amountLabel,
  onDecided,
}: {
  requestId: string;
  overLimit: boolean;
  /** True when this user may decide despite being over the threshold. */
  canDecideOverLimit: boolean;
  /** True when an approver is deciding only because no eligible admin exists. */
  fallback?: boolean;
  /** Pretty amount (e.g. "$2,400.00") used in the above-threshold confirm copy. */
  amountLabel?: string;
  /** Fired once after a decision succeeds — lets a host (the queue drawer) advance. */
  onDecided?: (decision: Decision) => void;
}) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(decideRequest, {});
  const { push } = useToast();
  const blockedByLimit = overLimit && !canDecideOverLimit;

  // Which button is in flight — so only the clicked one spins (not both).
  const [submitting, setSubmitting] = useState<Decision | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const decisionRef = useRef<HTMLInputElement>(null);
  const firedDecision = useRef<Decision | null>(null);
  const notified = useRef(false);

  // Notify the host exactly once when a decision lands successfully.
  useEffect(() => {
    if (state?.ok && !notified.current) {
      notified.current = true;
      const decision = firedDecision.current ?? "approved";
      push({ message: decision === "rejected" ? "Request rejected" : "Request approved", tone: "success" });
      onDecided?.(decision);
    }
  }, [state, onDecided, push]);

  function fire(decision: Decision) {
    if (decisionRef.current) decisionRef.current.value = decision;
    firedDecision.current = decision;
    setSubmitting(decision);
    formRef.current?.requestSubmit();
  }

  function onApprove() {
    // Above-threshold approvals are consequential — confirm before releasing.
    if (overLimit) setConfirmOpen(true);
    else fire("approved");
  }

  return (
    <>
      <form ref={formRef} action={action} className="space-y-3">
        <input type="hidden" name="requestId" value={requestId} />
        <input ref={decisionRef} type="hidden" name="decision" defaultValue="" />

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
            type="button"
            variant="approve"
            disabled={pending || blockedByLimit}
            onClick={onApprove}
            className="flex-1"
          >
            {pending && submitting === "approved" ? <Spinner /> : "Approve"}
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={pending || blockedByLimit}
            onClick={() => fire("rejected")}
            className="flex-1"
          >
            {pending && submitting === "rejected" ? <Spinner /> : "Reject"}
          </Button>
        </div>

        {blockedByLimit && (
          <p className="text-center text-xs text-storm/65">
            Only an admin can decide a request above the threshold.
          </p>
        )}
      </form>

      <ConfirmDialog
        open={confirmOpen}
        title="Approve above threshold?"
        body={
          <>
            This expense{amountLabel ? <> of <strong>{amountLabel}</strong></> : ""} is above your
            approval threshold. Approving releases it for payment — this can&apos;t be undone.
          </>
        }
        confirmLabel="Approve"
        tone="approve"
        onConfirm={() => {
          setConfirmOpen(false);
          fire("approved");
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
