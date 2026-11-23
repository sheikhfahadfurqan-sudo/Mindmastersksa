-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (h): executives can remove a person
-- Safe to run more than once. Deletes nothing by itself.
--
-- Team → click a person → Remove:
--   • Personal-email person with no expenses, site updates or project files
--     → the account is deleted completely (profile, documents, HR record,
--     project memberships, invite).
--   • Has history, or has a @mindmastersksa.com account → access is switched
--     off and the person is hidden from the lists; expenses and approvals stay
--     in the records. (A deleted company account could just sign in again with
--     Microsoft, so those are always kept switched off.) Restore brings them back.
-- Naim, naem@ and info@ can never be removed, and nobody can remove themselves.
-- =============================================================================

alter table public.profiles add column if not exists removed_at timestamptz;

create or replace function public.admin_remove_person(p_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  p profiles%rowtype;
  v_keep boolean;
  v_files text[];
begin
  if not public.is_exec() then raise exception 'Executives only'; end if;
  if p_id = auth.uid() then raise exception 'You cannot remove yourself'; end if;
  select * into p from profiles where id = p_id;
  if not found then raise exception 'Person not found'; end if;
  if lower(p.email) in ('naim@mindmastersksa.com','naem@mindmastersksa.com','info@mindmastersksa.com') then
    raise exception 'Executive accounts cannot be removed';
  end if;

  delete from invited_users where email = lower(p.email);

  v_keep := lower(p.email) like '%@mindmastersksa.com'
            or exists (select 1 from expenses where user_id = p_id)
            or exists (select 1 from project_updates where author_id = p_id)
            or exists (select 1 from project_files where uploaded_by = p_id);

  if v_keep then
    update profiles set active = false, removed_at = now() where id = p_id;
    update projects set manager_id = null where manager_id = p_id;
    delete from project_members where user_id = p_id;
    update project_tasks set assignee_id = null where assignee_id = p_id and status <> 'DONE';
    return jsonb_build_object('result', 'ARCHIVED');
  end if;

  -- storage files to clean up from the app (rows below disappear with the account)
  select coalesce(array_agg(path), '{}') into v_files from employee_files where user_id = p_id;

  delete from auth.users where id = p_id;   -- cascades to profile and everything linked
  delete from profiles where id = p_id;     -- in case the profile had no login

  return jsonb_build_object('result', 'DELETED', 'avatar', p.photo_path, 'doc_files', to_jsonb(v_files));
end $$;

create or replace function public.admin_restore_person(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_exec() then raise exception 'Executives only'; end if;
  update profiles set active = true, removed_at = null where id = p_id;
end $$;

revoke execute on function public.admin_remove_person(uuid) from public, anon;
revoke execute on function public.admin_restore_person(uuid) from public, anon;
grant execute on function public.admin_remove_person(uuid) to authenticated;
grant execute on function public.admin_restore_person(uuid) to authenticated;

select 'REMOVE-PERSON UPDATE OK' as result;
