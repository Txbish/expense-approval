/**
 * Money is stored as integer minor units (cents) everywhere. These helpers are
 * the ONLY place we convert to/from a human decimal, so rounding lives in one
 * spot and never leaks floats into the database.
 */

export function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amountMinor / 100);
  } catch {
    // unknown currency code — fall back to a plain number
    return `${currency} ${(amountMinor / 100).toFixed(2)}`;
  }
}

/**
 * Like formatMoney but drops the minor units (no cents) — for compact stat
 * tiles where "€1,100" reads cleaner than "€1,100.00".
 */
export function formatMoneyCompact(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amountMinor / 100);
  } catch {
    return `${currency} ${Math.round(amountMinor / 100)}`;
  }
}

/** Parse a user-entered decimal string ("1,250.50") into integer minor units. */
export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}

/** Compact relative time ("3h ago"), no dependency. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.round(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}
