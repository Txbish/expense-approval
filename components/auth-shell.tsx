import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";

/* aop-style split entry shell: an ink brand panel with an orange decorative
   wash and a big lowercase headline, beside a cream form panel. */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-cream md:flex lg:p-14">
        {/* orange decorative block — never text, decoration only */}
        <div
          aria-hidden
          className="absolute right-20 top-0 h-64 w-72 rounded-b-[2.5rem] bg-orange"
        />
        {/* faint outline circles, lower right */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 right-24 h-72 w-72 rounded-full border border-cream/10"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-6 right-10 h-40 w-40 rounded-full border border-cream/10"
        />

        <div className="relative inline-flex items-center gap-2.5 text-cream">
          <BrandMark className="h-7 w-7" />
          <span className="text-xl font-medium lowercase tracking-tight">
            approvals.
          </span>
        </div>

        <div className="relative max-w-lg space-y-6">
          <p className="text-2xs font-medium uppercase tracking-[0.18em] text-cream/55">
            Expense approvals · v1
          </p>
          <h2 className="text-heading-sm text-cream lg:text-heading">
            request, review, and approve.{" "}
            <span className="text-orange">without the back-and-forth.</span>
          </h2>
          <p className="max-w-md text-body-sm text-cream/65">
            One workspace for the whole money trail. Submit, decide, and keep an
            append-only record of who approved what — and when.
          </p>
        </div>

        <p className="relative text-2xs uppercase tracking-[0.16em] text-cream/45">
          © 2026 · expense approvals platform
        </p>
      </aside>

      {/* Form panel */}
      <section className="flex flex-col bg-cream">
        <div className="flex flex-1 items-center justify-center px-5 py-16">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-5">
              {/* Mobile only: a larger, centered brand emblem anchors the screen
                  (the desktop brand panel carries the mark on ≥ md). */}
              <div className="flex justify-center md:hidden">
                <span className="grid h-16 w-16 place-items-center rounded-2xl bg-cream text-ink">
                  <BrandMark className="h-20 w-20" />
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-2xs font-medium uppercase tracking-[0.18em] text-storm/55">
                  {eyebrow}
                </p>
                <h1 className="text-heading-sm lowercase text-ink">{title}</h1>
                {subtitle && (
                  <p className="text-caption text-storm/75">{subtitle}</p>
                )}
              </div>
            </div>
            {children}
            {footer && (
              <div className="text-caption text-storm/75">{footer}</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
