-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (k): ready for many users.
--  * Access rules check "who is signed in" once per query instead of once per
--    row (same rules, much faster on big tables).
--  * Overlapping access rules merged, so each request runs one check.
--  * Indexes on every link between tables.
--  * Removed the unused, empty client_documents table.
--  * protect_executives() uses a fixed search path.
-- ✅ Already applied 23 Nov. Safe to run again. Deletes no data.
-- =============================================================================

-- ---------- Access rules (same meaning as before) ----------------------------
drop policy if exists edocs_rw on public.employee_docs;
create policy edocs_rw on public.employee_docs for all to authenticated
  using      (user_id = (select auth.uid()) or (select public.is_people_admin()))
  with check (user_id = (select auth.uid()) or (select public.is_people_admin()));

drop policy if exists efiles_read   on public.employee_files;
drop policy if exists efiles_insert on public.employee_files;
drop policy if exists efiles_delete on public.employee_files;
create policy efiles_read on public.employee_files for select to authenticated
  using ((select public.is_people_admin()) or (user_id = (select auth.uid()) and kind <> 'CONTRACT'));
create policy efiles_insert on public.employee_files for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and path like user_id::text || '/%'
              and ((select public.is_people_admin()) or (user_id = (select auth.uid()) and kind <> 'CONTRACT')));
create policy efiles_delete on public.employee_files for delete to authenticated
  using ((select public.is_people_admin()) or (user_id = (select auth.uid()) and kind <> 'CONTRACT'));

drop policy if exists expenses_read        on public.expenses;
drop policy if exists expenses_insert      on public.expenses;
drop policy if exists expenses_withdraw    on public.expenses;
drop policy if exists expenses_exec_delete on public.expenses;
drop policy if exists expenses_delete      on public.expenses;
create policy expenses_read on public.expenses for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_exec())
         or (project_id is not null and public.is_project_manager(project_id))
         or (expense_type = 'GENERAL' and (select public.is_general_approver())));
create policy expenses_insert on public.expenses for insert to authenticated
  with check (user_id = (select auth.uid()));
-- Executives can delete any expense; staff can withdraw their own before anyone approved it.
create policy expenses_delete on public.expenses for delete to authenticated
  using ((select public.is_exec())
         or (user_id = (select auth.uid()) and status in ('PENDING_MANAGER','PENDING_ACCOUNTS') and first_approver_id is null));

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists pf_insert on public.project_files;
drop policy if exists pf_delete on public.project_files;
create policy pf_insert on public.project_files for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and public.can_view_project(project_id)
              and path like project_id::text || '/%');
create policy pf_delete on public.project_files for delete to authenticated
  using (uploaded_by = (select auth.uid()) or public.can_manage_project(project_id));

drop policy if exists members_read   on public.project_members;
drop policy if exists members_write  on public.project_members;
drop policy if exists members_insert on public.project_members;
drop policy if exists members_update on public.project_members;
drop policy if exists members_delete on public.project_members;
create policy members_read on public.project_members for select to authenticated
  using ((select public.is_exec()) or user_id = (select auth.uid()) or public.is_project_manager(project_id));
create policy members_insert on public.project_members for insert to authenticated
  with check ((select public.is_exec()));
create policy members_update on public.project_members for update to authenticated
  using ((select public.is_exec())) with check ((select public.is_exec()));
create policy members_delete on public.project_members for delete to authenticated
  using ((select public.is_exec()));

drop policy if exists pt_write  on public.project_tasks;
drop policy if exists pt_insert on public.project_tasks;
drop policy if exists pt_update on public.project_tasks;
drop policy if exists pt_delete on public.project_tasks;
create policy pt_insert on public.project_tasks for insert to authenticated
  with check (public.can_manage_project(project_id));
create policy pt_update on public.project_tasks for update to authenticated
  using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));
create policy pt_delete on public.project_tasks for delete to authenticated
  using (public.can_manage_project(project_id));

drop policy if exists pu_insert on public.project_updates;
drop policy if exists pu_delete on public.project_updates;
create policy pu_insert on public.project_updates for insert to authenticated
  with check (author_id = (select auth.uid()) and public.can_view_project(project_id));
create policy pu_delete on public.project_updates for delete to authenticated
  using (author_id = (select auth.uid()) or public.can_manage_project(project_id));

drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select to authenticated
  using ((select public.is_exec()) or manager_id = (select auth.uid()) or public.is_project_member(id));

-- ---------- Indexes on links between tables ----------------------------------
create index if not exists invited_users_invited_by_idx    on public.invited_users (invited_by);
create index if not exists project_files_update_id_idx     on public.project_files (update_id);
create index if not exists project_files_uploaded_by_idx   on public.project_files (uploaded_by);
create index if not exists project_members_user_id_idx     on public.project_members (user_id);
create index if not exists project_tasks_assignee_id_idx   on public.project_tasks (assignee_id);
create index if not exists project_updates_author_id_idx   on public.project_updates (author_id);
create index if not exists projects_manager_id_idx         on public.projects (manager_id);

-- ---------- Tidy-ups ----------------------------------------------------------
drop table if exists public.client_documents;
alter function public.protect_executives() set search_path = public;

select 'SCALE UPDATE OK' as result;
