"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui";

/**
 * A spinner that appears only while its enclosing form is submitting. Drop it
 * inside a server-action form (e.g. a submit-on-change Select) to give the
 * otherwise-silent submission a pending indicator.
 */
export function FormPending({ className }: { className?: string }) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return <Spinner className={className} />;
}
