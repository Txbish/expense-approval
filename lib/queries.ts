import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isApprover } from "@/lib/context";
import type { AppContext } from "@/lib/context";
import type { ExpenseRequest } from "@/lib/types";

export type ProfileLite = { full_name: string | null; email: string | null };
export type ProfileMap = Map<string, ProfileLite>;

/** Per-row decision capability for rows THIS user may decide in place. */
export type ReviewDecision = { overLimit: boolean; fallback: boolean };
export type ReviewMap = Record<string, ReviewDecision>;

/**
 * requests.requester_id and decided_by both FK to auth.users (not profiles), so
 * PostgREST can't auto-embed the name. We resolve names in one extra query.
 */
export async function profilesByIds(
  supabase: SupabaseClient,
  ids: (string | null)[],
): Promise<ProfileMap> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  const map: ProfileMap = new Map();
  if (unique.length === 0) return map;
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", unique);
  for (const p of data ?? []) map.set(p.id, { full_name: p.full_name, email: p.email });
  return map;
}

export function nameOf(map: ProfileMap, id: string | null): string {
  if (!id) return "—";
  const p = map.get(id);
  return p?.full_name || p?.email || "Unknown user";
}

/**
 * Builds the set of requests THIS user can decide in place (the inline-review
 * affordance). Only pending, non-own rows in the active org qualify; an
 * above-threshold row needs an admin UNLESS no eligible admin exists (approver
 * fallback). Mirrors the decide_request RPC so the UI never offers an action the
 * DB would reject. Returns only decidable rows — blocked rows are omitted, so
 * they fall back to a normal link to the detail page.
 */
export async function reviewMapFor(
  supabase: SupabaseClient,
  requests: ExpenseRequest[],
  ctx: AppContext,
): Promise<ReviewMap> {
  if (!isApprover(ctx.role)) return {};
  const threshold = ctx.org.approval_threshold_minor;
  const isAdmin = ctx.role === "admin";
  const map: ReviewMap = {};

  await Promise.all(
    requests.map(async (r) => {
      if (r.status !== "pending" || r.requester_id === ctx.userId || r.org_id !== ctx.org.id) return;
      const overLimit = r.amount_minor > threshold;
      if (overLimit && !isAdmin) {
        const { data: exists, error } = await supabase.rpc("request_eligible_admin_exists", {
          p_request: r.id,
        });
        const eligibleAdminExists = error ? true : exists === true;
        if (eligibleAdminExists) return; // an admin must decide — no inline review
        map[r.id] = { overLimit, fallback: true };
      } else {
        map[r.id] = { overLimit, fallback: false };
      }
    }),
  );

  return map;
}
