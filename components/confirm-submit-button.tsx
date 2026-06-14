"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";

/**
 * A submit control for destructive server-action forms: it confirms before
 * submitting and shows a pending state while the action runs. Drop it inside a
 * <form action={...}> in place of a plain submit button.
 */
export function ConfirmSubmitButton({
  children,
  className,
  title,
  body,
  confirmLabel = "Confirm",
  tone = "danger",
}: {
  children: ReactNode;
  className?: string;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  tone?: "primary" | "approve" | "danger";
}) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button ref={ref} type="button" disabled={pending} onClick={() => setOpen(true)} className={className}>
        {pending ? <Spinner /> : children}
      </button>
      <ConfirmDialog
        open={open}
        title={title}
        body={body}
        confirmLabel={confirmLabel}
        tone={tone}
        onConfirm={() => {
          setOpen(false);
          ref.current?.form?.requestSubmit();
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
