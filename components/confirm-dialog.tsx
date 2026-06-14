"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";

/**
 * A small, focused confirmation modal — a deliberate hard-stop layered over
 * consequential actions (e.g. approving an above-threshold expense). Scrim
 * dismisses, Escape cancels, the confirm button takes initial focus.
 */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Visual weight of the confirm button — match it to the action. */
  tone?: "primary" | "approve" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div onClick={onCancel} className="absolute inset-0 animate-fade-in bg-ink/60" aria-hidden />
      <div className="animate-scale-in relative w-full max-w-sm rounded-2xl border border-mist bg-cream p-6">
        <h2 className="text-subheading text-ink">{title}</h2>
        <div className="mt-2 text-caption leading-relaxed text-storm/75">{body}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={tone} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
