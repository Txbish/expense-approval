import { clsx } from "clsx";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { formatMoney } from "@/lib/format";

/* ── Buttons ───────────────────────────────────────────────────────────── */

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "approve";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 h-9 text-sm font-medium whitespace-nowrap select-none transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast shadow-sm hover:bg-accent-hover",
  secondary:
    "border border-line bg-surface text-ink-soft shadow-sm hover:bg-surface-2 hover:text-ink hover:border-line-strong",
  danger: "bg-reject-btn text-white shadow-sm hover:bg-reject-btn-hover",
  approve: "bg-approve-btn text-white shadow-sm hover:bg-approve-btn-hover",
  ghost: "text-muted hover:bg-surface-2 hover:text-ink",
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
  return (
    <div className={clsx("rounded-xl border border-line bg-surface shadow-sm", className)}>
      {children}
    </div>
  );
}

/* ── Page header — the consistent title · description · action band ──────── */

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Form controls ─────────────────────────────────────────────────────── */

const controlBase =
  "w-full rounded-md border border-line bg-surface text-sm text-ink transition-colors duration-150 placeholder:text-faint hover:border-line-strong focus:border-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-60";

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
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={clsx(controlBase, "h-9 px-3", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={clsx(controlBase, "px-3 py-2 leading-relaxed", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={clsx(controlBase, "h-9 px-3 pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-md border border-rejected-line bg-rejected-bg px-3 py-2 text-sm text-rejected-fg"
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

/* ── Money — the ledger figure: tabular mono, aligned, currency-aware ────── */

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
    <span className={clsx("font-mono tabular tracking-tight", className)}>
      {formatMoney(minor, currency)}
    </span>
  );
}

/* ── Empty state — teaches the interface, never just "nothing here" ──────── */

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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-accent-wash text-accent-ink">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
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
