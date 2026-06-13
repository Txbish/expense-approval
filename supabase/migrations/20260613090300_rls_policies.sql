-- ============================================================================
-- 0004 · RLS policies — explicit per operation (SELECT / INSERT / UPDATE / DELETE)
-- ----------------------------------------------------------------------------
-- Postgres RLS is default-deny: any command with no matching policy is rejected.
-- We therefore enumerate each verb deliberately. Where a verb is intentionally
-- impossible from a client (e.g. UPDATE on requests, INSERT on request_events),
-- we add NO policy AND withheld the grant in 0001 — two independent locks.
-- ============================================================================

-- ---- profiles --------------------------------------------------------------
-- See your own profile, and the profiles of people you share an org with
-- (needed to render requester / approver names). No cross-tenant leakage.
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.shares_org_with(id));

create policy profiles_insert on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
-- (no delete policy)

-- ---- organizations ---------------------------------------------------------
-- Members can read their org. Only admins can edit settings. Creation happens
-- through create_organization() (SECURITY DEFINER) — no client INSERT policy.
create policy organizations_select on public.organizations
  for select to authenticated
  using (public.is_org_member(id));

create policy organizations_update on public.organizations
  for update to authenticated
  using (public.is_org_admin(id))
  with check (public.is_org_admin(id));
-- (no insert/delete policy — insert via RPC)

-- ---- memberships -----------------------------------------------------------
-- Any member can see who else is in the org (approver lists, members screen).
-- Only admins may change roles or remove members. Inserts happen via RPC
-- (create_organization / accept_invitation).
create policy memberships_select on public.memberships
  for select to authenticated
  using (public.is_org_member(org_id));

create policy memberships_update on public.memberships
  for update to authenticated
  using (public.is_org_admin(org_id))
  with check (public.is_org_admin(org_id));

create policy memberships_delete on public.memberships
  for delete to authenticated
  using (public.is_org_admin(org_id));
-- (no insert policy — insert via RPC)

-- ---- requests --------------------------------------------------------------
-- SELECT: requesters see ONLY their own; approvers/admins see all org requests.
create policy requests_select on public.requests
  for select to authenticated
  using (requester_id = auth.uid() or public.is_org_approver(org_id));

-- INSERT: a member may create a request for THEMSELVES. The before-insert
-- trigger pins status='pending', so the with-check is satisfied structurally.
create policy requests_insert on public.requests
  for insert to authenticated
  with check (
    requester_id = auth.uid()
    and public.is_org_member(org_id)
    and status = 'pending'
  );
-- NO update / delete policy. Status transitions (approve/reject/withdraw) are
-- only possible through decide_request() / withdraw_request(). Combined with the
-- withheld UPDATE grant in 0001, a client physically cannot mutate a request.

-- ---- request_events (append-only audit) ------------------------------------
-- Requesters can read events for their own requests; approvers/admins read all
-- org events. No client writes at all (inserts come from SECURITY DEFINER code).
create policy request_events_select on public.request_events
  for select to authenticated
  using (public.is_org_approver(org_id) or public.owns_request(request_id));
-- (no insert/update/delete policy — append-only, written by triggers/RPC)

-- ---- invitations -----------------------------------------------------------
-- Admins manage invitations for their org. Acceptance is via accept_invitation()
-- (SECURITY DEFINER), which is how an invitee (not yet a member) can act on one.
create policy invitations_select on public.invitations
  for select to authenticated
  using (public.is_org_admin(org_id));

create policy invitations_insert on public.invitations
  for insert to authenticated
  with check (public.is_org_admin(org_id) and invited_by = auth.uid());

create policy invitations_delete on public.invitations
  for delete to authenticated
  using (public.is_org_admin(org_id));
-- (no update policy — accepted_at is set via RPC)

-- ---- notifications ---------------------------------------------------------
-- You only ever see / mutate your own notifications. Inserts are server-side.
create policy notifications_select on public.notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy notifications_update on public.notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_delete on public.notifications
  for delete to authenticated
  using (user_id = auth.uid());
-- (no insert policy — written by triggers/RPC)
