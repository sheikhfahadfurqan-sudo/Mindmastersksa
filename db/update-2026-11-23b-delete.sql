-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (b): executives can delete
-- Safe to run more than once. Deletes no data by itself.
--   • Executives (naim@ / info@) may delete any expense and its receipt file.
--   • Executives may delete a project only if it has no expenses
--     (the database already blocks deleting a project that has expenses).
-- =============================================================================

drop policy if exists expenses_exec_delete on public.expenses;
create policy expenses_exec_delete on public.expenses for delete to authenticated
  using (public.is_exec());

drop policy if exists receipts_exec_delete on storage.objects;
create policy receipts_exec_delete on storage.objects for delete to authenticated
  using (bucket_id = 'receipts' and public.is_exec());

-- projects_delete (executives only) already exists from launch.sql; re-create to be sure
drop policy if exists projects_delete on public.projects;
create policy projects_delete on public.projects for delete to authenticated
  using (public.is_exec());

select 'DELETE UPDATE OK' as result;
