# STATE — running context & progress

> Living document. Updated as work progresses. This is the single source of truth for
> "where are we and what's next." Read this first when resuming.

_Last updated: initial setup._

## Current phase

**Phase 1 — DB foundation + scaffold.** Setting up the Next.js project and the Supabase
schema/RLS/RPC before any UI.

## Done

- [x] Architecture + scope locked (`docs/PLAN.md`)
- [x] Project `CLAUDE.md` (non-negotiables) + `docs/CONVENTIONS.md` (git/coding rules)
- [x] Git initialized: `main` (deployable) + `develop` (integration); first commit = governance docs
- [x] GitHub auth confirmed (account `Txbish`, ssh) — remote/PRs available
- [x] Working on branch `feat/scaffold-nextjs`

## In progress

- [ ] Scaffold Next.js (App Router, TS, Tailwind)

## Next (ordered)

1. Next.js scaffold + `lib/supabase/{server,client}.ts` (`@supabase/ssr`, httpOnly cookies)
2. Supabase migrations: schema → RLS (per-operation policies) → `decide_request` RPC → seed
3. Auth (sign up / log in) + middleware session refresh
4. Org onboarding (create org / join via invite)
5. Requester flow (new request, my requests, detail, withdraw)
6. Approver flow (queue, decide) + threshold routing
7. Admin (members/roles, settings) + activity feed
8. Observability (Sentry, structured logs, /api/health) + Resend email on decision
9. Red-team verification (capture output) → deploy to Vercel → presentation

## Decisions log

- **Multi-tenant** (org_id isolation in RLS) — stronger "real SaaS" + RLS signal.
- **Threshold-routed single approval** — under threshold any approver; over ⇒ admin. One tier.
- **Extras in scope:** Sentry, in-app activity feed, **in-app notifications** on decision.
- **Money:** integer minor units; currency per org.
- **Auth:** Supabase Auth via `@supabase/ssr` cookies (no localStorage JWT). **No Clerk** —
  RLS must use native `auth.uid()`; orgs/roles are our own tables (the differentiator).
- **Email cut:** Resend/transactional email dropped — needs a verified domain, can't verify
  `*.vercel.app`. Replaced with in-app notifications. Documented as a deliberate cut.

## Grading rubric — self-check before submission

**Non-negotiables (auto-fail if missing):**
- [ ] Auth: httpOnly cookies, no JWT in localStorage
- [ ] RLS on **every** table, separate SELECT/INSERT/UPDATE/DELETE policies
- [ ] Two roles with genuinely different UIs **and** DB-level enforcement
- [ ] Real lifecycle pending → approved/rejected, visible+correct to both sides
- [ ] Deployed live URL with test accounts that actually log in

**Separators:**
- [ ] CLAUDE.md / rules file showing deliberate AI use ✅ (done)
- [ ] No prototype shortcuts: no hardcoded secrets, no skipped auth checks, no stray console.log
- [ ] Clean, focused, conventional git history + PRs
- [ ] README + presentation: what I built, what I cut, the deeper fix if more time
- [ ] Sensible first-3-features scope (judgment, not a full product)

**Avoid:**
- [ ] Over-engineering — cut deliberately, document cuts
- [ ] Skipping the presentation (required)
- [ ] Any flagged security shortcut (localStorage tokens, missing RLS, unguarded API routes)

## Credentials / env needed (user to provide)

| Var | Source | Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project | ⬜ pending |
| `SUPABASE_SERVICE_ROLE_KEY` (server only) | Supabase project | ⬜ pending |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | sentry.io | ⬜ pending |
| Vercel project link | vercel.com | ⬜ pending |

_Resend removed — email cut in favor of in-app notifications (no domain to verify)._

## Open questions for the user

- Create a GitHub repo now (`gh repo create`) so PRs are real? (auth is ready)
- Supabase: create a hosted project to develop against, or run `supabase start` locally
  (needs Docker) and push migrations to hosted before deploy?
