-- ============================================================================
-- 0002 · Triggers
--   - handle_new_user      : mirror auth.users -> public.profiles
--   - set_updated_at       : maintain requests.updated_at
--   - requests_before_ins  : force a safe initial state on new requests
--   - requests_after_ins   : write the 'created' audit event + notify approvers
-- All are SECURITY DEFINER with a locked search_path so they can write audit /
-- notification rows that the calling client role is NOT permitted to write.
-- ============================================================================

-- ---- New auth user -> profile ----------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- requests.updated_at ----------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_requests_updated_at
  before update on public.requests
  for each row execute function public.set_updated_at();

-- ---- Force a safe initial state on insert ----------------------------------
-- A client can INSERT a request, but it does NOT get to choose the status, the
-- currency, or any decision fields. Currency is copied from the org so it can't
-- be spoofed; status is pinned to 'pending'. (RLS WITH CHECK in 0004 is the
-- second lock; this is defense in depth and removes room for tampering.)
create or replace function public.requests_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_currency text;
begin
  select default_currency into v_currency
  from public.organizations where id = new.org_id;

  if v_currency is null then
    raise exception 'organization % not found', new.org_id;
  end if;

  new.status        := 'pending';
  new.currency      := v_currency;
  new.decided_by    := null;
  new.decided_at    := null;
  new.decision_note := null;
  new.created_at    := now();
  new.updated_at    := now();
  return new;
end;
$$;

create trigger trg_requests_before_insert
  before insert on public.requests
  for each row execute function public.requests_before_insert();

-- ---- Audit + notify on new request -----------------------------------------
create or replace function public.requests_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- audit trail
  insert into public.request_events (org_id, request_id, actor_id, type, from_status, to_status, note)
  values (new.org_id, new.id, new.requester_id, 'created', null, 'pending', null);

  -- notify everyone who can act on it (approvers + admins), except the requester
  insert into public.notifications (user_id, org_id, request_id, type, body)
  select m.user_id, new.org_id, new.id, 'submitted',
         format('New request "%s" for %s %s is awaiting review',
                new.title, new.currency, to_char(new.amount_minor / 100.0, 'FM999G999G990D00'))
  from public.memberships m
  where m.org_id = new.org_id
    and m.role in ('approver', 'admin')
    and m.user_id <> new.requester_id;

  return new;
end;
$$;

create trigger trg_requests_after_insert
  after insert on public.requests
  for each row execute function public.requests_after_insert();
