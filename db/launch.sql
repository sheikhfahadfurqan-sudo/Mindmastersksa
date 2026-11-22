-- =============================================================================
-- MIND MASTERS KSA — LAUNCH DATABASE SCRIPT
-- FIRST-TIME SETUP ONLY. Run ONCE in Supabase → SQL Editor → New query → paste all → Run.
--
-- ⚠ This DELETES the old test tables (profiles, expenses, payroll, projects,
--   tasks, clients, documents, leave_requests, notifications) and all their
--   dummy data, then creates the clean production structure.
--   It refuses to run if any expenses or projects exist (safety lock below).
--
-- Approval routing (enforced inside the database, not just the app):
--   • Project expense  → Project Manager of that project → Executive (Naim)
--   • General expense  → General approver (Suhail for now) → Executive (Naim)
--   • If the submitter IS the first approver (or the project has no manager),
--     the claim goes straight to the Executive.
--   • Executives (naim@ / info@) may approve or reject at any stage.
-- =============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- SAFETY LOCK: refuse to run once the app holds real expenses or projects.
-- This script is for the first setup only — it must never wipe live data.
-- ---------------------------------------------------------------------------
do $$
declare v_has boolean := false; v_more boolean;
begin
  if to_regclass('public.expenses') is not null then
    execute 'select exists (select 1 from public.expenses)' into v_more; v_has := v_has or v_more;
  end if;
  if to_regclass('public.projects') is not null then
    execute 'select exists (select 1 from public.projects)' into v_more; v_has := v_has or v_more;
  end if;
  if v_has then
    raise exception 'STOPPED — the app already has real expenses or projects. This first-time setup script would delete them, so nothing was changed.';
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 0. Remove old test structure + dummy data
-- ---------------------------------------------------------------------------
drop trigger if exists on_auth_user_created on auth.users;
drop view  if exists public.users cascade;
drop table if exists public.expenses, public.payroll, public.notifications,
  public.leave_requests, public.clients, public.tasks, public.documents,
  public.project_members, public.projects, public.app_settings,
  public.profiles cascade;

-- ---------------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null check (lower(email) like '%@mindmastersksa.com'),
  full_name    text not null default '',
  full_name_ar text,
  phone        text,
  role         text not null default 'EMPLOYEE' check (role in ('EXECUTIVE','EMPLOYEE')),
  title        text,
  department   text,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.app_settings (
  key   text primary key,
  value text not null
);
insert into public.app_settings (key, value) values
  ('general_approver_email', 'suhail@mindmastersksa.com');

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  code        text,
  name        text not null,
  name_ar     text,
  client      text,
  description text,
  status      text not null default 'ACTIVE' check (status in ('ACTIVE','ON_HOLD','CLOSED')),
  budget_sar  numeric(14,2) not null default 0 check (budget_sar >= 0),
  manager_id  uuid,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now(),
  constraint projects_manager_fk foreign key (manager_id) references public.profiles(id) on delete set null
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (project_id, user_id)
);

create table public.expenses (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid(),
  expense_type       text not null check (expense_type in ('PROJECT','GENERAL')),
  project_id         uuid,
  category           text not null default 'OTHER' check (category in
                       ('FOOD','GROCERIES','TRANSPORT','FUEL','SUPPLIES','EQUIPMENT','MATERIALS','ACCOMMODATION','OTHER')),
  title              text not null check (length(trim(title)) > 0),
  amount_sar         numeric(12,2) not null check (amount_sar > 0),
  expense_date       date not null default current_date,
  vendor             text,
  notes              text,
  receipt_path       text not null,
  status             text not null default 'PENDING_EXECUTIVE' check (status in
                       ('PENDING_MANAGER','PENDING_ACCOUNTS','PENDING_EXECUTIVE','APPROVED','REJECTED')),
  first_approver_id  uuid,
  first_approved_at  timestamptz,
  first_note         text,
  final_approver_id  uuid,
  final_approved_at  timestamptz,
  final_note         text,
  rejected_by        uuid,
  rejected_at        timestamptz,
  rejection_reason   text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  constraint expenses_user_fk    foreign key (user_id)    references public.profiles(id) on delete cascade,
  constraint expenses_project_fk foreign key (project_id) references public.projects(id) on delete restrict,
  constraint expenses_type_project check ((expense_type = 'PROJECT') = (project_id is not null))
);
create index expenses_user_idx    on public.expenses(user_id);
create index expenses_project_idx on public.expenses(project_id);
create index expenses_status_idx  on public.expenses(status);

