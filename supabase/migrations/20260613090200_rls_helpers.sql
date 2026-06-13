-- ============================================================================
-- 0003 · RLS helper functions
-- ----------------------------------------------------------------------------
-- These read `memberships` to answer "is the current user a member / approver /
-- admin of this org?". They are SECURITY DEFINER so that policies ON memberships
-- (and other tables) can call them WITHOUT triggering infinite RLS recursion on
-- memberships itself. search_path is locked to '' and every name is schema-
-- qualified to prevent search_path hijacking.
--
-- They are STABLE (same answer within a statement) and execute as the table
-- owner, bypassing RLS internally — but they only ever expose a boolean.
-- ============================================================================

create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(p_org uuid, p_role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid() and role = p_role
  );
$$;

-- approver OR admin (admins are senior approvers)
create or replace function public.is_org_approver(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid() and role in ('approver', 'admin')
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships
    where org_id = p_org and user_id = auth.uid() and role = 'admin'
  );
$$;

-- does the current user own this request? (lets requesters see their own audit
-- events without exposing the whole org's event stream to them)
create or replace function public.owns_request(p_request uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.requests
    where id = p_request and requester_id = auth.uid()
  );
$$;

-- do I share at least one org with this user? (so we can render their name)
create or replace function public.shares_org_with(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships me
    join public.memberships them on them.org_id = me.org_id
    where me.user_id = auth.uid() and them.user_id = p_user
  );
$$;

grant execute on function
  public.is_org_member(uuid),
  public.has_org_role(uuid, public.app_role),
  public.is_org_approver(uuid),
  public.is_org_admin(uuid),
  public.owns_request(uuid),
  public.shares_org_with(uuid)
to authenticated;
