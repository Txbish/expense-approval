"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { NewRequestForm } from "@/components/new-request-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useToast } from "@/components/toast";

/**
 * "New request" as an in-page slide-over — a genuine quick action: log an
 * expense without leaving the current screen. On success it closes, refreshes
 * the surrounding lists, and confirms with a toast. The full /requests/new page
 * stays as the deep-link / resubmit fallback. Dismissing a dirty draft asks to
 * confirm so a misclick doesn't discard typed input.
 */
export function NewRequestSheet({
  currency,
  threshold,
  thresholdMinor,
  triggerClassName,
  children,
}: {
  currency: string;
  threshold: string;
  thresholdMinor: number;
  triggerClassName?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  function reallyClose() {
    setOpen(false);
    setDirty(false);
    setConfirmDiscard(false);
  }
  function attemptClose() {
    if (dirty) setConfirmDiscard(true);
    else reallyClose();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") attemptClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // attemptClose closes over `dirty`; re-bind when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, dirty]);

  function handleSuccess(id: string) {
    reallyClose();
    router.refresh();
    push({
      message: "Request submitted",
      tone: "success",
      action: { label: "View", onClick: () => router.push(`/requests/${id}`) },
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="New expense request"
        >
          <div onClick={attemptClose} className="absolute inset-0 animate-fade-in bg-ink/50" aria-hidden />

          <div className="animate-slide-in-right relative flex h-full w-full flex-col overflow-y-auto border-l border-mist bg-cream sm:max-w-md">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-mist bg-cream/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Workspace</p>
                <h2 className="text-subheading text-ink">New expense request</h2>
              </div>
              <button
                type="button"
                onClick={attemptClose}
                aria-label="Close"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-storm/60 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
              >
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5" onInput={() => setDirty(true)}>
              <NewRequestForm
                currency={currency}
                threshold={threshold}
                thresholdMinor={thresholdMinor}
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard this request?"
        body="Your draft hasn't been submitted. Closing now will lose what you've typed."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        tone="danger"
        onConfirm={reallyClose}
        onCancel={() => setConfirmDiscard(false)}
      />
    </>
  );
}
