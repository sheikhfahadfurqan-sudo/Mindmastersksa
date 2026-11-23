-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (i): HR can add people without a
-- company email (Employees page). Only executives can remove them.
-- ✅ Already applied 23 Nov. Safe to run again. Deletes nothing.
-- =============================================================================
drop policy if exists invited_exec_all on public.invited_users;
drop policy if exists invited_read on public.invited_users;
drop policy if exists invited_add on public.invited_users;
drop policy if exists invited_change on public.invited_users;
drop policy if exists invited_remove on public.invited_users;
create policy invited_read   on public.invited_users for select to authenticated using (public.is_exec() or public.is_hr());
create policy invited_add    on public.invited_users for insert to authenticated with check (public.is_exec() or public.is_hr());
create policy invited_change on public.invited_users for update to authenticated using (public.is_exec()) with check (public.is_exec());
create policy invited_remove on public.invited_users for delete to authenticated using (public.is_exec());

select 'HR-ADD-PEOPLE UPDATE OK' as result;
