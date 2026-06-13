-- ============================================================================
-- 0007 · Harden table privileges (least privilege, for real)
-- ----------------------------------------------------------------------------
-- Supabase's hosted platform applies ALTER DEFAULT PRIVILEGES granting ALL on
-- public tables to `anon` and `authenticated`. That silently overrides the
-- selective GRANTs in 0001, so a plain GRANT is not enough to withhold a verb —
-- we must REVOKE first. RLS still blocks everything (proved by the red-team),
-- but we want the *grant* layer to be a true second lock, not just RLS.
--
-- After this migration:
--   * anon (logged-out) has NO table privileges at all — the app requires auth.
--   * authenticated has ONLY the verbs each table legitimately needs from a
--     client. In particular: NO UPDATE/DELETE on requests (transitions go through
--     the audited RPC) and NO INSERT on request_events (append-only via triggers).
-- ============================================================================

revoke all on public.profiles, public.organizations, public.memberships,
               public.requests, public.request_events, public.invitations,
               public.notifications
  from anon, authenticated;

-- Re-grant the intended least-privilege set to authenticated (mirrors 0001).
grant select, insert, update          on public.profiles       to authenticated;
grant select, update                  on public.organizations  to authenticated; -- insert via RPC
grant select, update, delete          on public.memberships    to authenticated; -- insert via RPC
grant select, insert                  on public.requests       to authenticated; -- update via RPC only
grant select                          on public.request_events to authenticated; -- writes via triggers/RPC
grant select, insert, delete          on public.invitations    to authenticated;
grant select, update, delete          on public.notifications  to authenticated; -- insert via triggers/RPC

-- anon intentionally receives nothing here. (Function EXECUTE grants, e.g.
-- public.health(), are unaffected — those are granted separately.)
