"use client";

import { useActionState } from "react";
import { Button, FormError, Spinner } from "@/components/ui";
import { acceptInvite, type AcceptState } from "@/app/invite/[token]/actions";

export function AcceptInvite({ token }: { token: string }) {
  const [state, action, pending] = useActionState<AcceptState, FormData>(acceptInvite, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="token" value={token} />
      <FormError message={state?.error} />
      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Spinner />}
        {pending ? "Joining…" : "Accept invitation"}
      </Button>
    </form>
  );
}
