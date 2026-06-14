"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Money } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { DecisionPanel } from "@/components/decision-panel";
import { formatMoney, timeAgo } from "@/lib/format";

/** A queue row's worth of data plus its precomputed decision capability. */
export interface ReviewItem {
  id: string;
  title: string;
  category: string;
  amountMinor: number;
  currency: string;
  requesterName: string;
  createdAt: string;
  description: string | null;
  overLimit: boolean;
  /** Whether THIS user may approve/reject it (false → admin-required, blocked). */
  canDecide: boolean;
  /** Approver is authorized only because no eligible admin exists. */
  fallback: boolean;
}

/**
 * The review slide-over: an approver decides a request in place without leaving
 * the queue. Reuses the same DecisionPanel (and server action) as the full
 * detail page, so authorization and behavior never diverge. Closes on scrim
 * click / Escape; a "Decision" success advances the queue via onDecided.
 */
export function ReviewDrawer({
  item,
  position,
  total,
  onClose,
  onDecided,
}: {
  item: ReviewItem | null;
  position: number;
  total: number;
  onClose: () => void;
  onDecided: () => void;
}) {
  const open = item !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`Review ${item.title}`}
    >
      <div onClick={onClose} className="absolute inset-0 animate-fade-in bg-ink/50" aria-hidden />

      <div className="animate-slide-in-right relative flex h-full w-full flex-col overflow-y-auto border-l border-mist bg-cream sm:max-w-md">
        {/* Header — progress + close */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-mist bg-cream/95 px-5 py-4 backdrop-blur">
          <p className="text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">
            Review · {position} of {total}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close review"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-storm/60 transition-colors hover:bg-ink/6 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div className="flex-1 space-y-5 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1.5">
              <p className="text-2xs font-medium uppercase tracking-[0.14em] text-storm/55">{item.category}</p>
              <h2 className="text-heading-sm text-ink">{item.title}</h2>
              <p className="text-caption text-storm/70">
                requested by {item.requesterName} · {timeAgo(item.createdAt)}
              </p>
            </div>
            <StatusBadge status="pending" admin={item.overLimit} />
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <Money minor={item.amountMinor} currency={item.currency} className="text-heading-sm text-ink" />
            {item.overLimit && (
              <span className="rounded-md border border-orange/55 bg-orange/8 px-2 py-1 text-2xs font-semibold uppercase tracking-wide text-ink">
                Above threshold · admin required
              </span>
            )}
          </div>

          {item.description && (
            <p className="whitespace-pre-wrap rounded-xl border border-mist bg-cream p-4 text-field leading-relaxed text-storm">
              {item.description}
            </p>
          )}

          {item.canDecide ? (
            <div className="rounded-xl border border-mist bg-card p-4">
              <p className="mb-3 text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Decision</p>
              <DecisionPanel
                key={item.id}
                requestId={item.id}
                overLimit={item.overLimit}
                canDecideOverLimit
                fallback={item.fallback}
                amountLabel={formatMoney(item.amountMinor, item.currency)}
                onDecided={onDecided}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-orange/50 bg-orange/8 p-4">
              <p className="text-field font-medium text-ink">An admin must decide this one</p>
              <p className="mt-1 text-caption text-storm/75">
                At {formatMoney(item.amountMinor, item.currency)}, this is above the threshold. Only an
                admin can approve or reject it.
              </p>
            </div>
          )}

          <Link
            href={`/requests/${item.id}?from=queue`}
            className="inline-flex items-center gap-1 text-2xs font-medium uppercase tracking-[0.12em] text-blue transition-colors hover:underline"
          >
            View full request &amp; history ↗
          </Link>
        </div>
      </div>
    </div>
  );
}
