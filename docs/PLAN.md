# Expense Approval — Mini App Plan

A multi-tenant **request → review → decision** flow for company expense/budget approvals.
Built for a vibe-coder take-home. Stack: Next.js (App Router) · Supabase (Postgres + Auth + RLS) · Vercel · Claude Code.

> **Thesis:** the take-home is the practical version of the assessment quiz. The graders
> will check whether authorization lives in the **database (RLS)** or just the UI. Everything
> below is designed so the approver boundary holds even when someone bypasses the frontend.

---

## Roles

- **Requester** — creates expense requests, views own requests, can withdraw while pending.
- **Approver** — reviews requests in their org, approves/rejects with a note.
- **Admin** — everything an approver can do, plus: invite members, assign roles, set the
  org currency and the approval threshold. Admin is the *senior approver* for big-ticket items.

A user can belong to multiple orgs with a different role in each (`memberships` is the link).

---

## Core controls (the differentiators)

1. **RLS everywhere, default-deny.** Two boundaries enforced at the data layer:
   tenant isolation by `org_id`, and role permissions within the org.
2. **Decisions go through one `SECURITY DEFINER` RPC** (`decide_request`), never a client
   `UPDATE status`. The RPC enforces, atomically:
   - actor is approver/admin **in that org**
   - actor **≠** requester (segregation of duties — no self-approval)
   - amount-vs-threshold routing: over threshold ⇒ requires **admin**
   - request is still `pending` (the `WHERE status='pending'` clause also wins the
     concurrent-approval race — second approver gets "already decided")
   - writes the status flip **and** an audit-log row in one transaction
3. **Append-only audit log** (`request_events`): who, what, from→to status, when, note.
   No UPDATE/DELETE policy for anyone.
4. **Money as integer minor units** (cents). Never floats.
5. **Real sessions** via `@supabase/ssr` httpOnly cookies — not a JWT in localStorage.
6. **Input validation at the boundary** with Zod on every server action.

---

## Data model

| Table | Key columns |
|---|---|
| `organizations` | id, name, default_currency, approval_threshold_minor, created_at |
| `profiles` | id (=auth.users.id), full_name, email |
| `memberships` | id, org_id, user_id, role[admin\|approver\|requester] |
| `requests` | id, org_id, requester_id, title, amount_minor, currency, category, justification, status[pending\|approved\|rejected\|withdrawn], decided_by, decided_at, created_at, updated_at |
| `request_events` | id, org_id, request_id, actor_id, type, from_status, to_status, note, created_at |
| `invitations` | id, org_id, email, role, token, expires_at, accepted_at |
| `notifications` | id, user_id, org_id, request_id, type, body, read_at, created_at |

RLS helper: `has_role(org_id, role)` reading `memberships`. All policies scope by
`org_id in (select org_id from memberships where user_id = auth.uid())`.

---

## Screens

**MVP**
- Auth: sign up / log in (httpOnly cookies)
- Onboarding: create org (→ Admin) or join via invite
- Requester: My Requests (list+filter) · New Request · Request Detail (timeline, withdraw)
- Approver: Approval Queue · Request Detail (approve/reject + note)
- Admin: Members & Roles · Org Settings (currency + threshold)

**Included extras**
- In-app Activity feed (reads `request_events`) — doubles as observability UI
- **In-app notification on decision** (`notifications` table; bell/feed) — replaces email
- Sentry error tracking + structured server logs (request_id) + `/api/health`
- Vercel Web Analytics

**Identity & tenancy decisions**
- **Supabase Auth** for identity (no Clerk/third-party) — so RLS uses native `auth.uid()`.
- **Our own `organizations`/`memberships` tables** for orgs + roles — tenant isolation is
  enforced by *our* RLS, which is the whole point. Not outsourced.
- Email confirmation **disabled** in Supabase for the demo so test accounts log in instantly.

---

## Observability story (answers the "prod-only bug" quiz question)

- **Sentry** (server + client) catches the unreproducible production error.
- **Structured logs** with a `request_id` correlation id on every server action.
- **Audit log** = domain-level traceability of every decision.
- **`/api/health`** for uptime checks.

---

## 72h sequencing

1. **DB foundation (front-loaded, highest risk):** migrations, RLS, `decide_request` RPC,
   seed script with test accounts. Auth + org onboarding.
2. **Flows:** requester → approver → admin/members/settings. Threshold routing.
3. **Observability + email, red-team verification, deploy, presentation.**

---

## Red-team checklist (to demo in the presentation)

- [ ] Requester `curl`s the REST endpoint to approve own request → blocked
- [ ] User A reads User B's requests → empty
- [ ] Client tries to `UPDATE status` directly → denied by RLS
- [ ] Over-threshold request approved by a non-admin approver → rejected by RPC
- [ ] Two approvers decide simultaneously → one wins, one gets "already decided"
- [ ] Cross-org read attempt → empty (tenant isolation)

---

## Deferred (documented, not built — honest scoping)

- **Transactional email** (Resend/Postmark) on decision — needs a verified sending domain
  (can't verify `*.vercel.app`); replaced with in-app notifications. ~30-min add with a domain.
- Multi-level / dual approval over a higher tier
- SSO / SAML, billing, org switching UI polish
- Receipt file uploads (Supabase Storage)
- Safe production migration of adding a NOT-NULL field on 1k+ rows
  (add nullable → backfill → set NOT NULL) — described, not needed at this data size
