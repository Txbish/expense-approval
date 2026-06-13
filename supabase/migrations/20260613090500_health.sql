-- ============================================================================
-- 0006 · Health check function
-- ----------------------------------------------------------------------------
-- A privilege-free way for the /api/health probe to confirm the database is
-- reachable. Returns a constant; grants execute to anon so an unauthenticated
-- uptime monitor can call it WITHOUT exposing any table data.
-- ============================================================================
create or replace function public.health()
returns boolean
language sql
stable
as $$ select true $$;

grant execute on function public.health() to anon, authenticated;
