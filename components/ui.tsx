import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { formatMoney } from "@/lib/format";

/* ── Buttons (aop pill system) ───────────────────────────────────────────── */

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "approve"
  | "wash"
  | "link";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-full h-11 px-6 text-field font-medium whitespace-nowrap select-none transition-colors duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue/40 disabled:pointer-events-none disabled:opacity-45";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-storm",
  secondary: "bg-parchment text-ink border border-mist/60 hover:bg-mist/40",
  outline: "border border-blue text-blue hover:bg-blue/8",
  ghost: "text-ink hover:bg-ink/6",
  danger: "bg-destructive text-cream hover:bg-destructive/90",
  approve: "bg-success text-cream hover:bg-success/90",
  wash: "bg-orange text-ink hover:bg-orange/90",
  link: "h-auto px-0 text-blue hover:underline underline-offset-4",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return (
    <button className={clsx(buttonBase, buttonVariants[variant], className)} {...props} />
  );
}

export function LinkButton({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={clsx(buttonBase, buttonVariants[variant], className)}>
      {children}
    </Link>
  );
}

/* ── Surfaces ──────────────────────────────────────────────────────────── */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx("rounded-2xl bg-card", className)}>{children}</div>;
}

/* ── Eyebrow — the uppercase tracked kicker used across the app ──────────── */

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={clsx("text-2xs font-medium uppercase tracking-[0.16em] text-storm/60", className)}>
      {children}
    </p>
  );
}

/* ── Page header — eyebrow · heading · description · action ──────────────── */

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 space-y-2">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="text-heading-sm text-ink">{title}</h1>
        {description && <p className="max-w-2xl text-body-sm text-storm/80">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

/* ── Form controls ─────────────────────────────────────────────────────── */

const controlBase =
  "w-full rounded-lg border border-mist bg-cream text-field text-ink transition-colors duration-200 hover:border-storm/30 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/30 disabled:cursor-not-allowed disabled:opacity-60";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="block text-2xs font-medium uppercase tracking-[0.12em] text-storm/80">
        {label}
      </span>
      {children}
      {hint && <span className="block text-caption text-storm/70">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={clsx(controlBase, "h-11 px-4", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea className={clsx(controlBase, "min-h-24 resize-y px-4 py-3 leading-relaxed", className)} {...props} />
  );
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className={clsx("relative", className)}>
      <select className={clsx(controlBase, "h-11 appearance-none px-4 pr-9")} {...props}>
        {children}
      </select>
      <svg
        viewBox="0 0 20 20"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-storm/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        aria-hidden
      >
        <path d="M6 8l4 4 4-4" />
      </svg>
    </div>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/8 px-3 py-2.5 text-field text-destructive"
    >
      <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM10 5a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm0 9.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2Z"
          clipRule="evenodd"
        />
      </svg>
      <span>{message}</span>
    </p>
  );
}

/* ── Money — Aeonik tabular figures, aligned and currency-aware ──────────── */

export function Money({
  minor,
  currency,
  className,
}: {
  minor: number;
  currency: string;
  className?: string;
}) {
  return (
    <span className={clsx("tabular tracking-tight", className)}>{formatMoney(minor, currency)}</span>
  );
}

/* ── Empty state — teaches the interface ─────────────────────────────────── */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-mist bg-cream px-6 py-16 text-center">
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-parchment text-ink">
          {icon}
        </div>
      )}
      <p className="text-subheading text-ink">{title}</p>
      {description && <p className="mt-2 max-w-sm text-caption text-storm/70">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ── Spinner ───────────────────────────────────────────────────────────── */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx("h-4 w-4 animate-spin", className)} fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
