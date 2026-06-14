"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button, Spinner } from "@/components/ui";

/**
 * A <Button type="submit"> that reflects the enclosing form's pending state —
 * disables itself and shows a spinner while a server action runs, so plain
 * server-action forms get the same feedback as useActionState forms.
 */
export function SubmitButton({
  children,
  pendingText,
  disabled,
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending && <Spinner />}
      {pending ? pendingText ?? children : children}
    </Button>
  );
}
