-- ============================================================================
-- 0001 · Schema: enums, tables, indexes, RLS enablement, least-privilege grants
-- ----------------------------------------------------------------------------
-- Multi-tenant expense-approval domain. Every table is tenant-scoped by org_id
-- and has RLS ENABLED in this same migration (policies arrive in 0004).
-- Privileges are deliberately least-privilege: e.g. the `authenticated` role is
-- never granted UPDATE on `requests`, so status transitions are physically
-- impossible outside the audited SECURITY DEFINER RPC. RLS is the fine-grained
-- gate on top of that coarse gate.
-- ============================================================================

create extension if not exists pgcrypto;

-- ---- Enums -----------------------------------------------------------------
create type app_role        as enum ('admin', 'approver', 'requester');
create type request_status  as enum ('pending', 'approved', 'rejected', 'withdrawn');
create type event_type      as enum ('created', 'approved', 'rejected', 'withdrawn');
create type notification_type as enum ('submitted', 'approved', 'rejected');

-- ---- profiles (1:1 with auth.users, populated by trigger) ------------------
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

-- ---- organizations (a tenant) ----------------------------------------------
create table public.organizations (
  id                       uuid primary key default gen_random_uuid(),
  name                     text not null check (length(trim(name)) > 0),
  default_currency         text not null default 'USD' check (char_length(default_currency) = 3),
  -- requests with amount_minor strictly greater than this require an admin to decide
  approval_threshold_minor bigint not null default 100000 check (approval_threshold_minor >= 0),
  created_by               uuid references auth.users(id),
  created_at               timestamptz not null default now()
);

-- ---- memberships (tenant + role link; the heart of multi-tenant RLS) -------
create table public.memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       app_role not null default 'requester',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ---- requests (the expense request) ----------------------------------------
create table public.requests (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references public.organizations(id) on delete cascade,
  requester_id  uuid not null references auth.users(id),
  title         text not null check (length(trim(title)) > 0),
  description   text,
  category      text not null,
  amount_minor  bigint not null check (amount_minor > 0),
  currency      text not null check (char_length(currency) = 3),
  status        request_status not null default 'pending',
  decided_by    uuid references auth.users(id),
  decision_note text,
  decided_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---- request_events (append-only audit log) --------------------------------
create table public.request_events (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  request_id  uuid not null references public.requests(id) on delete cascade,
  actor_id    uuid references auth.users(id),
  type        event_type not null,
  from_status request_status,
  to_status   request_status,
  note        text,
  created_at  timestamptz not null default now()
);

-- ---- invitations (onboarding into an org with a role) ----------------------
create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references public.organizations(id) on delete cascade,
  email       text not null,
  role        app_role not null default 'requester',
  token       text not null unique default encode(gen_random_bytes(16), 'hex'),
  invited_by  uuid references auth.users(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ---- notifications (in-app; replaces transactional email) ------------------
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  org_id     uuid references public.organizations(id) on delete cascade,
  request_id uuid references public.requests(id) on delete cascade,
  type       notification_type not null,
  body       text not null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

-- ---- Indexes ---------------------------------------------------------------
create index idx_memberships_user      on public.memberships (user_id);
create index idx_memberships_org       on public.memberships (org_id);
create index idx_requests_org_status   on public.requests (org_id, status);
create index idx_requests_requester    on public.requests (requester_id);
create index idx_events_request        on public.request_events (request_id);
create index idx_invitations_token     on public.invitations (token);
create index idx_notifications_user    on public.notifications (user_id, read_at);

-- ============================================================================
-- RLS: enable on every table NOW (default-deny until policies are added in 0004)
-- ============================================================================
alter table public.profiles       enable row level security;
alter table public.organizations  enable row level security;
alter table public.memberships    enable row level security;
alter table public.requests       enable row level security;
alter table public.request_events enable row level security;
alter table public.invitations    enable row level security;
alter table public.notifications  enable row level security;

-- ============================================================================
-- Least-privilege grants to the API roles.
-- `anon` (logged-out) gets nothing — the whole app requires auth.
-- `authenticated` gets ONLY the verbs each table legitimately needs from a
-- client. Notably: NO update/delete on requests (transitions go through the
-- audited RPC), and NO insert on request_events (append-only via triggers/RPC).
-- ============================================================================
grant usage on schema public to authenticated;

grant select, insert, update          on public.profiles       to authenticated;
grant select, update                  on public.organizations  to authenticated; -- insert via RPC
grant select, update, delete          on public.memberships    to authenticated; -- insert via RPC
grant select, insert                  on public.requests       to authenticated; -- update via RPC only
grant select                          on public.request_events to authenticated; -- writes via triggers/RPC
grant select, insert, delete          on public.invitations    to authenticated;
grant select, update, delete          on public.notifications  to authenticated; -- insert via triggers/RPC

-- service_role is the privileged backend role (seed scripts, server-side admin
-- tasks). It bypasses RLS and needs full DML. It is NEVER exposed to the browser.
grant all on public.profiles, public.organizations, public.memberships,
             public.requests, public.request_events, public.invitations,
             public.notifications
  to service_role;
