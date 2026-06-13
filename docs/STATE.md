# STATE — running context & progress

> Living document. Updated as work progresses. This is the single source of truth for
> "where are we and what's next." Read this first when resuming.

_Last updated: initial setup._

## Current phase

**SHIPPED.** Live at https://expense-approval-teal.vercel.app (Supabase project
`vwexnfnymyaeieyvbbfd`, Vercel project `expense-approval`). Red-team 9/9 on the hosted
DB; role nav + queue verified live. Remaining: final PR review/merge at your discretion;
revoke the Supabase PAT.

## Done

- [x] Architecture + scope locked (`docs/PLAN.md`)
- [x] Project `CLAUDE.md` + `docs/CONVENTIONS.md`
- [x] Git: `main` + `develop`; working on `feat/scaffold-nextjs`; focused commit history
- [x] GitHub auth confirmed (account `Txbish`, ssh)
- [x] Next.js 16 scaffold (App Router, TS, Tailwind)
- [x] Supabase local stack running (Docker); `@supabase/ssr` clients + middleware
- [x] **DB foundation: 5 migrations** — schema, triggers, RLS helpers, per-op RLS policies, RPCs
- [x] Seed script (2 orgs for cross-tenant tests, 6 users, mixed-state requests)
- [x] **Red-team script: 9/9 PASS** — tenant isolation, ownership, no client writes,
      self-approval blocked, approval limits, single-winner concurrency, anon lockout
- [x] Shared libs: Zod validation, money helpers, JSON logger

## Done (Phase 2)

- [x] Full UI: auth, onboarding, invite, dashboard, requester/approver/admin flows
- [x] Role-aware nav + multi-org switcher; in-app notifications + activity feed
- [x] `/api/health` probe (privilege-free `health()` fn) — returns ok
- [x] **Playwright E2E green (2/2):** full lifecycle across two roles + role-based nav
- [x] Build + typecheck clean; **caught & fixed a role mis-resolution bug** via E2E
      (getAppContext was reading co-members; RLS still would have blocked real actions —
      defense-in-depth held — but UI showed wrong buttons. Now scoped to auth.uid().)

## Next (ordered)

1. Sentry wiring (optional — needs user's DSN; gated so blank = disabled)
2. Create hosted Supabase project; push migrations; disable email confirmation; seed
3. Deploy to Vercel; set env vars; smoke-test live test accounts
4. README + PRESENTATION (incl. red-team output, cuts, deeper-fix notes)
5. Open PR feat/scaffold-nextjs → develop → main

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
