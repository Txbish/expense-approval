-- ============================================================================
-- 0008 · Approver fallback for above-threshold requests
-- ----------------------------------------------------------------------------
-- Policy: above-threshold requests normally require an ADMIN to decide. But if
-- an org has no admin OTHER THAN the requester (e.g. a single-admin org where
-- the admin submitted the request), the request would be permanently
-- undecidable — the sole admin can't self-approve, and approvers are blocked
-- by the threshold. In that specific case, any approver may decide it.
--
-- Segregation of duties is preserved (the requester still cannot decide their
-- own request). This only widens WHO can decide when no eligible admin exists.
--
-- The same rule is exposed to the UI via request_eligible_admin_exists() so the
-- interface shows the fallback explicitly instead of letting a click fail.
-- ============================================================================

-- ---- request_eligible_admin_exists -----------------------------------------
-- True when the request's org has at least one admin who is NOT the requester.
-- SECURITY DEFINER so the UI can ask reliably regardless of the caller's RLS
-- visibility into memberships. Read-only.
create or replace function public.request_eligible_admin_exists(p_request uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.requests r
    join public.memberships m on m.org_id = r.org_id
    where r.id = p_request
      and m.role = 'admin'
      and m.user_id <> r.requester_id
  );
$$;

grant execute on function public.request_eligible_admin_exists(uuid) to authenticated;

-- ---- decide_request (amended) ----------------------------------------------
-- Identical to 0005 except the threshold guard now also requires that an
-- eligible (non-requester) admin actually exists before blocking an approver.
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

  -- Above the threshold needs an admin — UNLESS no eligible (non-requester)
  -- admin exists, in which case an approver may decide so the request isn't
  -- stuck forever.
  if v_req.amount_minor > v_threshold
     and not public.is_org_admin(v_req.org_id)
     and exists (
       select 1
       from public.memberships m
       where m.org_id = v_req.org_id
         and m.role = 'admin'
         and m.user_id <> v_req.requester_id
     )
  then
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

grant execute on function public.decide_request(uuid, public.request_status, text) to authenticated;
