"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, Money } from "@/components/ui";
import { ReviewDrawer, type ReviewItem } from "@/components/review-drawer";
import { timeAgo } from "@/lib/format";
import type { ProfileLite, ReviewMap } from "@/lib/queries";
import type { ExpenseRequest } from "@/lib/types";

interface Props {
  requests: ExpenseRequest[];
  /** id → { full_name, email } for requester name resolution (server-resolved). */
  profiles: Map<string, ProfileLite>;
  /** Rows this user can decide in place; absent id → normal link to detail. */
  reviewable: ReviewMap;
  showRequester?: boolean;
  threshold?: number;
  emptyLabel?: string;
  from?: string;
  /** The viewer's id — own rows are tagged "(you)" to explain the absent action. */
  currentUserId?: string;
}

// nameOf lives in a server-only module; inline the same fallback here so this
// client component can resolve a display name from the serialized profile map.
function displayName(profiles: Map<string, ProfileLite>, id: string): string {
  const p = profiles.get(id);
  return p?.full_name || p?.email || "Unknown user";
}

/* A filled, unmistakable review action — replaces the old muted "Review →" text. */
function ReviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1 whitespace-nowrap rounded-full bg-ink px-3.5 text-xs font-medium text-cream transition-colors hover:bg-storm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40"
    >
      Review
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M8 5l5 5-5 5" />
      </svg>
    </button>
  );
}

export function ReviewableRequestList({
  requests,
  profiles,
  reviewable,
  showRequester = false,
  threshold,
  emptyLabel = "No requests yet.",
  from,
  currentUserId,
}: Props) {
  const router = useRouter();
  const [decided, setDecided] = useState<Set<string>>(() => new Set());
  const [openId, setOpenId] = useState<string | null>(null);

  const hrefFor = (id: string) => (from ? `/requests/${id}?from=${from}` : `/requests/${id}`);
  const canReview = (id: string) => Boolean(reviewable[id]) && !decided.has(id);
  const hasReviewable = requests.some((r) => canReview(r.id));

  // Ordered ids still awaiting this user's decision — drives the drawer counter
  // and the "advance to next" behaviour after a decision lands.
  const queueIds = useMemo(
    () => requests.filter((r) => reviewable[r.id] && !decided.has(r.id)).map((r) => r.id),
    [requests, reviewable, decided],
  );

  const openRequest = openId ? requests.find((r) => r.id === openId) ?? null : null;
  const openItem: ReviewItem | null =
    openRequest && reviewable[openRequest.id]
      ? {
          id: openRequest.id,
          title: openRequest.title,
          category: openRequest.category,
          amountMinor: openRequest.amount_minor,
          currency: openRequest.currency,
          requesterName: displayName(profiles, openRequest.requester_id),
          createdAt: openRequest.created_at,
          description: openRequest.description ?? null,
          overLimit: reviewable[openRequest.id].overLimit,
          canDecide: true,
          fallback: reviewable[openRequest.id].fallback,
        }
      : null;
  const openPosition = openId ? queueIds.indexOf(openId) + 1 : 0;

  function handleDecided() {
    if (!openId) return;
    const idx = queueIds.indexOf(openId);
    const nextId = idx >= 0 ? queueIds[idx + 1] ?? null : null;
    setDecided((prev) => new Set(prev).add(openId));
    setOpenId(nextId);
    router.refresh(); // resync statuses, nav badge, dashboard counts
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 8h8M8 12h8M8 16h5" />
          </svg>
        }
        title={emptyLabel}
        description="Requests you can see will appear here, newest first."
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-mist bg-cream">
        {/* Mobile / tablet: stacked cards. Left block links to detail; the Review
            pill (when actionable) opens the in-place drawer. */}
        <ul className="stagger-rise divide-y divide-mist/70 lg:hidden">
          {requests.map((r, i) => {
            const adminReq = threshold !== undefined && r.amount_minor > threshold && r.status === "pending";
            const reviewHere = canReview(r.id);
            return (
              <li
                key={r.id}
                style={{ "--i": i } as React.CSSProperties}
                className={clsx("flex items-center justify-between gap-3 px-4 py-3.5", adminReq && "bg-parchment/60")}
              >
                <Link href={hrefFor(r.id)} className="flex min-w-0 flex-1 flex-col gap-1.5 transition-opacity active:opacity-70 focus-visible:outline-none">
                  <p className="truncate font-medium text-ink">{r.title}</p>
                  <p className="truncate text-xs text-storm/60">
                    {r.category}
                    {showRequester && (
                      <>
                        {" · "}
                        {displayName(profiles, r.requester_id)}
                        {r.requester_id === currentUserId && <span className="text-storm/45"> (you)</span>}
                      </>
                    )}
                  </p>
                  <Money minor={r.amount_minor} currency={r.currency} className="font-medium text-ink" />
                </Link>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={r.status} admin={adminReq} />
                  {reviewHere ? (
                    <ReviewButton onClick={() => setOpenId(r.id)} />
                  ) : (
                    <span className="text-xs tabular text-storm/55">{timeAgo(r.updated_at)}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {/* lg+: the ledger table */}
        <div className="hidden min-w-0 overflow-x-auto lg:block">
          <table className="w-full min-w-[36rem] text-sm">
            <thead className="border-b border-mist text-left">
              <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-2xs [&>th]:font-medium [&>th]:uppercase [&>th]:tracking-[0.08em] [&>th]:text-storm/60">
                <th>Request</th>
                {showRequester && <th>Requester</th>}
                <th className="text-right">Amount</th>
                <th className="text-center">Status</th>
                <th className="text-right">Updated</th>
                {hasReviewable && <th className="text-right sr-only">Action</th>}
              </tr>
            </thead>
            <tbody className="stagger-rise divide-y divide-mist/70">
              {requests.map((r, i) => {
                const adminReq = threshold !== undefined && r.amount_minor > threshold && r.status === "pending";
                const reviewHere = canReview(r.id);
                return (
                  <tr
                    key={r.id}
                    style={{ "--i": i } as React.CSSProperties}
                    className={clsx("group transition-colors duration-150 hover:bg-ink/3", adminReq && "bg-parchment/60")}
                  >
                    <td className="px-4 py-3.5">
                      <Link href={hrefFor(r.id)} className="font-medium text-ink transition-colors group-hover:text-blue">
                        {r.title}
                      </Link>
                      <div className="text-xs text-storm/60">{r.category}</div>
                    </td>
                    {showRequester && (
                      <td className="px-4 py-3.5 text-storm/80">
                        {displayName(profiles, r.requester_id)}
                        {r.requester_id === currentUserId && <span className="text-storm/45"> (you)</span>}
                      </td>
                    )}
                    <td className="px-4 py-3.5 text-right">
                      <Money minor={r.amount_minor} currency={r.currency} className="font-medium text-ink" />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <StatusBadge status={r.status} admin={adminReq} />
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs tabular text-storm/60">{timeAgo(r.updated_at)}</td>
                    {hasReviewable && (
                      <td className="px-4 py-3.5 text-right">
                        {reviewHere && <ReviewButton onClick={() => setOpenId(r.id)} />}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ReviewDrawer
        item={openItem}
        position={openPosition}
        total={queueIds.length}
        onClose={() => setOpenId(null)}
        onDecided={handleDecided}
      />
    </>
  );
}
