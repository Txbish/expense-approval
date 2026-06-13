import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Liveness + DB-reachability probe for uptime monitors. Public (no auth). A
 * lightweight query confirms Postgres is reachable; RLS legitimately returns
 * zero rows for an anon caller, so "no error" is the success signal.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = await createClient();
    // Privilege-free reachability check (see migration 0006). Confirms Postgres
    // is up without reading any table data.
    const { error } = await supabase.rpc("health");

    const ok = !error;
    return NextResponse.json(
      {
        status: ok ? "ok" : "degraded",
        db: ok ? "up" : "error",
        latency_ms: Date.now() - startedAt,
        time: new Date().toISOString(),
      },
      { status: ok ? 200 : 503 },
    );
  } catch {
    return NextResponse.json({ status: "down", db: "unreachable" }, { status: 503 });
  }
}
