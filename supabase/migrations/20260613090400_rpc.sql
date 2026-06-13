-- ============================================================================
-- 0005 · Business RPCs (the only way state changes happen)
-- ----------------------------------------------------------------------------
-- All SECURITY DEFINER with a locked search_path. Each one re-derives the actor
-- from auth.uid() (never trusts a passed-in user id) and enforces the domain
-- rules in the database, so the guarantees hold no matter what the client does.
-- ============================================================================

-- ---- create_organization ---------------------------------------------------
-- Creates an org and makes the caller its first admin, atomically.
create or replace function public.create_organization(
  p_name            text,
  p_currency        text default 'USD',
  p_threshold_minor bigint default 100000
)
returns public.organizations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_org public.organizations;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.organizations (name, default_currency, approval_threshold_minor, created_by)
  values (trim(p_name), upper(p_currency), greatest(p_threshold_minor, 0), v_uid)
  returning * into v_org;

  insert into public.memberships (org_id, user_id, role)
  values (v_org.id, v_uid, 'admin');

  return v_org;
end;
$$;

-- ---- accept_invitation -----------------------------------------------------
-- Lets an invited user join an org with the role chosen by the admin. We verify
-- the caller's email matches the invitation so a leaked token can't be redeemed
-- by someone else.
create or replace function public.accept_invitation(p_token text)
returns public.memberships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_email  text;
  v_inv    public.invitations;
  v_member public.memberships;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select email into v_email from auth.users where id = v_uid;

  select * into v_inv from public.invitations where token = p_token;
  if v_inv.id is null then
    raise exception 'invitation not found';
  end if;
  if v_inv.accepted_at is not null then
    raise exception 'invitation already used';
  end if;
  if v_inv.expires_at < now() then
    raise exception 'invitation expired';
  end if;
  if lower(v_inv.email) <> lower(v_email) then
    raise exception 'this invitation was issued to a different email';
  end if;

  insert into public.memberships (org_id, user_id, role)
  values (v_inv.org_id, v_uid, v_inv.role)
  on conflict (org_id, user_id) do update set role = excluded.role
  returning * into v_member;

  update public.invitations set accepted_at = now() where id = v_inv.id;

  return v_member;
end;
$$;

-- ---- decide_request --------------------------------------------------------
-- The crux. Enforces, in one transaction:
--   1. caller is authenticated
--   2. decision is approve OR reject
--   3. request exists and is still pending (row locked to serialize approvers)
--   4. SEGREGATION OF DUTIES: caller is not the requester (no self-approval)
--   5. caller is an approver/admin of the request's org
--   6. THRESHOLD ROUTING: over the org threshold requires an admin
--   7. flips status, stamps decider, writes audit event + notifies requester
create or replace function public.decide_request(
  p_request  uuid,
  p_decision public.request_status,
  p_note     text default null
)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_req       public.requests;
  v_threshold bigint;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_decision not in ('approved', 'rejected') then
    raise exception 'decision must be approved or rejected';
  end if;

  -- lock the row so two approvers deciding at once serialize here
  select * into v_req from public.requests where id = p_request for update;
  if v_req.id is null then
    raise exception 'request not found';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'request already %', v_req.status;  -- wins the concurrency race
  end if;

  if v_req.requester_id = v_uid then
    raise exception 'you cannot decide your own request';
  end if;

  if not public.is_org_approver(v_req.org_id) then
    raise exception 'not authorized to decide requests in this organization';
  end if;

  select approval_threshold_minor into v_threshold
  from public.organizations where id = v_req.org_id;

  if v_req.amount_minor > v_threshold and not public.is_org_admin(v_req.org_id) then
    raise exception 'amount exceeds your approval limit; an admin must decide this request';
  end if;

  update public.requests
     set status        = p_decision,
         decided_by    = v_uid,
         decided_at    = now(),
         decision_note = p_note
   where id = p_request and status = 'pending'
   returning * into v_req;

  -- enum-to-enum needs to round-trip through text in Postgres
  insert into public.request_events (org_id, request_id, actor_id, type, from_status, to_status, note)
  values (v_req.org_id, v_req.id, v_uid, p_decision::text::public.event_type, 'pending', p_decision, p_note);

  insert into public.notifications (user_id, org_id, request_id, type, body)
  values (
    v_req.requester_id, v_req.org_id, v_req.id, p_decision::text::public.notification_type,
    format('Your request "%s" was %s', v_req.title, p_decision)
  );

  return v_req;
end;
$$;

-- ---- withdraw_request ------------------------------------------------------
-- A requester can withdraw their OWN request while it is still pending.
create or replace function public.withdraw_request(p_request uuid)
returns public.requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_req public.requests;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select * into v_req from public.requests where id = p_request for update;
  if v_req.id is null then
    raise exception 'request not found';
  end if;
  if v_req.requester_id <> v_uid then
    raise exception 'you can only withdraw your own request';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'request already %', v_req.status;
  end if;

  update public.requests
     set status = 'withdrawn'
   where id = p_request and status = 'pending'
   returning * into v_req;

  insert into public.request_events (org_id, request_id, actor_id, type, from_status, to_status, note)
  values (v_req.org_id, v_req.id, v_uid, 'withdrawn', 'pending', 'withdrawn', null);

  return v_req;
end;
$$;

grant execute on function
  public.create_organization(text, text, bigint),
  public.accept_invitation(text),
  public.decide_request(uuid, public.request_status, text),
  public.withdraw_request(uuid)
to authenticated;
