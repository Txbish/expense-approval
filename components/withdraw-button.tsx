"use client";

import { useActionState } from "react";
import { Button, FormError } from "@/components/ui";
import { withdrawRequest, type DecisionState } from "@/app/(app)/requests/[id]/actions";

export function WithdrawButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState<DecisionState, FormData>(withdrawRequest, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="requestId" value={requestId} />
      <Button type="submit" variant="secondary" disabled={pending} className="w-full">
        {pending ? "Withdrawing…" : "Withdraw request"}
      </Button>
      <FormError message={state?.error} />
    </form>
  );
}
