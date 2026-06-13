import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { RequestStatus } from "@/lib/types";

/* Status is encoded three ways at once — color, glyph shape, and the word.
   Orange (warning) never appears as text, per the palette ban, so pending
   uses ink text with an orange border + clock glyph. */

function GlyphPending({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.6 1.6" />
    </svg>
  );
}
function GlyphApproved({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M4.5 10.5 8.2 14.2 15.5 5.8" />
    </svg>
  );
}
function GlyphRejected({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
      <path d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5" />
    </svg>
  );
}
function GlyphWithdrawn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M11 6 7 10l4 4M7 10h7" />
    </svg>
  );
}
/* Shield-check — an over-threshold pending request that only an admin can decide.
   It folds into the single pill ("Admin pending") rather than a second tag. */
function GlyphShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 17.5s5.5-2.75 5.5-7V4.2L10 2.3 4.5 4.2v6.3c0 4.25 5.5 7 5.5 7Z" />
      <path d="m7.5 9.7 1.7 1.7 3.3-3.4" />
    </svg>
  );
}
const STATUS: Record<RequestStatus, { pill: string; glyph: (p: { className?: string }) => ReactNode }> = {
  pending: { pill: "bg-cream/80 border-orange/60 text-ink", glyph: GlyphPending },
  approved: { pill: "bg-cream/80 border-success/35 text-success", glyph: GlyphApproved },
  rejected: { pill: "bg-cream/80 border-destructive/40 text-destructive", glyph: GlyphRejected },
  withdrawn: { pill: "bg-parchment border-mist/60 text-storm", glyph: GlyphWithdrawn },
};

export function StatusBadge({ status, admin = false }: { status: RequestStatus; admin?: boolean }) {
  const cfg = STATUS[status];
  // Admin approval only qualifies a pending request; ignore the flag otherwise.
  const adminPending = admin && status === "pending";
  const Glyph = adminPending ? GlyphShield : cfg.glyph;
  return (
    <span
      title={adminPending ? "Above threshold — an admin must decide" : undefined}
      className={clsx(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium capitalize",
        cfg.pill,
      )}
    >
      <Glyph className="h-3.5 w-3.5 shrink-0" />
      {adminPending ? "Admin pending" : status}
    </span>
  );
}

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  approver: "Approver",
  requester: "Requester",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-mist/70 bg-cream/80 px-2.5 py-1 text-xs font-medium text-storm">
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

/* ── The Decision Seal — flat, status-colored, no elevation (aop bans shadows) */

const SEAL: Record<string, { disc: string; glyph: (p: { className?: string }) => ReactNode }> = {
  approved: { disc: "bg-success", glyph: GlyphApproved },
  rejected: { disc: "bg-destructive", glyph: GlyphRejected },
  withdrawn: { disc: "bg-storm", glyph: GlyphWithdrawn },
  pending: { disc: "bg-ink", glyph: GlyphPending },
};

export function Seal({ status, className }: { status: RequestStatus; className?: string }) {
  const cfg = SEAL[status] ?? SEAL.pending;
  const Glyph = cfg.glyph;
  return (
    <span
      className={clsx(
        "animate-scale-in relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-cream",
        cfg.disc,
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-[16%] rounded-full border border-cream/30" />
      <Glyph className="relative h-6 w-6" />
    </span>
  );
}
