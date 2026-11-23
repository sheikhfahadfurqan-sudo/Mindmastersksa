-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (d): employee profiles & documents
-- Safe to run more than once. Deletes no data.
--   • Profile photo + personal details (nationality, joining date, emergency contact)
--   • Iqama, passport, driving licence, medical insurance: numbers, expiry dates, copies
--   • Employment contract & salary — EXECUTIVES ONLY
-- Privacy:
--   • Each employee sees and edits only their own documents.
--   • Executives (naim@ / info@) see and edit everyone's.
--   • Other employees see only a colleague's name and photo.
--   • Contract & salary are never visible to the employee or anyone but executives.
-- =============================================================================

-- 1. Profile additions -------------------------------------------------------------
alter table public.profiles
  add column if not exists photo_path        text,
  add column if not exists nationality       text,
  add column if not exists join_date         date,
  add column if not exists emergency_contact text,
  add column if not exists emergency_phone   text;

-- employees may update these on their own profile (join_date is executive-only)
revoke update on public.profiles from authenticated, anon;
grant update (full_name, full_name_ar, phone, photo_path, nationality, emergency_contact, emergency_phone)
  on public.profiles to authenticated;

-- executives update anyone's extra details
create or replace function public.admin_update_person(p_id uuid, p jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_exec() then raise exception 'Executives only'; end if;
  update profiles set
    full_name         = coalesce(nullif(trim(p->>'full_name'), ''), full_name),
    full_name_ar      = case when p ? 'full_name_ar'      then nullif(trim(p->>'full_name_ar'), '')      else full_name_ar end,
    phone             = case when p ? 'phone'             then nullif(trim(p->>'phone'), '')             else phone end,
    nationality       = case when p ? 'nationality'       then nullif(trim(p->>'nationality'), '')       else nationality end,
    emergency_contact = case when p ? 'emergency_contact' then nullif(trim(p->>'emergency_contact'), '') else emergency_contact end,
    emergency_phone   = case when p ? 'emergency_phone'   then nullif(trim(p->>'emergency_phone'), '')   else emergency_phone end,
    photo_path        = case when p ? 'photo_path'        then nullif(p->>'photo_path', '')              else photo_path end,
    join_date         = case when p ? 'join_date'         then nullif(p->>'join_date', '')::date         else join_date end
  where id = p_id;
end $$;
revoke execute on function public.admin_update_person(uuid, jsonb) from anon;

-- 2. Documents (numbers + expiry dates) ------------------------------------------
create table if not exists public.employee_docs (
  user_id             uuid primary key references public.profiles(id) on delete cascade,
  iqama_no            text,
  iqama_expiry        date,
  passport_no         text,
  passport_expiry     date,
  license_no          text,
  license_expiry      date,
  insurer             text,
  insurance_policy_no text,
  insurance_class     text,
  insurance_expiry    date,
  updated_at          timestamptz not null default now(),
  updated_by          uuid default auth.uid()
);
alter table public.employee_docs enable row level security;
drop policy if exists edocs_rw on public.employee_docs;
create policy edocs_rw on public.employee_docs for all to authenticated
  using (user_id = auth.uid() or public.is_exec())
  with check (user_id = auth.uid() or public.is_exec());
grant select, insert, update, delete on public.employee_docs to authenticated;

-- 3. Contract & salary — executives only ----------------------------------------
create table if not exists public.employee_hr (
  user_id              uuid primary key references public.profiles(id) on delete cascade,
  contract_type        text,
  contract_start       date,
  contract_end         date,
  basic_salary         numeric(12,2) check (basic_salary >= 0),
  housing_allowance    numeric(12,2) check (housing_allowance >= 0),
  transport_allowance  numeric(12,2) check (transport_allowance >= 0),
  other_allowance      numeric(12,2) check (other_allowance >= 0),
  notes                text,
  updated_at           timestamptz not null default now()
);
alter table public.employee_hr enable row level security;
drop policy if exists ehr_exec on public.employee_hr;
create policy ehr_exec on public.employee_hr for all to authenticated
  using (public.is_exec()) with check (public.is_exec());
grant select, insert, update, delete on public.employee_hr to authenticated;

-- 4. Document copies ---------------------------------------------------------------
create table if not exists public.employee_files (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  kind        text not null check (kind in ('IQAMA','PASSPORT','LICENSE','INSURANCE','CONTRACT','OTHER')),
  name        text not null,
  path        text not null unique,
  mime        text,
  size_bytes  bigint,
  uploaded_by uuid not null default auth.uid(),
  created_at  timestamptz not null default now()
);
create index if not exists employee_files_user_idx on public.employee_files(user_id);
alter table public.employee_files enable row level security;
drop policy if exists efiles_read   on public.employee_files;
drop policy if exists efiles_insert on public.employee_files;
drop policy if exists efiles_delete on public.employee_files;
create policy efiles_read on public.employee_files for select to authenticated
  using (public.is_exec() or (user_id = auth.uid() and kind <> 'CONTRACT'));
create policy efiles_insert on public.employee_files for insert to authenticated
  with check (uploaded_by = auth.uid() and path like user_id::text || '/%'
              and (public.is_exec() or (user_id = auth.uid() and kind <> 'CONTRACT')));
create policy efiles_delete on public.employee_files for delete to authenticated
  using (public.is_exec() or (user_id = auth.uid() and kind <> 'CONTRACT'));
grant select, insert, delete on public.employee_files to authenticated;

-- 5. Private storage ----------------------------------------------------------------
-- employee-docs: "<user id>/<file>" — owner or executives only
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('employee-docs', 'employee-docs', false, 10485760,
        array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- avatars: any signed-in colleague can see photos; you change your own (executives anyone's)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists edoc_read   on storage.objects;
drop policy if exists edoc_upload on storage.objects;
drop policy if exists edoc_delete on storage.objects;
create policy edoc_read on storage.objects for select to authenticated
  using (bucket_id = 'employee-docs' and (public.is_exec() or exists (
    select 1 from public.employee_files f where f.path = storage.objects.name and f.user_id = auth.uid() and f.kind <> 'CONTRACT')));
create policy edoc_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'employee-docs' and (public.is_exec() or split_part(name, '/', 1) = auth.uid()::text));
create policy edoc_delete on storage.objects for delete to authenticated
  using (bucket_id = 'employee-docs' and (public.is_exec() or exists (
    select 1 from public.employee_files f where f.path = storage.objects.name and f.user_id = auth.uid() and f.kind <> 'CONTRACT')));

drop policy if exists avatar_read   on storage.objects;
drop policy if exists avatar_upload on storage.objects;
drop policy if exists avatar_delete on storage.objects;
create policy avatar_read on storage.objects for select to authenticated using (bucket_id = 'avatars');
create policy avatar_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (public.is_exec() or split_part(name, '/', 1) = auth.uid()::text));
create policy avatar_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (public.is_exec() or split_part(name, '/', 1) = auth.uid()::text));

select 'EMPLOYEE PROFILES OK' as result;
