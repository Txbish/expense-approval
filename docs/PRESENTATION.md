# Approvals — Project Presentation

A multi-tenant expense-approval app. One **request → review → decision** flow, built
to production-discipline in 72 hours with Next.js · Supabase · Vercel · Claude Code.

> Use this as speaker notes for a 5–8 minute walkthrough, or read it straight through.
> **Live:** https://expense-approval-teal.vercel.app — test accounts in the README.

---

## 1 · What I built (30 seconds)

Employees submit expense requests; approvers review and decide. Two real roles with
genuinely different UIs, a real lifecycle (`pending → approved/rejected`), live to both
sides, fully audited — and it's **multi-tenant**: companies sign up and their data is
isolated from each other.

---

## 2 · The decision that drove everything

**With Supabase, the anon key is in the browser. It's public.** So the real security
boundary isn't my React code — anyone can ignore my UI and hit the database with `curl`.
The only thing protecting the data is **Row-Level Security**.

So I treated the take-home as a security exercise wearing an expense-app costume, and put
**all** authorization in the database:

- RLS enabled on **every** table, default-deny.
- **Separate policies per operation** (SELECT/INSERT/UPDATE/DELETE).
- The `authenticated` role is **not even granted `UPDATE` on `requests`** — status
  changes are physically impossible from a client. They go through one audited Postgres
  function instead.

This is the thing I think most submissions gloss over.

---

## 3 · Architecture

```
Browser ── anon key ──► Supabase REST/Auth        (httpOnly cookie session via @supabase/ssr)
   │                         │
   ▼                         ▼
Next.js (Vercel)        Postgres + RLS  ◄── the real authorization boundary
   │                         ▲
   └── server actions ───────┘
        └─ decide_request() / withdraw_request()  (SECURITY DEFINER, the only writers of status)
```

Identity = Supabase Auth (no Clerk — I wanted RLS to use native `auth.uid()`).
Tenancy + roles = my own `organizations` / `memberships` tables, so the isolation is
enforced by *my* RLS, not outsourced.

---

## 3b · Data model

Seven tables. `auth.users` is Supabase's; everything else is mine. The `memberships`
table is the hinge — it's what makes the app multi-tenant *and* role-aware, and almost
every RLS policy keys off it.

```
auth.users ─1:1─ profiles                         (name/email mirror, via trigger)
    │
    │ 1:N
    ▼
memberships ──N:1──► organizations                (role: admin | approver | requester)
                          │  1:N
                          ▼
                       requests ──1:N──► request_events   (append-only audit log)
                          ▲                   ▲
                          │ requester_id      │ actor_id
                       auth.users ────────────┘
organizations ─1:N─ invitations                   (email + role + single-use token)
auth.users    ─1:N─ notifications                  (in-app, replaces email)
```

Key column choices that carry weight:
- `requests.amount_minor BIGINT` — integer cents, never a float. `currency` is copied
  from the org by a trigger so it can't be spoofed.
- `requests.status` enum drives the lifecycle; it is only ever written by the RPC.
- `memberships UNIQUE(org_id, user_id)` — you can't be in one org twice.
- `request_events` has **no** UPDATE/DELETE policy — the audit trail is immutable.
- `organizations.approval_threshold_minor` — the single knob behind threshold routing.

## 4 · The security model in one screen

| Rule | Where it's enforced |
|---|---|
| You only see your org's data | RLS scopes every table by `org_id` |
| Requesters see only their own requests; approvers see the org's | `requests` SELECT policy |
| Nobody writes `status` from a client | no UPDATE grant + no UPDATE policy → RPC only |
| **No self-approval** | `decide_request`: `actor ≠ requester` |
| **Over threshold needs an admin** | `decide_request`: amount vs `approval_threshold` |
| Two approvers at once → one winner | row lock + `WHERE status='pending'` |
| Every decision is permanent + traceable | append-only `request_events`, no UPDATE/DELETE policy |

---

## 5 · Proof — I attacked my own app

`npm run redteam` signs in as real users with the **public anon key** and tries to break in:

```
PASS  tenant isolation: Acme user sees zero Globex requests
PASS  row ownership: requester sees only own requests
PASS  no client writes: direct UPDATE status is blocked  (Postgres 42501)
PASS  segregation of duties: self-approval rejected
PASS  approval limit: over-threshold blocked for approver
PASS  approval limit: admin CAN approve over-threshold
PASS  concurrency: exactly one decision wins  (1 win / 1 blocked)
PASS  unauthenticated: anon client reads zero rows
PASS  cross-tenant: approver cannot decide another org's request
9 passed, 0 failed
```

I'd rather show you the boundary holding than tell you it does.

---

## 6 · A bug worth bragging about

My Playwright test caught the UI showing a **requester** the admin navigation. At first
that looks like a privilege-escalation bug. It wasn't — because authorization lives in
the database. The RLS policies key off `auth.uid()`, not what the UI *thinks* your role
is, so the requester still couldn't actually approve anything, change settings, or read
another user's data. The database would have rejected every attempt.

The UI was wrong; the system was still safe. **That's the dividend of authorizing at the
data layer instead of the UI** — and exactly why the two RLS questions in the assessment
matter. (I fixed the UI too: `getAppContext` now scopes the membership lookup to the
current user.)

---

