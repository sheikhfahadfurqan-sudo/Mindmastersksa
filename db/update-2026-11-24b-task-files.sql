-- Mind Masters — files attached to project tasks (24 Nov 2026)
-- ✅ Already applied 24 Nov. Safe to run again. Deletes nothing.
-- A project file can belong to a task. Anyone on the project can attach files to its tasks.
-- If a task is deleted, its files stay in the project's Files tab.

alter table public.project_files add column if not exists task_id uuid references public.project_tasks(id) on delete set null;
create index if not exists project_files_task_id_idx on public.project_files (task_id);

-- Same rule as before, plus: an attached task must belong to the same project.
drop policy if exists pf_insert on public.project_files;
create policy pf_insert on public.project_files for insert to authenticated
  with check (uploaded_by = (select auth.uid()) and public.can_view_project(project_id)
              and path like project_id::text || '/%'
              and (task_id is null or exists (select 1 from public.project_tasks t where t.id = task_id and t.project_id = project_files.project_id)));

select 'TASK FILES UPDATE OK' as result;
