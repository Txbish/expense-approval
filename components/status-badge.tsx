import { clsx } from "clsx";
import type { ReactNode } from "react";
import type { RequestStatus } from "@/lib/types";

/* Status is encoded three ways at once — color, glyph shape, and the word —
   so it survives colorblindness, grayscale printing, and a fast glance. */

function GlyphPending({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l2.6 1.6" />
    </svg>
  );
}
function GlyphApproved({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4.5 10.5 8.2 14.2 15.5 5.8" />
    </svg>
  );
}
function GlyphRejected({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M5.5 5.5 14.5 14.5M14.5 5.5 5.5 14.5" />
    </svg>
  );
}
function GlyphWithdrawn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 6 7 10l4 4M7 10h7" />
    </svg>
  );
}

const STATUS: Record<
  RequestStatus,
  { pill: string; glyph: (p: { className?: string }) => ReactNode; pulse?: boolean }
> = {
  pending: { pill: "bg-pending-bg text-pending-fg ring-pending-line", glyph: GlyphPending, pulse: true },
  approved: { pill: "bg-approved-bg text-approved-fg ring-approved-line", glyph: GlyphApproved },
  rejected: { pill: "bg-rejected-bg text-rejected-fg ring-rejected-line", glyph: GlyphRejected },
  withdrawn: { pill: "bg-withdrawn-bg text-withdrawn-fg ring-withdrawn-line", glyph: GlyphWithdrawn },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS[status];
  const Glyph = cfg.glyph;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full py-0.5 pl-1.5 pr-2.5 text-xs font-medium capitalize ring-1 ring-inset",
        cfg.pill,
      )}
    >
      <Glyph className={clsx("h-3.5 w-3.5 shrink-0", cfg.pulse && "pulse-dot")} />
      {status}
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
    <span className="inline-flex items-center rounded-full bg-accent-wash px-2.5 py-0.5 text-xs font-medium text-accent-ink ring-1 ring-inset ring-accent-line">
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

/* ── The Decision Seal — signature element ───────────────────────────────
   An embossed, status-colored seal that marks the moment a request is decided.
   Same visual language as the favicon. Used as a moment, never on every row. */

const SEAL: Record<string, { disc: string; glyph: (p: { className?: string }) => ReactNode }> = {
  approved: { disc: "bg-approve-btn", glyph: GlyphApproved },
  rejected: { disc: "bg-reject-btn", glyph: GlyphRejected },
  withdrawn: { disc: "bg-withdrawn-solid", glyph: GlyphWithdrawn },
  pending: { disc: "bg-pending-solid", glyph: GlyphPending },
};

export function Seal({
  status,
  className,
}: {
  status: RequestStatus;
  className?: string;
}) {
  const cfg = SEAL[status] ?? SEAL.pending;
  const Glyph = cfg.glyph;
  return (
    <span
      className={clsx(
        "animate-seal relative grid h-14 w-14 shrink-0 place-items-center rounded-full text-white shadow-md ring-1 ring-inset ring-white/25",
        cfg.disc,
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-[15%] rounded-full border-[1.5px] border-dashed border-white/55" />
      <Glyph className="relative h-6 w-6" />
    </span>
  );
}