-- ---------------------------------------------------------------------------
-- 2. Helper functions (security definer = can read past RLS, no recursion)
-- ---------------------------------------------------------------------------
create or replace function public.is_exec() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'EXECUTIVE' and active);
$$;

create or replace function public.is_general_approver() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p, app_settings s
    where p.id = auth.uid() and p.active
      and s.key = 'general_approver_email' and lower(p.email) = lower(trim(s.value)));
$$;

create or replace function public.is_project_manager(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects where id = pid and manager_id = auth.uid());
$$;

create or replace function public.is_project_member(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from project_members where project_id = pid and user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- 3. New sign-in → profile (blocks anyone outside @mindmastersksa.com)
-- ---------------------------------------------------------------------------
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
          case when v_email in ('naim@mindmastersksa.com','info@mindmastersksa.com') then 'EXECUTIVE' else 'EMPLOYEE' end)
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill anyone who already signed in during testing
insert into public.profiles (id, email, full_name, role)
select u.id, lower(u.email),
       coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(lower(u.email), '@', 1)),
       case when lower(u.email) in ('naim@mindmastersksa.com','info@mindmastersksa.com') then 'EXECUTIVE' else 'EMPLOYEE' end
from auth.users u
where lower(u.email) like '%@mindmastersksa.com'
on conflict (id) do nothing;

-- Executives can never be demoted or disabled
create or replace function public.protect_executives() returns trigger
language plpgsql as $$
begin
  if lower(new.email) in ('naim@mindmastersksa.com','info@mindmastersksa.com') then
    new.role := 'EXECUTIVE';
    new.active := true;
  end if;
  return new;
end $$;
create trigger profiles_protect_exec before insert or update on public.profiles
  for each row execute function public.protect_executives();

-- ---------------------------------------------------------------------------
-- 4. Expense routing on submit
-- ---------------------------------------------------------------------------
create or replace function public.route_new_expense() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_active  boolean;
  v_proj    projects%rowtype;
  v_gen     text;
  v_email   text;
begin
  new.user_id := auth.uid();
  select active, lower(email) into v_active, v_email from profiles where id = new.user_id;
  if v_active is not true then raise exception 'Your account is not active'; end if;
  if new.receipt_path is null or new.receipt_path not like (new.user_id::text || '/%') then
    raise exception 'A receipt upload is required';
  end if;

  -- reset approval fields — clients cannot pre-fill them
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
    select lower(trim(value)) into v_gen from app_settings where key = 'general_approver_email';
    if v_gen is null or v_gen = v_email then
      new.status := 'PENDING_EXECUTIVE';
    else
      new.status := 'PENDING_ACCOUNTS';
    end if;
  end if;
  return new;
end $$;
create trigger expenses_route before insert on public.expenses
  for each row execute function public.route_new_expense();

-- ---------------------------------------------------------------------------
-- 5. Approve / reject (the ONLY way a status can change)
-- ---------------------------------------------------------------------------
create or replace function public.approve_expense(p_id uuid, p_note text default null)
returns text language plpgsql security definer set search_path = public as $$
declare e expenses%rowtype; v_exec boolean := public.is_exec();
begin
  select * into e from expenses where id = p_id for update;
  if not found then raise exception 'Expense not found'; end if;

  if e.status = 'PENDING_MANAGER' then
    if v_exec then
      update expenses set status = 'APPROVED', final_approver_id = auth.uid(), final_approved_at = now(),
             final_note = p_note, updated_at = now() where id = p_id;
    elsif public.is_project_manager(e.project_id) and e.user_id <> auth.uid() then
      update expenses set status = 'PENDING_EXECUTIVE', first_approver_id = auth.uid(), first_approved_at = now(),
             first_note = p_note, updated_at = now() where id = p_id;
    else raise exception 'You cannot approve this expense'; end if;

  elsif e.status = 'PENDING_ACCOUNTS' then
    if v_exec then
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

