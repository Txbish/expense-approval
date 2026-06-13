/**
 * Minimal structured logger. Emits single-line JSON so Vercel log drains /
 * Sentry breadcrumbs stay queryable, and every server action attaches a
 * request_id so a production-only error can be traced from a single log line
 * back to the exact action and actor — the "diagnose from logs alone" workflow.
 */

type Level = "info" | "warn" | "error";

export function log(
  level: Level,
  event: string,
  fields: Record<string, unknown> = {},
) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

/** Short correlation id for a unit of work (server action / request). */
export function newRequestId(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 8)
  );
}
