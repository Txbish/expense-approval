-- ============================================================================
-- 0008 · Keep at least one admin per org (no self-lockout)
-- ----------------------------------------------------------------------------
-- Enforced at the DB so it holds even against a direct API call — an admin
-- cannot demote or remove the org's last admin (which would orphan the org).
-- ============================================================================
create or replace function public.prevent_orphan_org()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org    uuid := old.org_id;
  v_admins int;
begin
  -- admins remaining in the org, excluding the row being changed/removed
  select count(*) into v_admins
  from public.memberships
  where org_id = v_org and role = 'admin' and id <> old.id;

  -- on UPDATE, the surviving row still counts if it remains an admin
  if tg_op = 'UPDATE' and new.role = 'admin' then
    v_admins := v_admins + 1;
  end if;

  if v_admins = 0 then
    raise exception 'an organization must keep at least one admin';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger trg_prevent_orphan_org
  before update or delete on public.memberships
  for each row execute function public.prevent_orphan_org();