## 6b · Rigor: I verified the boundary on the *hosted* DB, not just locally

After deploying, I re-ran the red-team against the **production** database — and caught
something. Supabase's hosted platform applies `ALTER DEFAULT PRIVILEGES GRANT ALL TO
anon, authenticated`, which had silently overridden my selective table grants. The app
was still safe (RLS blocked everything), but my "the role isn't even *granted* UPDATE"
claim was only true locally. So I added a migration that explicitly **revokes** the
defaults and re-grants the least-privilege set. Now, on production: `authenticated` has
only `SELECT, INSERT` on `requests`, and `anon` has **zero** table privileges — a direct
`UPDATE` returns Postgres `42501` (permission denied), not just an empty result.

The lesson I'd want a reviewer to take: I don't trust that a control works because the
migration says so — I test it where it actually runs.

## 7 · Observability — how I'd debug this at 2am

The assessment asked about fixing a production-only bug from logs alone. So:

- **Structured JSON logs** with a `request_id` on every server action — one log line
  ties an error to the action and actor.
- **Append-only audit log** = domain-level traceability of who decided what, when.
- **`/api/health`** endpoint (privilege-free DB probe) for uptime monitoring.
- **Sentry** hook is wired and env-gated (blank DSN = disabled) for client/server errors.

---

## 8 · First three features (the assessment's portal question)

I shipped exactly the three things that make this flow *real*, and nothing else:

1. **Auth + roles done right** — because without a trustworthy requester/approver
   boundary, nothing else means anything.
2. **The request lifecycle with the decision RPC** — the core value, with the controls
   a finance team actually needs (no self-approval, approval limits).
3. **The audit trail** — in a money workflow, "who approved this and when" is not
   optional.

Everything else (email, dual approval, uploads) is a layer on top of these three.

---

## 9 · What I cut, and the deeper fix (band-aid vs real)

- **Email on decision** → cut. Real email needs a verified domain; you can't verify
  `*.vercel.app`. The band-aid (email only to my own address) would look fake in a demo,
  so I shipped **in-app notifications** instead and documented the real fix: verify a
  domain with Resend/Postmark (~30 min) and have the RPC enqueue a send.
- **Dual approval over a higher tier** → cut. The single threshold tier is in; the RPC
  is the one place to extend it, so it's a contained change, not a rewrite.
- **Editing a pending request** → cut intentionally to keep the "no client writes to
  requests" story airtight; would add a narrow, status-guarded UPDATE policy.

---

## 9b · What I'd add with more time

In rough priority order — each is a contained change, not a rewrite:

1. **Multi-level / dual approval.** A second threshold tier where big-ticket requests need
   *two* distinct approvers. The `decide_request` RPC is the single place this lives:
   record approvals in a join table and only flip `status` when the quorum is met.
2. **Transactional email (Resend) + digests.** Verify a domain, then have the RPC enqueue
   a decision email and a daily "pending approvals" digest for approvers. The in-app
   notifications already model the events; email is just another channel.
3. **Audit export.** CSV/JSON export of `request_events` for a date range — finance teams
   live on this for reconciliation. Append-only data makes it trivial and trustworthy.
4. **Spend analytics for admins.** Approved spend by category/month, approver throughput,
   time-to-decision. A read-only reporting view; no change to the write path.
5. **Receipts.** Supabase Storage uploads on a request, with RLS mirroring the request's
   visibility.
6. **Request editing + comments.** A narrow, status-guarded UPDATE policy so a requester
   can amend a *pending* request, plus a comment thread on the detail page.
7. **Role hardening niceties.** Org ownership transfer, and SSO for larger customers.

What I deliberately would **not** add: a separate heavyweight "admin dashboard." The
existing dashboard + members + settings + activity already cover the admin surface for
one approval flow; more would be over-engineering for this scope.

## 10 · Adding a required field to a live table (the migration question)

If I had to add a NOT-NULL column to `requests` with real users on it, I would **not**
do it in one step (that locks the table / rejects existing rows). The safe sequence:

1. Add the column **nullable** (instant).
2. **Backfill** in batches.
3. Add a default + `NOT NULL` once every row satisfies it.
4. Ship the app code that writes it — behind the migration, not ahead of it.

At demo scale it doesn't matter; with real data it's the difference between a deploy and
an outage. Migrations here are versioned SQL, applied with `supabase db push` — never
clicked into the dashboard.

---

## 11 · How I worked with Claude Code

- A project **`CLAUDE.md`** encodes the non-negotiables (RLS, no localStorage JWT, money
  as integers, service-role key never in the browser) so the assistant stays on-rails.
- **`docs/CONVENTIONS.md`** defines the git + coding rules; **`docs/STATE.md`** is a live
  context doc I kept updated as the build progressed.
- **Clean, conventional, reviewable commits** on a feature branch → PR into `develop`.
- I pushed back on the AI where my judgment differed (e.g. declining Clerk so RLS keeps
  using native `auth.uid()`; cutting email rather than faking deliverability).

---

## 12 · Try it

Live URL + test accounts in the README. The fastest way to feel the design:

1. Log in as **`approver@acme.test`**, open the queue, try to approve the **$1,200
   laptop** → blocked (over the approver's limit).
2. Log in as **`admin@acme.test`** → approve the same request → it goes through.
3. Run `npm run redteam` and watch the database refuse every attack.
