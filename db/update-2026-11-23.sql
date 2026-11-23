-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026
-- Run ONCE in Supabase → SQL Editor → New query → paste all → Run.
-- SAFE: deletes nothing. Existing projects, expenses and people are kept.
-- Safe to run again (every step checks first).
--
-- What it changes:
--   1. Projects get real details: location, client contact & phone,
--      start / end dates, priority, scope & deliverables.
--   2. Project expenses → the project's manager, whose approval is FINAL.
--      General expenses → the accounts team, whose approval is FINAL.
--      (Executives can still see everything and approve/reject at any stage.
--       Both can be switched back to "executive signs last" in Team → Approval routing.)
--   3. Accounts team can be several people (comma-separated emails).
--   4. Both naim@ and naem@ spellings get executive access, plus info@.
-- =============================================================================

-- 1. Project details ----------------------------------------------------------
alter table public.projects
  add column if not exists location       text,
  add column if not exists client_contact text,
  add column if not exists client_phone   text,
  add column if not exists start_date     date,
  add column if not exists end_date       date,
  add column if not exists priority       text not null default 'NORMAL',
  add column if not exists scope          text;

do $$ begin
  alter table public.projects add constraint projects_priority_chk
    check (priority in ('LOW','NORMAL','HIGH','URGENT'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.projects add constraint projects_dates_chk
    check (end_date is null or start_date is null or end_date >= start_date);
exception when duplicate_object then null; end $$;

-- 2. Settings -----------------------------------------------------------------
insert into public.app_settings (key, value) values
  ('pm_final', 'true'),          -- project manager's approval is final
  ('accounts_final', 'true'),    -- accounts team's approval is final
  ('general_approver_email', 'suhail@mindmastersksa.com')
on conflict (key) do nothing;

create or replace function public.setting_on(k text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select lower(trim(value)) in ('true','1','yes','on') from app_settings where key = k), false);
$$;

-- Accounts team = comma-separated list stored in general_approver_email
create or replace function public.accounts_emails() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_remove(string_to_array(
           regexp_replace(lower(coalesce((select value from app_settings where key = 'general_approver_email'), '')), '\s', '', 'g'),
           ','), ''), '{}'::text[]);
$$;

create or replace function public.is_general_approver() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p
                 where p.id = auth.uid() and p.active and lower(p.email) = any(public.accounts_emails()));
$$;

-- 3. Executives: naim@, naem@ and info@ ----------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(coalesce(new.email, ''));
begin
  if v_email not like '%@mindmastersksa.com' then
    raise exception 'Only @mindmastersksa.com accounts can sign in';
  end if;
  insert into profiles (id, email, full_name, role)
  values (new.id, v_email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(v_email, '@', 1)),
          case when v_email in ('naim@mindmastersksa.com','naem@mindmastersksa.com','info@mindmastersksa.com')
               then 'EXECUTIVE' else 'EMPLOYEE' end)
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.protect_executives() returns trigger
language plpgsql as $$
begin
  if lower(new.email) in ('naim@mindmastersksa.com','naem@mindmastersksa.com','info@mindmastersksa.com') then
    new.role := 'EXECUTIVE';
    new.active := true;
  end if;
  return new;
end $$;

update public.profiles set role = 'EXECUTIVE', active = true
where lower(email) in ('naim@mindmastersksa.com','naem@mindmastersksa.com','info@mindmastersksa.com');

-- 4. Routing on submit --------------------------------------------------------
create or replace function public.route_new_expense() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_active  boolean;
  v_proj    projects%rowtype;
  v_email   text;
begin
  new.user_id := auth.uid();
  select active, lower(email) into v_active, v_email from profiles where id = new.user_id;
  if v_active is not true then raise exception 'Your account is not active'; end if;
  if new.receipt_path is null or new.receipt_path not like (new.user_id::text || '/%') then
    raise exception 'A receipt upload is required';
  end if;

  new.first_approver_id := null; new.first_approved_at := null; new.first_note := null;
  new.final_approver_id := null; new.final_approved_at := null; new.final_note := null;
  new.rejected_by := null; new.rejected_at := null; new.rejection_reason := null;
  new.created_at := now(); new.updated_at := now();

  if new.expense_type = 'PROJECT' then
    select * into v_proj from projects where id = new.project_id;
    if not found then raise exception 'Project not found'; end if;
    if v_proj.status <> 'ACTIVE' then raise exception 'This project is not active'; end if;
    if not (public.is_exec() or v_proj.manager_id = new.user_id or public.is_project_member(new.project_id)) then
      raise exception 'You are not assigned to this project';
    end if;
    if v_proj.manager_id is null or v_proj.manager_id = new.user_id then
      new.status := 'PENDING_EXECUTIVE';
    else
      new.status := 'PENDING_MANAGER';
    end if;
  else
    new.project_id := null;
    -- someone in accounts other than the submitter must exist, otherwise straight to executive
    if cardinality(array_remove(public.accounts_emails(), v_email)) = 0 then
      new.status := 'PENDING_EXECUTIVE';
    else
      new.status := 'PENDING_ACCOUNTS';
    end if;
  end if;
  return new;
end $$;

-- 5. Approve: PM / accounts approval is final when the setting is on ----------
create or replace function public.approve_expense(p_id uuid, p_note text default null)
returns text language plpgsql security definer set search_path = public as $$
declare e expenses%rowtype; v_exec boolean := public.is_exec();
begin
  select * into e from expenses where id = p_id for update;
  if not found then raise exception 'Expense not found'; end if;

  if e.status = 'PENDING_MANAGER' then
    if v_exec or (public.is_project_manager(e.project_id) and e.user_id <> auth.uid() and public.setting_on('pm_final')) then
      update expenses set status = 'APPROVED', final_approver_id = auth.uid(), final_approved_at = now(),
             final_note = p_note, updated_at = now() where id = p_id;
    elsif public.is_project_manager(e.project_id) and e.user_id <> auth.uid() then
      update expenses set status = 'PENDING_EXECUTIVE', first_approver_id = auth.uid(), first_approved_at = now(),
             first_note = p_note, updated_at = now() where id = p_id;
    else raise exception 'You cannot approve this expense'; end if;

  elsif e.status = 'PENDING_ACCOUNTS' then
    if v_exec or (public.is_general_approver() and e.user_id <> auth.uid() and public.setting_on('accounts_final')) then
      update expenses set status = 'APPROVED', final_approver_id = auth.uid(), final_approved_at = now(),
             final_note = p_note, updated_at = now() where id = p_id;
    elsif public.is_general_approver() and e.user_id <> auth.uid() then
      update expenses set status = 'PENDING_EXECUTIVE', first_approver_id = auth.uid(), first_approved_at = now(),
             first_note = p_note, updated_at = now() where id = p_id;
    else raise exception 'You cannot approve this expense'; end if;

  elsif e.status = 'PENDING_EXECUTIVE' then
    if not v_exec then raise exception 'Only an executive can give final approval'; end if;
    update expenses set status = 'APPROVED', final_approver_id = auth.uid(), final_approved_at = now(),
           final_note = p_note, updated_at = now() where id = p_id;
  else
    raise exception 'This expense is already closed';
  end if;

  return (select status from expenses where id = p_id);
end $$;

revoke execute on function public.approve_expense(uuid, text) from anon;
revoke execute on function public.setting_on(text) from anon;
revoke execute on function public.accounts_emails() from anon;

-- Done. Next: push the new app files to GitHub (Render redeploys automatically).
