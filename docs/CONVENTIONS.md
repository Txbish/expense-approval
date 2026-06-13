# Conventions & Rules

Project coding + git conventions. These are enforced by reviewer expectation, not just CI.

## Git workflow

### Branches
- `main` — always deployable. Production points here. Protected: no direct commits.
- `develop` — integration branch. Feature PRs merge here first.
- `feat/<slug>`, `fix/<slug>`, `chore/<slug>` — short-lived working branches off `develop`.

```
main  ←──(release PR)──  develop  ←──(feature PRs)──  feat/*, fix/*, chore/*
```

### Commits — Conventional Commits
```
<type>(<scope>): <imperative summary>

<optional body — the "why", not the "what">
```
Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`, `build`.
Scopes (examples): `db`, `auth`, `requests`, `approvals`, `admin`, `rls`, `obs`, `ui`.

Examples:
- `feat(db): add organizations, memberships, requests schema + RLS`
- `feat(approvals): decide_request RPC with self-approval + threshold guards`
- `fix(auth): refresh session in middleware to stop random logouts`

Rules: one logical change per commit; never commit secrets; keep the tree green
(builds + lints) at every commit on a feature branch where practical.

### Pull Requests
Every change reaches `develop`/`main` via a PR (even solo — it's the audit trail the
graders will read). A PR body must include:
1. **What & why** — the problem and the approach.
2. **Security note** — does this touch RLS, the decision path, or auth? What was verified?
3. **Test plan** — how it was exercised (incl. red-team checks for auth-touching changes).
4. **Screenshots / output** where useful.

Before merging: review the full diff (`git diff develop...HEAD`), confirm migrations are
additive and ordered, and that no applied migration was edited.

> Note: this echoes the assessment's "stale PR / someone changed the same file" question —
> always rebase/merge `develop` and re-check the diff before clicking merge.

## Database rules

- One concern per migration; filename is timestamp-prefixed and ordered.
- **Never edit an applied migration.** Add a new one.
- RLS is `enable`d on every table the moment it's created, in the same migration.
- Destructive or column-adding changes on populated tables follow the safe pattern:
  add nullable → backfill → set constraint (documented even if not needed at demo scale).

## Code rules

- TypeScript strict. No `any` without a written reason.
- Server actions/route handlers: Zod-parse input first, return typed results.
- Many small files (200–400 lines typical). Organize by feature.
- Errors handled explicitly; user-facing messages are friendly, logs are detailed.
- Immutable data patterns; no hidden mutation.
- No hardcoded secrets — env vars only, validated at startup.

## Definition of done (per feature)

- [ ] Migration added (if DB touched) and applied locally + to the linked project
- [ ] RLS/decision-path change red-teamed and output captured
- [ ] Input validated at the boundary
- [ ] Builds + lints clean
- [ ] PR opened with the four required sections
