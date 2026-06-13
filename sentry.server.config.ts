import * as Sentry from "@sentry/nextjs";

// Env-gated: with no DSN this is a no-op, so the app runs identically with or
// without Sentry configured.
const dsn = process.env.SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});
