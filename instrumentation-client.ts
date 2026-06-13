import * as Sentry from "@sentry/nextjs";

// Browser-side Sentry. Uses the public DSN; env-gated so a blank value is a no-op.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: !!dsn,
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
