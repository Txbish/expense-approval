# Deployment

Turnkey path to a live URL: a **hosted Supabase project** + **Vercel**. ~15 minutes.

## 1. Create the hosted Supabase project

1. supabase.com → New project. Note the **project ref** (the `xxxx` in the project URL).
2. Project Settings → API: copy **Project URL**, **anon key**, **service_role key**.
3. Authentication → Providers → Email: **turn OFF "Confirm email"** (so test accounts
   log in instantly for the demo). Set **Site URL** to your Vercel URL once you have it.

## 2. Push the schema (migrations)

```bash
npx supabase login                      # opens browser; or set SUPABASE_ACCESS_TOKEN
npx supabase link --project-ref <ref>
npx supabase db push                    # applies supabase/migrations/* to the hosted DB
```

> The migrations are the single source of truth — nothing is clicked into the dashboard.

## 3. Seed test accounts (against the hosted project)

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
node scripts/seed.mjs
```

(Optional) verify RLS on the live DB:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="<anon_key>" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
node scripts/redteam.mjs
```

## 4. Deploy to Vercel

Either connect the GitHub repo in the Vercel dashboard, or use the CLI:

```bash
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL        # https://<ref>.supabase.co
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY   # anon key
# optional observability:
vercel env add NEXT_PUBLIC_SENTRY_DSN          # blank to disable
vercel --prod
```

**Do NOT** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel — the app never uses it. It's
only for the local seed/red-team scripts. Keeping it out of the deployment is the point.

## 5. Finish auth config

Back in Supabase → Authentication → URL Configuration: set **Site URL** to the Vercel
production URL (and add it to redirect allow-list). This keeps cookie sessions clean.

## 6. Smoke-test live

- Visit the URL → log in as `requester@acme.test` / `Password123!`.
- Submit a request; log in as `approver@acme.test` in a separate browser; approve it.
- Confirm `/api/health` returns `{"status":"ok"}`.

## Notes

- **Connection pooling:** Vercel serverless + Supabase works out of the box over the
  pooler; no extra config for this app's load.
- **Rotating keys:** if any key was shared during review, rotate it in Supabase → API.
