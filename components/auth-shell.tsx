import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { StatusBadge } from "@/components/status-badge";
import { ThemeToggle } from "@/components/theme-toggle";
import type { RequestStatus } from "@/lib/types";

const LEGEND: RequestStatus[] = ["pending", "approved", "rejected", "withdrawn"];

/* The branded entry shell for login / signup / invite. A dark brand panel
   carries the identity; the form sits on paper to the right. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen md:grid-cols-[1.1fr_1fr] lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 text-sidebar-ink md:flex lg:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-[0.18] blur-2xl"
          style={{ background: "radial-gradient(circle, var(--accent-bright), transparent 70%)" }}
        />
        <div className="relative inline-flex items-center gap-2.5">
          <BrandMark className="h-8 w-8" />
          <span className="text-lg font-semibold tracking-tight">Approvals</span>
        </div>

        <div className="relative max-w-md space-y-6">
          <BrandMark className="h-14 w-14" />
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Decisions on money, sealed and accountable.
          </h2>
          <p className="text-sm leading-relaxed text-sidebar-muted">
            Request, review, decide. Every approval is logged to an append-only trail —
            so the team always knows who decided what, and when.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {LEGEND.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </div>
        </div>

        <p className="relative text-xs text-sidebar-muted">
          Authorization lives in the database. The interface only reflects it.
        </p>
      </aside>

      {/* Form panel */}
      <section className="relative flex flex-col bg-bg">
        <div className="absolute right-4 top-4">
          <div className="rounded-md bg-surface-2 p-0.5 text-muted">
            <ThemeToggle className="text-muted hover:bg-surface hover:text-ink" />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-16">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2 md:hidden">
              <BrandMark className="h-9 w-9" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
              {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
            </div>
            {children}
            {footer && <div className="text-sm text-muted">{footer}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}
