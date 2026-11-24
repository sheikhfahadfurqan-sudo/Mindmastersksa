-- Mind Masters — "Manager" access (24 Nov 2026)
-- ✅ Already applied 24 Nov. Safe to run again. Deletes nothing.
-- Managers (listed in Team → Manager access) can:
--   • create and edit every project, and choose its manager and team
--   • see every expense and give final approval / rejection (never on their own claims)
--   • see the employee list and basic profiles
-- Managers can NOT: delete projects, delete expenses, remove/disable people, change roles,
-- see documents or contract & salary, or change settings. Executives keep everything.
-- Safe to run more than once. Keeps all data.

insert into public.app_settings (key, value) values ('manager_emails', 'peter@mindmastersksa.com')
on conflict (key) do nothing;

create or replace function public.manager_emails()
returns text[] language sql stable security definer set search_path to 'public' as $$
  select coalesce(array_remove(string_to_array(
           regexp_replace(lower(coalesce((select value from app_settings where key = 'manager_emails'), '')), '\s', '', 'g'),
           ','), ''), '{}'::text[]);
$$;

create or replace function public.is_manager()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.active and lower(p.email) = any(public.manager_emails()));
$$;

-- Projects: managers see, create and edit all projects (delete stays executive-only)
create or replace function public.can_view_project(pid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_exec() or public.is_manager()
      or exists (select 1 from projects where id = pid and manager_id = auth.uid())
      or exists (select 1 from project_members where project_id = pid and user_id = auth.uid());
$$;

create or replace function public.can_manage_project(pid uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select public.is_exec() or public.is_manager() or exists (select 1 from projects where id = pid and manager_id = auth.uid());
$$;

drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select
  using ((select public.is_exec()) or (select public.is_manager()) or manager_id = (select auth.uid()) or public.is_project_member(id));
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert with check (public.is_exec() or public.is_manager());
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update
  using (public.is_exec() or public.is_manager()) with check (public.is_exec() or public.is_manager());

drop policy if exists members_read on public.project_members;
create policy members_read on public.project_members for select
  using ((select public.is_exec()) or (select public.is_manager()) or user_id = (select auth.uid()) or public.is_project_manager(project_id));
drop policy if exists members_insert on public.project_members;
create policy members_insert on public.project_members for insert with check ((select public.is_exec()) or (select public.is_manager()));
drop policy if exists members_update on public.project_members;
create policy members_update on public.project_members for update
  using ((select public.is_exec()) or (select public.is_manager())) with check ((select public.is_exec()) or (select public.is_manager()));
drop policy if exists members_delete on public.project_members;
create policy members_delete on public.project_members for delete using ((select public.is_exec()) or (select public.is_manager()));

-- Expenses: managers see all and can give final approval (not on their own)
drop policy if exists expenses_read on public.expenses;
create policy expenses_read on public.expenses for select using (
  user_id = (select auth.uid()) or (select public.is_exec()) or (select public.is_manager())
  or (project_id is not null and public.is_project_manager(project_id))
  or (expense_type = 'GENERAL' and (select public.is_general_approver())));

create or replace function public.approve_expense(p_id uuid, p_note text default null)
returns text language plpgsql security definer set search_path to 'public' as $function$
declare e expenses%rowtype; v_exec boolean;
begin
  select * into e from expenses where id = p_id for update;
  if not found then raise exception 'Expense not found'; end if;
  v_exec := public.is_exec() or (public.is_manager() and e.user_id <> auth.uid());

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
end $function$;

create or replace function public.reject_expense(p_id uuid, p_reason text)
returns text language plpgsql security definer set search_path to 'public' as $function$
declare e expenses%rowtype; v_ok boolean;
begin
  if p_reason is null or length(trim(p_reason)) = 0 then raise exception 'A reason is required'; end if;
  select * into e from expenses where id = p_id for update;
  if not found then raise exception 'Expense not found'; end if;
  v_ok := public.is_exec()
       or (public.is_manager() and e.user_id <> auth.uid())
       or (e.status = 'PENDING_MANAGER'  and public.is_project_manager(e.project_id) and e.user_id <> auth.uid())
       or (e.status = 'PENDING_ACCOUNTS' and public.is_general_approver()          and e.user_id <> auth.uid());
  if e.status not in ('PENDING_MANAGER','PENDING_ACCOUNTS','PENDING_EXECUTIVE') then
    raise exception 'This expense is already closed';
  end if;
  if not v_ok then raise exception 'You cannot reject this expense'; end if;
  update expenses set status = 'REJECTED', rejected_by = auth.uid(), rejected_at = now(),
         rejection_reason = trim(p_reason), updated_at = now() where id = p_id;
  return 'REJECTED';
end $function$;

-- Let managers submit expenses against any active project
create or replace function public.route_new_expense()
returns trigger language plpgsql security definer set search_path to 'public' as $function$
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
    if not (public.is_exec() or public.is_manager() or v_proj.manager_id = new.user_id or public.is_project_member(new.project_id)) then
      raise exception 'You are not assigned to this project';
    end if;
    if v_proj.manager_id is null or v_proj.manager_id = new.user_id then
      new.status := 'PENDING_EXECUTIVE';
    else
      new.status := 'PENDING_MANAGER';
    end if;
  else
    new.project_id := null;
    if cardinality(array_remove(public.accounts_emails(), v_email)) = 0 then
      new.status := 'PENDING_EXECUTIVE';
    else
      new.status := 'PENDING_ACCOUNTS';
    end if;
  end if;
  return new;
end $function$;

-- ---------- Match the 23 Nov (j) and (k) updates ------------------------------
-- New functions locked to signed-in staff; rules scoped "to authenticated".
revoke execute on function public.manager_emails() from public, anon;
revoke execute on function public.is_manager() from public, anon;
grant execute on function public.manager_emails() to authenticated;
grant execute on function public.is_manager() to authenticated;

drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select to authenticated
  using ((select public.is_exec()) or (select public.is_manager()) or manager_id = (select auth.uid()) or public.is_project_member(id));
drop policy if exists projects_insert on public.projects;
create policy projects_insert on public.projects for insert to authenticated with check ((select public.is_exec()) or (select public.is_manager()));
drop policy if exists projects_update on public.projects;
create policy projects_update on public.projects for update to authenticated
  using ((select public.is_exec()) or (select public.is_manager())) with check ((select public.is_exec()) or (select public.is_manager()));

drop policy if exists members_read on public.project_members;
create policy members_read on public.project_members for select to authenticated
  using ((select public.is_exec()) or (select public.is_manager()) or user_id = (select auth.uid()) or public.is_project_manager(project_id));
drop policy if exists members_insert on public.project_members;
create policy members_insert on public.project_members for insert to authenticated with check ((select public.is_exec()) or (select public.is_manager()));
drop policy if exists members_update on public.project_members;
create policy members_update on public.project_members for update to authenticated
  using ((select public.is_exec()) or (select public.is_manager())) with check ((select public.is_exec()) or (select public.is_manager()));
drop policy if exists members_delete on public.project_members;
create policy members_delete on public.project_members for delete to authenticated using ((select public.is_exec()) or (select public.is_manager()));

drop policy if exists expenses_read on public.expenses;
create policy expenses_read on public.expenses for select to authenticated using (
  user_id = (select auth.uid()) or (select public.is_exec()) or (select public.is_manager())
  or (project_id is not null and public.is_project_manager(project_id))
  or (expense_type = 'GENERAL' and (select public.is_general_approver())));

select 'MANAGER UPDATE OK' as result;
