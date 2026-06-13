// Seeds deterministic demo data via the service-role key.
// Run: node --env-file=.env.local scripts/seed.mjs
//   (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
//
// Builds THREE orgs that together exercise every user flow in the app:
//
//   • Acme Inc (USD, $1,000 threshold) — the busy multi-user org. Has all four
//     request states, an over-threshold request that needs an admin, AND the
//     sole-admin's own over-threshold request that the approver-fallback rule
//     lets an approver decide. Bob (an approver) also files his own request, so
//     "you can't approve your own" is visible.
//   • Globex (EUR, €500 threshold) — a second tenant. Alice is also an APPROVER
//     here, so she is a multi-org user: the org switcher appears, and Globex
//     activity reaches her as cross-org notifications.
//   • Initech (USD, $1,000 threshold) — a single-admin org whose admin filed an
//     over-threshold request; its lone approver can decide it via the fallback.
//
// Run against a FRESH database: `npm run db:seed` (= supabase db reset + this).
// (A plain re-run can't fully wipe — the last-admin guard blocks deleting an
// org's sole admin via cascade — so reset first.) Auth users are reused.
// Decisions/withdrawals are written directly (the app normally routes them
// through SECURITY DEFINER RPCs) — fine for seed data.

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });
const PASSWORD = "Password123!";
const DAY = 24 * 60 * 60 * 1000;

async function ensureUser(email, fullName) {
  const created = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.data?.user) return created.data.user.id;
  // already exists -> find it (paginate through the directory)
  for (let page = 1; page <= 10; page++) {
    const { data } = await db.auth.admin.listUsers({ page, perPage: 200 });
    const found = data.users.find((u) => u.email === email);
    if (found) return found.id;
    if (data.users.length < 200) break;
  }
  throw new Error(`could not create or find user ${email}`);
}

async function wipeOrg(name) {
  const { data } = await db.from("organizations").select("id").eq("name", name);
  for (const o of data ?? []) await db.from("organizations").delete().eq("id", o.id); // cascades
}

