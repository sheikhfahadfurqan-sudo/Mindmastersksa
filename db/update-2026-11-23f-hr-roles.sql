-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (f): HR can assign / change roles
-- Safe to run more than once. Deletes no data.
--   • HR (and executives) can set a person's role (Employee / Executive),
--     job title, department and whether their account is active.
--   • naim@ / naem@ / info@ always stay Executive and active (database trigger).
-- =============================================================================
create or replace function public.admin_update_profile(p_id uuid, p_role text, p_title text, p_department text, p_active boolean)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_people_admin() then raise exception 'Executives only'; end if;
  if p_role not in ('EXECUTIVE','EMPLOYEE') then raise exception 'Invalid role'; end if;
  if p_id = auth.uid() and p_active is false then raise exception 'You cannot disable your own account'; end if;
  update profiles set role = p_role, title = p_title, department = p_department, active = p_active where id = p_id;
end $$;
revoke execute on function public.admin_update_profile(uuid, text, text, text, boolean) from anon;

select 'HR ROLES OK' as result;
