# CLAUDE.md — Expense Approval Mini App

Project-specific guidance for working in this repo. Read alongside `docs/PLAN.md`
(architecture) and `docs/CONVENTIONS.md` (coding + git rules).

## What this is

A multi-tenant **request → review → decision** web app for company expense approvals.
Two-plus roles (requester, approver, admin). Stack: **Next.js (App Router) · Supabase
(Postgres + Auth + RLS) · Vercel · Resend · Sentry**.

## Non-negotiables (do not regress these)

1. **Authorization lives in the database, not the UI.** Every table has RLS enabled with
   explicit policies. Never rely on hiding a button for security.
2. **No client-side `UPDATE` of `requests.status`.** All state transitions go through the
   `decide_request` Postgres RPC (`SECURITY DEFINER`). RLS is defense-in-depth on top.
3. **The `service_role` key never reaches the browser.** It is server-only. The browser
   uses the `anon` key, which is public by design — RLS is what protects the data.
4. **Sessions use `@supabase/ssr` httpOnly cookies.** Never store JWTs in localStorage.
5. **Money is integer minor units (cents).** Never floats. Currency is explicit per org.
6. **Validate at the boundary.** Zod-parse all input in every server action / route handler.
7. **No self-approval.** The decision path enforces `actor_id <> requester_id`.

## Where things live

- `docs/` — PLAN.md (architecture), CONVENTIONS.md (rules), PRESENTATION.md (submission deck)
- `supabase/migrations/` — versioned SQL (schema, RLS, RPC). The source of truth for the DB.
- `supabase/seed.sql` — seed data incl. test accounts.
- `app/` — Next.js routes (App Router). Role-aware layouts.
- `lib/supabase/` — `server.ts` (cookie-based server client), `client.ts` (browser client).
- `lib/` — validation schemas (Zod), logger, domain helpers.

## Workflow expectations

- Work on **feature branches**, open a **PR** into `develop`, keep commits **atomic and
  conventional** (`feat:`, `fix:`, …). See `docs/CONVENTIONS.md` for the full git policy.
- DB changes are **always** a new migration file — never edit an applied migration, never
  click changes into the Supabase dashboard without capturing them as a migration.
- After meaningful changes, run the **red-team checklist** in `docs/PLAN.md`.

## Verifying RLS (do this, don't assume)

Before claiming a boundary holds, prove it: hit the Supabase REST endpoint directly with a
requester's token and confirm approve/cross-user-read/status-write all fail. Capture the
output for the presentation.
