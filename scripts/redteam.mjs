// Red-team / RLS verification. Signs in as real seeded users using the PUBLIC
// anon key (exactly what a browser or a curl attacker has) and tries to break
// the authorization model. Every check must hold at the DATABASE layer — the UI
// is never involved here.
//
// Run: node --env-file=.env.local scripts/redteam.mjs
// (Run `node --env-file=.env.local scripts/seed.mjs` first for fresh data.)

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASSWORD = "Password123!";

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

let pass = 0;
let fail = 0;
function check(name, ok, detail = "") {
  const tag = ok ? "\x1b[32mPASS\x1b[0m" : "\x1b[31mFAIL\x1b[0m";
  console.log(`  ${tag}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (ok) pass++;
  else fail++;
}

async function signIn(email) {
  const c = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign in failed for ${email}: ${error.message}`);
  return c;
}

async function idByTitle(title) {
  const { data } = await admin.from("requests").select("id, requester_id, org_id").eq("title", title).single();
  return data;
}

async function main() {
  console.log("\n🔴 RED-TEAM: attacking the app with the public anon key\n");

  const carol = await signIn("requester@acme.test"); // Acme requester
  const bob = await signIn("approver@acme.test"); // Acme approver
  const alice = await signIn("admin@acme.test"); // Acme admin (senior approver)
  const anon = createClient(URL, ANON, { auth: { persistSession: false } }); // logged-out

  const laptop = await idByTitle("New developer laptop"); // Carol, $1,200 > $1,000 threshold
  const figma = await idByTitle("Figma subscription"); // Carol, pending, under threshold
  const monitor = await idByTitle("External monitor"); // Globex (different tenant)

  // 1) Tenant isolation — Acme requester cannot see any Globex data
  {
    const { data } = await carol.from("requests").select("id, org_id");
    const leaked = (data ?? []).some((r) => r.org_id === monitor.org_id);
    check("tenant isolation: Acme user sees zero Globex requests", !leaked, `${data?.length ?? 0} rows, all Acme`);
  }

  // 2) Row ownership — a requester sees ONLY their own requests
  {
    const { data } = await carol.from("requests").select("id, requester_id");
    const onlyOwn = (data ?? []).every((r) => r.requester_id === laptop.requester_id);
    check("row ownership: requester sees only own requests", onlyOwn);
  }

  // 3) No client status writes — requester cannot UPDATE status directly
  {
    const { data, error } = await carol
      .from("requests")
      .update({ status: "approved" })
      .eq("id", figma.id)
      .select();
    const blocked = !!error || (data?.length ?? 0) === 0;
    check("no client writes: direct UPDATE status is blocked", blocked, error ? error.code : "0 rows affected");
  }

  // 4) Segregation of duties — requester cannot approve their own request
  {
    const { error } = await carol.rpc("decide_request", { p_request: figma.id, p_decision: "approved" });
    check("segregation of duties: self-approval rejected", !!error, error?.message);
  }

  // 5) Approval limit — approver cannot approve OVER the org threshold
  {
    const { error } = await bob.rpc("decide_request", { p_request: laptop.id, p_decision: "approved" });
    check("approval limit: over-threshold blocked for approver", !!error, error?.message);
  }

  // 6) Approval limit — admin (senior approver) CAN approve over threshold
  {
    const { data, error } = await alice.rpc("decide_request", {
      p_request: laptop.id,
      p_decision: "approved",
      p_note: "Approved by admin (over limit).",
    });
    check("approval limit: admin can approve over-threshold", !error && data?.status === "approved", error?.message);
  }

  // 7) Concurrency — two approvers decide the same request at once; exactly one wins
  {
    const { data: fresh } = await carol
      .from("requests")
      .insert({ org_id: laptop.org_id, requester_id: laptop.requester_id, title: "Concurrency probe", category: "Other", amount_minor: 5000, currency: "XXX" })
      .select()
      .single();
    const [a, b] = await Promise.all([
      bob.rpc("decide_request", { p_request: fresh.id, p_decision: "approved" }),
      alice.rpc("decide_request", { p_request: fresh.id, p_decision: "rejected" }),
    ]);
    const wins = [a, b].filter((r) => !r.error).length;
    const losers = [a, b].filter((r) => r.error).length;
    check("concurrency: exactly one decision wins", wins === 1 && losers === 1, `${wins} win / ${losers} blocked`);
  }

  // 8) Unauthenticated — logged-out client sees nothing
  {
    const { data } = await anon.from("requests").select("id");
    check("unauthenticated: anon client reads zero rows", (data?.length ?? 0) === 0);
  }

  // 9) Cross-tenant decision via RPC — Acme approver cannot decide a Globex request
  {
    const { error } = await bob.rpc("decide_request", { p_request: monitor.id, p_decision: "approved" });
    check("cross-tenant: approver cannot decide another org's request", !!error, error?.message);
  }

  console.log(`\n${fail === 0 ? "\x1b[32m" : "\x1b[31m"}${pass} passed, ${fail} failed\x1b[0m\n`);
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
