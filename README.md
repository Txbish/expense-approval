# Approvals — a multi-tenant expense-approval app

A small, deployed web app for one **request → review → decision** flow: company
expense/budget approvals, with two roles — the person making requests and the
person approving them.

**Live URL:** _<add after deploy>_ · **Test accounts:** see [below](#test-accounts)

Stack: **Next.js 16 (App Router) · Supabase (Postgres + Auth + RLS) · Vercel · Playwright**

---

## The one idea this is built around

With Supabase, the **anon API key ships to the browser** — it's public. So the only
thing standing between an attacker with `curl` and your data is **Row-Level Security**.
This app puts *all* authorization in the database, and proves it holds:

- **RLS on every table**, default-deny, with **separate policies per operation**
  (SELECT / INSERT / UPDATE / DELETE) — the exact gotcha most prototypes miss.
- **No client writes to a request's status.** The `authenticated` role isn't even
  *granted* `UPDATE` on `requests`. Every transition goes through one audited
  `decide_request` Postgres function (`SECURITY DEFINER`) that enforces the rules.
- **Multi-tenant isolation** by `org_id`, enforced in RLS — not by a third-party.

> A consequence worth calling out: during development an E2E test caught the UI
> mis-resolving a requester as an admin. It was **not** a security hole — the RLS
> uses `auth.uid()`, so the database would still have blocked every admin action;
> only the buttons were wrong. That's the whole point of authorizing at the data
> layer instead of the UI. (Fixed, of course.)

## Core controls (what a real expense system needs)

| Control | How |
|---|---|
| Tenant isolation | RLS scopes every row by `org_id` via the `memberships` table |
| Role permissions | `requester` / `approver` / `admin`, enforced in RLS + the decision RPC |
| Segregation of duties | You **cannot approve your own request** (`actor ≠ requester`) |
| Approval limits | Amount over the org threshold requires an **admin** (senior approver) |
| Concurrency | Decision RPC locks the row + guards `status='pending'` — one winner |
| Audit trail | Append-only `request_events` (no UPDATE/DELETE policy for anyone) |
| Money correctness | Stored as integer **minor units** (cents); never floats |
| Sessions | `@supabase/ssr` **httpOnly cookies** — no JWT in localStorage |

## Proof it holds — the red-team script

`scripts/redteam.mjs` signs in as real users with the **public anon key** (exactly
what a browser/attacker has) and tries to break the model. Run `npm run redteam`:

```
🔴 RED-TEAM: attacking the app with the public anon key
  PASS  tenant isolation: Acme user sees zero Globex requests
  PASS  row ownership: requester sees only own requests
  PASS  no client writes: direct UPDATE status is blocked  — 42501
  PASS  segregation of duties: self-approval rejected
  PASS  approval limit: over-threshold blocked for approver
  PASS  approval limit: admin can approve over-threshold
  PASS  concurrency: exactly one decision wins  — 1 win / 1 blocked
  PASS  unauthenticated: anon client reads zero rows
  PASS  cross-tenant: approver cannot decide another org's request
  9 passed, 0 failed
```

## Roles & flow

- **Requester** — submit an expense request, track it, withdraw while pending.
- **Approver** — review the queue, approve/reject with a note (within their limit).
- **Admin** — approver + invite members, set roles, set currency & approval threshold.

Lifecycle: `pending → approved | rejected` (or `withdrawn` by the requester). Status
is visible and live to both sides; every change is notified in-app and audited.

## Local development

Prereqs: Node 20+, Docker (for local Supabase), and the Supabase CLI (`npx supabase`).

```bash
npm install
npx supabase start                 # boots local Postgres/Auth/etc.
cp .env.example .env.local         # then paste keys from `npx supabase status`
npm run db:reset                   # applies all migrations
npm run seed                       # creates test accounts + demo data
npm run dev                        # http://localhost:3000

npm run redteam                    # prove RLS holds (9/9)
npm run test:e2e                   # Playwright: full lifecycle + role nav
```

## Test accounts

All passwords: `Password123!`

| Org | Email | Role |
|---|---|---|
| Acme Inc (USD) | `admin@acme.test` | Admin (senior approver) |
| Acme Inc (USD) | `approver@acme.test` | Approver |
| Acme Inc (USD) | `requester@acme.test` | Requester |
| Globex (EUR) | `admin@globex.test` | Admin |

Acme's threshold is **$1,000** — the seeded "New developer laptop" ($1,200) can only
be approved by the admin, not the approver. Globex exists to demonstrate that Acme
users can't see or touch another tenant's data.

## Project layout

```
supabase/migrations/   versioned SQL — schema, triggers, RLS helpers, policies, RPCs
scripts/seed.mjs       deterministic demo data (service role)
scripts/redteam.mjs    RLS verification with the public anon key
lib/supabase/          server + browser SSR clients, session-refresh proxy
lib/                   context (org/role), Zod validation, money, logger
app/                   App Router routes (auth, onboarding, app shell, flows)
e2e/                   Playwright smoke
docs/                  PLAN, CONVENTIONS, STATE, PRESENTATION
```

## What I deliberately cut (72h judgment)

- **Transactional email** on decision — needs a verified sending domain (you can't
  verify `*.vercel.app`). Replaced with **in-app notifications**. ~30-min add later.
- **Dual / multi-level approval** over a higher tier — the threshold model is the
  single-tier version; the RPC is the place to extend it.
- **Receipt uploads, SSO, billing** — out of scope for one flow in 72 hours.

See `docs/PRESENTATION.md` for the full reasoning, trade-offs, and "if I had more time."

## Deployment

See `docs/DEPLOY.md` for the turnkey steps (hosted Supabase + Vercel).
