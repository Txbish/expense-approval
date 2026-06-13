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

/** Parse a user-entered decimal string ("1,250.50") into integer minor units. */
export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.replace(/[,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Math.round(parseFloat(cleaned) * 100);
}