create or replace function public.reject_expense(p_id uuid, p_reason text)
returns text language plpgsql security definer set search_path = public as $$
declare e expenses%rowtype; v_ok boolean;
begin
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'A reason is required'; end if;
  select * into e from expenses where id = p_id for update;
  if not found then raise exception 'Expense not found'; end if;
  v_ok := public.is_exec()
       or (e.status = 'PENDING_MANAGER'  and public.is_project_manager(e.project_id) and e.user_id <> auth.uid())
       or (e.status = 'PENDING_ACCOUNTS' and public.is_general_approver()          and e.user_id <> auth.uid());
  if e.status not in ('PENDING_MANAGER','PENDING_ACCOUNTS','PENDING_EXECUTIVE') then
    raise exception 'This expense is already closed';
  end if;
  if not v_ok then raise exception 'You cannot reject this expense'; end if;
  update expenses set status = 'REJECTED', rejected_by = auth.uid(), rejected_at = now(),
         rejection_reason = trim(p_reason), updated_at = now() where id = p_id;
  return 'REJECTED';
end $$;

-- Executives manage people
create or replace function public.admin_update_profile(p_id uuid, p_role text, p_title text, p_department text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_exec() then raise exception 'Executives only'; end if;
  if p_role not in ('EXECUTIVE','EMPLOYEE') then raise exception 'Invalid role'; end if;
  update profiles set role = p_role, title = p_title, department = p_department, active = p_active where id = p_id;
end $$;

revoke execute on function public.approve_expense(uuid, text)  from anon;
revoke execute on function public.reject_expense(uuid, text)   from anon;
revoke execute on function public.admin_update_profile(uuid, text, text, text, boolean) from anon;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.app_settings    enable row level security;
alter table public.projects        enable row level security;
alter table public.project_members enable row level security;
alter table public.expenses        enable row level security;

-- profiles: every signed-in colleague can see names; people edit only their own name/phone
create policy profiles_read on public.profiles for select to authenticated using (true);
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated, anon;
grant  update (full_name, full_name_ar, phone) on public.profiles to authenticated;

-- settings: readable by staff, changeable by executives
create policy settings_read  on public.app_settings for select to authenticated using (true);
create policy settings_write on public.app_settings for update to authenticated
  using (public.is_exec()) with check (public.is_exec());

-- projects: executives see all; others see projects they manage or are on
create policy projects_read on public.projects for select to authenticated
  using (public.is_exec() or manager_id = auth.uid() or public.is_project_member(id));
create policy projects_insert on public.projects for insert to authenticated with check (public.is_exec());
create policy projects_update on public.projects for update to authenticated using (public.is_exec()) with check (public.is_exec());
create policy projects_delete on public.projects for delete to authenticated using (public.is_exec());

create policy members_read on public.project_members for select to authenticated
  using (public.is_exec() or user_id = auth.uid() or public.is_project_manager(project_id));
create policy members_write on public.project_members for all to authenticated
  using (public.is_exec()) with check (public.is_exec());

-- expenses: own claims; managers see their projects; general approver sees general claims; execs see all
create policy expenses_read on public.expenses for select to authenticated using (
  user_id = auth.uid()
  or public.is_exec()
  or (project_id is not null and public.is_project_manager(project_id))
  or (expense_type = 'GENERAL' and public.is_general_approver()));
create policy expenses_insert on public.expenses for insert to authenticated with check (user_id = auth.uid());
-- employee may withdraw a claim nobody has approved yet
create policy expenses_withdraw on public.expenses for delete to authenticated using (
  user_id = auth.uid() and status in ('PENDING_MANAGER','PENDING_ACCOUNTS')
  and first_approver_id is null);
-- (no UPDATE policy: status only changes through approve_expense / reject_expense)

-- ---------------------------------------------------------------------------
-- 7. Private receipts bucket (10 MB, images + PDF)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('receipts', 'receipts', false, 10485760,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists receipts_upload on storage.objects;
drop policy if exists receipts_read   on storage.objects;
drop policy if exists receipts_delete on storage.objects;

create policy receipts_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
-- you can open a receipt if it is yours, or if you can see the expense it belongs to
create policy receipts_read on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.expenses e where e.receipt_path = storage.objects.name)));
create policy receipts_delete on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

-- Done. Next: Naim and info@ just sign in with Microsoft — they become Executives automatically.
