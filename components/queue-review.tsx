"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { EmptyState, Money } from "@/components/ui";
import { StatusBadge } from "@/components/status-badge";
import { ReviewDrawer, type ReviewItem } from "@/components/review-drawer";
import { timeAgo } from "@/lib/format";

export type { ReviewItem } from "@/components/review-drawer";

/**
 * The approval queue as a throughput surface: each row opens a review drawer
 * and a decision advances to the next pending item in place — no per-item
 * navigation. Items are managed locally so a decided request leaves the list
 * immediately; router.refresh() resyncs the nav badge and dashboard counts.
 */
export function QueueReview({ initialItems }: { initialItems: ReviewItem[] }) {
  const [items, setItems] = useState<ReviewItem[]>(initialItems);
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();

  const openIndex = items.findIndex((r) => r.id === openId);
  const current = openIndex >= 0 ? items[openIndex] : null;

  function handleDecided() {
    const idx = items.findIndex((r) => r.id === openId);
    if (idx === -1) return;
    const next = items.filter((r) => r.id !== openId);
    // Advance to whatever slid into this slot, else the previous item, else done.
    const nextItem = next[idx] ?? next[idx - 1] ?? null;
    setItems(next);
    setOpenId(nextItem ? nextItem.id : null);
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4.5 12.5 9 17l10.5-10.5" />
          </svg>
        }
        title="You're all caught up — nothing to review."
        description="New requests awaiting your decision will appear here, oldest first."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-mist bg-cream">
        <ul className="stagger-rise divide-y divide-mist/70">
          {items.map((r, i) => (
            <li key={r.id} style={{ "--i": i } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => setOpenId(r.id)}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-ink/3 active:bg-ink/5 focus-visible:bg-ink/5 focus-visible:outline-none",
                  r.overLimit && "bg-parchment/60",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{r.title}</p>
                  <p className="truncate text-xs text-storm/60">
                    {r.category} · {r.requesterName} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Money minor={r.amountMinor} currency={r.currency} className="font-medium text-ink" />
                  <StatusBadge status="pending" admin={r.overLimit} />
                  <span aria-hidden className="hidden text-xs font-medium text-blue sm:inline">
                    Review →
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ReviewDrawer
        item={current}
        position={openIndex + 1}
        total={items.length}
        onClose={() => setOpenId(null)}
        onDecided={handleDecided}
      />
    </>
  );
}
