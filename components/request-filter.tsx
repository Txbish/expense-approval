"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

export interface FilterOption {
  value: string;
  label: string;
}

function hrefFor(value: string): string {
  return value === "all" ? "/requests/all" : `/requests/all?status=${value}`;
}

/**
 * Status filter for All requests. A wrapping pill row at sm+, but on phones it
 * collapses to a single "Filter" button (showing the current selection) that
 * opens a bottom sheet of radio options — so five filters never wrap into a
 * ragged second row on a narrow screen.
 */
export function RequestFilter({ filters, active }: { filters: FilterOption[]; active: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const activeLabel = filters.find((f) => f.value === active)?.label ?? filters[0]?.label ?? "All";

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (value: string) => {
    setOpen(false);
    if (value !== active) router.push(hrefFor(value));
  };

  return (
    <>
      {/* sm+: inline pill row */}
      <div className="hidden flex-wrap gap-2 sm:flex">
        {filters.map((f) => {
          const isActive = f.value === active;
          return (
            <Link
              key={f.value}
              href={hrefFor(f.value)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-ink bg-ink text-cream"
                  : "border-mist bg-cream text-storm/80 hover:border-storm/30 hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* < sm: a filter button that opens a bottom sheet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-11 w-full items-center justify-between rounded-full border border-mist bg-cream px-4 text-sm font-medium text-ink transition-colors hover:border-storm/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/30 sm:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-storm/60" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3.5 5h13M6 10h8M8.5 15h3" />
          </svg>
          Filter
        </span>
        <span className="inline-flex items-center gap-1.5 text-storm/70">
          {activeLabel}
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M6 8l4 4 4-4" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-x-0 top-0 z-[60] flex h-[100dvh] flex-col justify-end sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filter by status"
        >
          <div onClick={() => setOpen(false)} className="absolute inset-0 animate-fade-in bg-ink/60" aria-hidden />
          <div className="animate-slide-up relative rounded-t-2xl border-t border-mist bg-cream px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-mist" aria-hidden />
            <p className="mb-2 px-1 text-2xs font-medium uppercase tracking-[0.16em] text-storm/55">Filter by status</p>
            <div role="radiogroup" aria-label="Filter by status" className="flex flex-col">
              {filters.map((f) => {
                const isActive = f.value === active;
                return (
                  <button
                    key={f.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => pick(f.value)}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-field font-medium text-ink transition-colors hover:bg-ink/6 focus-visible:bg-ink/6 focus-visible:outline-none"
                  >
                    {f.label}
                    <span
                      className={clsx(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        isActive ? "border-blue" : "border-mist",
                      )}
                    >
                      {isActive && <span className="h-2.5 w-2.5 rounded-full bg-blue" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