async function createOrg(name, currency, thresholdMinor, createdBy) {
  const { data, error } = await db
    .from("organizations")
    .insert({ name, default_currency: currency, approval_threshold_minor: thresholdMinor, created_by: createdBy })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function addMembers(orgId, rows) {
  const { error } = await db
    .from("memberships")
    .insert(rows.map((r) => ({ org_id: orgId, user_id: r.user, role: r.role })));
  if (error) throw error;
}

async function addRequest(orgId, requesterId, title, category, amountMinor, description = null) {
  // before-insert trigger pins status='pending' and sets currency to the org's;
  // after-insert trigger notifies the org's approvers.
  const { data, error } = await db
    .from("requests")
    .insert({ org_id: orgId, requester_id: requesterId, title, category, amount_minor: amountMinor, currency: "XXX", description })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}

async function decide(requestId, orgId, requesterId, deciderId, decision, note) {
  await db
    .from("requests")
    .update({ status: decision, decided_by: deciderId, decided_at: new Date().toISOString(), decision_note: note })
    .eq("id", requestId);
  await db.from("request_events").insert({
    org_id: orgId, request_id: requestId, actor_id: deciderId, type: decision,
    from_status: "pending", to_status: decision, note,
  });
  await db.from("notifications").insert({
    user_id: requesterId, org_id: orgId, request_id: requestId, type: decision,
    body: `Your request was ${decision}`,
  });
}

async function withdraw(requestId, orgId, requesterId) {
  await db.from("requests").update({ status: "withdrawn" }).eq("id", requestId);
  await db.from("request_events").insert({
    org_id: orgId, request_id: requestId, actor_id: requesterId, type: "withdrawn",
    from_status: "pending", to_status: "withdrawn", note: null,
  });
}

async function addInvite(orgId, email, role, invitedBy) {
  const { error } = await db.from("invitations").insert({
    org_id: orgId, email, role, token: randomUUID(), invited_by: invitedBy,
    expires_at: new Date(Date.now() + 7 * DAY).toISOString(),
  });
  if (error) throw error;
}

async function main() {
  console.log("Seeding…");

  // --- users -------------------------------------------------------------
  const alice = await ensureUser("admin@acme.test", "Alice Admin");
  const bob = await ensureUser("approver@acme.test", "Bob Approver");
  const carol = await ensureUser("requester@acme.test", "Carol Requester");
  const dan = await ensureUser("requester2@acme.test", "Dan Requester");
  const erin = await ensureUser("admin@globex.test", "Erin Admin");
  const frank = await ensureUser("requester@globex.test", "Frank Requester");
  const gary = await ensureUser("admin@initech.test", "Gary Admin");
  const helen = await ensureUser("approver@initech.test", "Helen Approver");

  // --- fresh orgs --------------------------------------------------------
  await wipeOrg("Acme Inc");
  await wipeOrg("Globex");
  await wipeOrg("Initech");

  const acme = await createOrg("Acme Inc", "USD", 100000, alice); // $1,000
  const globex = await createOrg("Globex", "EUR", 50000, erin); //  €500
  const initech = await createOrg("Initech", "USD", 100000, gary); // $1,000

  // --- memberships -------------------------------------------------------
  // Alice is admin in Acme AND approver in Globex → a multi-org user.
  await addMembers(acme.id, [
    { user: alice, role: "admin" },
    { user: bob, role: "approver" },
    { user: carol, role: "requester" },
    { user: dan, role: "requester" },
  ]);
  await addMembers(globex.id, [
    { user: erin, role: "admin" },
    { user: frank, role: "requester" },
    { user: alice, role: "approver" },
  ]);
  await addMembers(initech.id, [
    { user: gary, role: "admin" },
    { user: helen, role: "approver" },
  ]);

  // --- Acme requests: every state + both over-threshold paths ------------
  // pending, under threshold
  await addRequest(acme.id, carol, "Figma subscription", "Software", 14400, "Annual design tooling.");
  // pending, OVER threshold, requester is not admin → an admin (Alice) must decide
  await addRequest(acme.id, carol, "New developer laptop", "Equipment", 120000, "Current one is dying.");
  await addRequest(acme.id, dan, "Monitor arm", "Equipment", 150000, "Ergonomics — desk assessment flagged it.");
  // approved
  const lunch = await addRequest(acme.id, dan, "Team lunch", "Meals & Entertainment", 18000, "Sprint celebration.");
  await decide(lunch, acme.id, dan, bob, "approved", "Approved — within budget.");
  // rejected
  const conf = await addRequest(acme.id, dan, "Conference ticket", "Training", 45000, "Frontend conf.");
  await decide(conf, acme.id, dan, bob, "rejected", "Let's revisit next quarter.");
  // withdrawn
  const desk = await addRequest(acme.id, carol, "Standing desk", "Equipment", 65000, "Changed my mind.");
  await withdraw(desk, acme.id, carol);
  // approver files his own → he cannot approve it himself; an admin can
  await addRequest(acme.id, bob, "Mechanical keyboard", "Equipment", 22000, "Daily driver replacement.");
  // the SOLE admin's own over-threshold request → no other admin → approver
  // fallback lets Bob decide it. (The deadlock case, in the main org.)
  await addRequest(acme.id, alice, "Annual offsite", "Travel", 500000, "Whole-team offsite, Q3.");

  // --- Globex requests: second tenant, EUR, cross-org notifications -------
  await addRequest(globex.id, frank, "External monitor", "Equipment", 30000, "Dual-screen setup.");
  // over €500 → needs an admin (Erin). Alice is only an approver here.
  await addRequest(globex.id, frank, "Conference travel", "Travel", 80000, "Flights + hotel for KubeCon.");

  // --- Initech: single-admin org, admin's over-threshold awaits fallback --
  await addRequest(initech.id, gary, "Company retreat", "Travel", 800000, "Offsite venue deposit.");

  // --- pending invitations (Members screen) ------------------------------
  await addInvite(acme.id, "newhire@acme.test", "requester", alice);
  await addInvite(acme.id, "auditor@acme.test", "approver", alice);

  // --- mark one notification read so an unread/read mix is visible --------
  const { data: someNotif } = await db
    .from("notifications").select("id").order("created_at", { ascending: true }).limit(1);
  if (someNotif?.[0]) await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", someNotif[0].id);

  console.log("\n✅ Seed complete.\n");
  console.log(`Test accounts (password for all: ${PASSWORD})`);
  console.table([
    { org: "Acme Inc (USD)", email: "admin@acme.test", role: "admin", note: "also approver in Globex (multi-org)" },
    { org: "Acme Inc (USD)", email: "approver@acme.test", role: "approver", note: "files own request; fallback on Alice's offsite" },
    { org: "Acme Inc (USD)", email: "requester@acme.test", role: "requester", note: "pending / over-limit / withdrawn" },
    { org: "Acme Inc (USD)", email: "requester2@acme.test", role: "requester", note: "approved + rejected + over-limit" },
    { org: "Globex (EUR)", email: "admin@globex.test", role: "admin", note: "" },
    { org: "Globex (EUR)", email: "requester@globex.test", role: "requester", note: "under + over-limit (EUR)" },
    { org: "Initech (USD)", email: "admin@initech.test", role: "admin", note: "sole admin; over-limit deadlock" },
    { org: "Initech (USD)", email: "approver@initech.test", role: "approver", note: "can decide Gary's via fallback" },
  ]);
  console.log("\nFlows to try:");
  console.log("  • Multi-org + cross-org: admin@acme.test → switch Acme/Globex; open a Globex notification while in Acme → cross-org banner.");
  console.log("  • Approver fallback: approver@acme.test → open Alice's 'Annual offsite' ($5,000) — you can decide it (no other admin).");
  console.log("  • Strict over-limit: approver@acme.test → 'New developer laptop' ($1,200) — an admin must decide.");
  console.log("  • No self-approval: approver@acme.test → your 'Mechanical keyboard' isn't in your own queue.");
  console.log("  • Pending invites: admin@acme.test → Members shows newhire@ and auditor@.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
