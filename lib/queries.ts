import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfileLite = { full_name: string | null; email: string | null };
export type ProfileMap = Map<string, ProfileLite>;

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
