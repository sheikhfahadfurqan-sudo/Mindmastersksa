-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (e): HR access
-- Safe to run more than once. Deletes no data.
--   • HR team = comma-separated emails in app_settings 'hr_emails' (Suhail for now).
--   • HR can see and edit every employee's profile details, documents,
--     document copies, photos, and contract & salary.
--   • HR cannot change roles, disable accounts or approve expenses
--     (beyond any accounts-team role they already have).
-- =============================================================================

insert into public.app_settings (key, value) values ('hr_emails', 'suhail@mindmastersksa.com')
on conflict (key) do nothing;

create or replace function public.hr_emails() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(array_remove(string_to_array(
           regexp_replace(lower(coalesce((select value from app_settings where key = 'hr_emails'), '')), '\s', '', 'g'),
           ','), ''), '{}'::text[]);
$$;

create or replace function public.is_hr() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles p where p.id = auth.uid() and p.active and lower(p.email) = any(public.hr_emails()));
$$;

create or replace function public.is_people_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_exec() or public.is_hr();
$$;
revoke execute on function public.hr_emails() from anon;

-- Executives or HR update anyone's details (role / active stay executive-only)
create or replace function public.admin_update_person(p_id uuid, p jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_people_admin() then raise exception 'Executives only'; end if;
  update profiles set
    full_name         = coalesce(nullif(trim(p->>'full_name'), ''), full_name),
    full_name_ar      = case when p ? 'full_name_ar'      then nullif(trim(p->>'full_name_ar'), '')      else full_name_ar end,
    phone             = case when p ? 'phone'             then nullif(trim(p->>'phone'), '')             else phone end,
    nationality       = case when p ? 'nationality'       then nullif(trim(p->>'nationality'), '')       else nationality end,
    emergency_contact = case when p ? 'emergency_contact' then nullif(trim(p->>'emergency_contact'), '') else emergency_contact end,
    emergency_phone   = case when p ? 'emergency_phone'   then nullif(trim(p->>'emergency_phone'), '')   else emergency_phone end,
    photo_path        = case when p ? 'photo_path'        then nullif(p->>'photo_path', '')              else photo_path end,
    join_date         = case when p ? 'join_date'         then nullif(p->>'join_date', '')::date         else join_date end,
    title             = case when p ? 'title'             then nullif(trim(p->>'title'), '')             else title end,
    department        = case when p ? 'department'        then nullif(trim(p->>'department'), '')        else department end
  where id = p_id;
end $$;
revoke execute on function public.admin_update_person(uuid, jsonb) from anon;

-- Documents, contract & salary, copies: executives + HR
drop policy if exists edocs_rw on public.employee_docs;
create policy edocs_rw on public.employee_docs for all to authenticated
  using (user_id = auth.uid() or public.is_people_admin())
  with check (user_id = auth.uid() or public.is_people_admin());

drop policy if exists ehr_exec on public.employee_hr;
create policy ehr_exec on public.employee_hr for all to authenticated
  using (public.is_people_admin()) with check (public.is_people_admin());

drop policy if exists efiles_read   on public.employee_files;
drop policy if exists efiles_insert on public.employee_files;
drop policy if exists efiles_delete on public.employee_files;
create policy efiles_read on public.employee_files for select to authenticated
  using (public.is_people_admin() or (user_id = auth.uid() and kind <> 'CONTRACT'));
create policy efiles_insert on public.employee_files for insert to authenticated
  with check (uploaded_by = auth.uid() and path like user_id::text || '/%'
              and (public.is_people_admin() or (user_id = auth.uid() and kind <> 'CONTRACT')));
create policy efiles_delete on public.employee_files for delete to authenticated
  using (public.is_people_admin() or (user_id = auth.uid() and kind <> 'CONTRACT'));

drop policy if exists edoc_read   on storage.objects;
drop policy if exists edoc_upload on storage.objects;
drop policy if exists edoc_delete on storage.objects;
create policy edoc_read on storage.objects for select to authenticated
  using (bucket_id = 'employee-docs' and (public.is_people_admin() or exists (
    select 1 from public.employee_files f where f.path = storage.objects.name and f.user_id = auth.uid() and f.kind <> 'CONTRACT')));
create policy edoc_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'employee-docs' and (public.is_people_admin() or split_part(name, '/', 1) = auth.uid()::text));
create policy edoc_delete on storage.objects for delete to authenticated
  using (bucket_id = 'employee-docs' and (public.is_people_admin() or exists (
    select 1 from public.employee_files f where f.path = storage.objects.name and f.user_id = auth.uid() and f.kind <> 'CONTRACT')));

drop policy if exists avatar_upload on storage.objects;
drop policy if exists avatar_delete on storage.objects;
create policy avatar_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (public.is_people_admin() or split_part(name, '/', 1) = auth.uid()::text));
create policy avatar_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (public.is_people_admin() or split_part(name, '/', 1) = auth.uid()::text));

select 'HR ACCESS OK' as result,
  (select value from public.app_settings where key = 'hr_emails') as hr_team,
  (select count(*) from public.profiles where lower(email) = any(public.hr_emails())) as hr_signed_in;
