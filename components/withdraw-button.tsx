"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Button, FormError, Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";
import { withdrawRequest, type DecisionState } from "@/app/(app)/requests/[id]/actions";

export function WithdrawButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(withdrawRequest, {});
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const notified = useRef(false);

  useEffect(() => {
    if (state?.ok && !notified.current) {
      notified.current = true;
      push({ message: "Request withdrawn", tone: "success" });
    }
  }, [state, push]);

  return (
    <form ref={formRef} action={action} className="space-y-2">
      <input type="hidden" name="requestId" value={requestId} />
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        className="w-full"
        onClick={() => setOpen(true)}
      >
        {pending && <Spinner />}
        {pending ? "Withdrawing…" : "Withdraw request"}
      </Button>
      <FormError message={state?.error} />
      <ConfirmDialog
        open={open}
        title="Withdraw this request?"
        body="It'll be marked withdrawn and removed from the approval queue. You can resubmit a new one later."
        confirmLabel="Withdraw"
        tone="danger"
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
        onCancel={() => setOpen(false)}
      />
    </form>
  );
}
