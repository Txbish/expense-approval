// Seeds deterministic demo data via the service-role key.
// Run: node scripts/seed.mjs   (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
//
// Creates two orgs (Acme in USD, Globex in EUR) so cross-tenant isolation is
// demonstrable, the standard roles in each, and requests in mixed states.
// Idempotent: re-running wipes the seed orgs (cascade) and rebuilds them; the
// auth users are reused.

import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(URL, KEY, { auth: { persistSession: false } });
const PASSWORD = "Password123!";

async function ensureUser(email, fullName) {
  const created = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });
  if (created.data?.user) return created.data.user.id;

  // already exists -> find it
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = data.users.find((u) => u.email === email);
  if (!found) throw new Error(`could not create or find user ${email}`);
  return found.id;
}

async function wipeOrg(name) {
  const { data } = await db.from("organizations").select("id").eq("name", name);
  for (const o of data ?? []) {
    await db.from("organizations").delete().eq("id", o.id); // cascades
  }
}

async function decide(requestId, orgId, requesterId, deciderId, decision, note) {
  await db
    .from("requests")
    .update({
      status: decision,
      decided_by: deciderId,
      decided_at: new Date().toISOString(),
      decision_note: note,
    })
    .eq("id", requestId);
  await db.from("request_events").insert({
    org_id: orgId,
    request_id: requestId,
    actor_id: deciderId,
    type: decision,
    from_status: "pending",
    to_status: decision,
    note,
  });
  await db.from("notifications").insert({
    user_id: requesterId,
    org_id: orgId,
    request_id: requestId,
    type: decision,
    body: `Your request was ${decision}`,
  });
}

async function addRequest(orgId, requesterId, title, category, amountMinor) {
  const { data, error } = await db
    .from("requests")
    .insert({
      org_id: orgId,
      requester_id: requesterId,
      title,
      category,
      amount_minor: amountMinor,
      currency: "XXX", // overridden by before-insert trigger to the org currency
    })
    .select()
    .single();
  if (error) throw error;
  return data.id;
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

  // --- fresh orgs --------------------------------------------------------
  await wipeOrg("Acme Inc");
  await wipeOrg("Globex");

  const { data: acme, error: acmeErr } = await db
    .from("organizations")
    .insert({
      name: "Acme Inc",
      default_currency: "USD",
      approval_threshold_minor: 100000, // $1,000.00 — above this needs an admin
      created_by: alice,
    })
    .select()
    .single();
  if (acmeErr) throw acmeErr;

  const { data: globex, error: globexErr } = await db
    .from("organizations")
    .insert({
      name: "Globex",
      default_currency: "EUR",
      approval_threshold_minor: 50000, // €500.00
      created_by: erin,
    })
    .select()
    .single();
  if (globexErr) throw globexErr;

  // --- memberships -------------------------------------------------------
  await db.from("memberships").insert([
    { org_id: acme.id, user_id: alice, role: "admin" },
    { org_id: acme.id, user_id: bob, role: "approver" },
    { org_id: acme.id, user_id: carol, role: "requester" },
    { org_id: acme.id, user_id: dan, role: "requester" },
    { org_id: globex.id, user_id: erin, role: "admin" },
    { org_id: globex.id, user_id: frank, role: "requester" },
  ]);

  // --- requests ----------------------------------------------------------
  await addRequest(acme.id, carol, "New developer laptop", "Equipment", 120000); // > threshold -> needs admin
  await addRequest(acme.id, carol, "Conference ticket", "Training", 45000);
  await addRequest(acme.id, carol, "Figma subscription", "Software", 14400);

  const lunch = await addRequest(acme.id, dan, "Team lunch", "Meals & Entertainment", 18000);
  const desk = await addRequest(acme.id, dan, "Standing desk", "Equipment", 65000);
  await decide(lunch, acme.id, dan, bob, "approved", "Approved — within budget.");
  await decide(desk, acme.id, dan, bob, "rejected", "Please use a shared desk for now.");

  await addRequest(globex.id, frank, "External monitor", "Equipment", 30000);

  console.log("\n✅ Seed complete.\n");
  console.log("Test accounts (password for all: " + PASSWORD + ")");
  console.table([
    { org: "Acme Inc (USD)", email: "admin@acme.test", role: "admin (senior approver)" },
    { org: "Acme Inc (USD)", email: "approver@acme.test", role: "approver" },
    { org: "Acme Inc (USD)", email: "requester@acme.test", role: "requester" },
    { org: "Acme Inc (USD)", email: "requester2@acme.test", role: "requester" },
    { org: "Globex (EUR)", email: "admin@globex.test", role: "admin" },
    { org: "Globex (EUR)", email: "requester@globex.test", role: "requester" },
  ]);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
