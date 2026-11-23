-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (c): project workspace
-- Safe to run more than once. Deletes no data.
--   • Project files (drawings, contracts, quotations, BOQ, photos, reports…)
--   • Tasks & milestones
--   • Progress updates (with site photos)
--   • Contract value & client invoices (executives + project manager only)
-- Who can do what:
--   view a project's files / tasks / updates : executives, its manager, its members
--   upload files, post updates               : same people
--   create / edit tasks                      : executives + project manager
--   tick a task                              : also the person it is assigned to
--   finance (contract, invoices)             : executives + project manager only
-- =============================================================================

-- Helpers ---------------------------------------------------------------------
create or replace function public.can_view_project(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_exec()
      or exists (select 1 from projects where id = pid and manager_id = auth.uid())
      or exists (select 1 from project_members where project_id = pid and user_id = auth.uid());
$$;

create or replace function public.can_manage_project(pid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_exec() or exists (select 1 from projects where id = pid and manager_id = auth.uid());
$$;

-- storage paths look like "<project id>/<file>"
create or replace function public.can_view_project_path(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects pr where pr.id::text = split_part(p, '/', 1) and public.can_view_project(pr.id));
$$;
create or replace function public.can_manage_project_path(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from projects pr where pr.id::text = split_part(p, '/', 1) and public.can_manage_project(pr.id));
$$;

-- Tables ----------------------------------------------------------------------
create table if not exists public.project_updates (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  author_id   uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  body        text not null check (length(trim(body)) > 0),
  created_at  timestamptz not null default now()
);
create index if not exists project_updates_proj_idx on public.project_updates(project_id);

create table if not exists public.project_files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  update_id   uuid references public.project_updates(id) on delete cascade,
  folder      text not null default 'OTHER' check (folder in ('DRAWINGS','CONTRACTS','QUOTATIONS','BOQ','PHOTOS','REPORTS','OTHER')),
  name        text not null,
  path        text not null unique,
  size_bytes  bigint,
  mime        text,
  uploaded_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists project_files_proj_idx on public.project_files(project_id);

create table if not exists public.project_tasks (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  title         text not null check (length(trim(title)) > 0),
  notes         text,
  assignee_id   uuid references public.profiles(id) on delete set null,
  due_date      date,
  status        text not null default 'TODO' check (status in ('TODO','IN_PROGRESS','DONE')),
  is_milestone  boolean not null default false,
  created_by    uuid default auth.uid(),
  created_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index if not exists project_tasks_proj_idx on public.project_tasks(project_id);

create table if not exists public.project_finance (
  project_id         uuid primary key references public.projects(id) on delete cascade,
  contract_value_sar numeric(14,2) not null default 0 check (contract_value_sar >= 0),
  payment_terms      text,
  updated_at         timestamptz not null default now()
);

create table if not exists public.project_invoices (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  invoice_no  text,
  description text,
  amount_sar  numeric(14,2) not null check (amount_sar > 0),
  issue_date  date not null default current_date,
  due_date    date,
  paid_date   date,
  created_by  uuid default auth.uid(),
  created_at  timestamptz not null default now()
);
create index if not exists project_invoices_proj_idx on public.project_invoices(project_id);

-- Tick a task: managers, or the person the task is assigned to -------------------
create or replace function public.set_task_status(p_id uuid, p_status text)
returns text language plpgsql security definer set search_path = public as $$
declare tk project_tasks%rowtype;
begin
  if p_status not in ('TODO','IN_PROGRESS','DONE') then raise exception 'Invalid status'; end if;
  select * into tk from project_tasks where id = p_id for update;
  if not found then raise exception 'Task not found'; end if;
  if not (public.can_manage_project(tk.project_id) or tk.assignee_id = auth.uid()) then
    raise exception 'You cannot change this task';
  end if;
  update project_tasks set status = p_status,
         completed_at = case when p_status = 'DONE' then coalesce(completed_at, now()) else null end
   where id = p_id;
  return p_status;
end $$;
revoke execute on function public.set_task_status(uuid, text) from anon;

-- Row level security ----------------------------------------------------------
alter table public.project_updates  enable row level security;
alter table public.project_files    enable row level security;
alter table public.project_tasks    enable row level security;
alter table public.project_finance  enable row level security;
alter table public.project_invoices enable row level security;

drop policy if exists pu_read   on public.project_updates;
drop policy if exists pu_insert on public.project_updates;
drop policy if exists pu_delete on public.project_updates;
create policy pu_read   on public.project_updates for select to authenticated using (public.can_view_project(project_id));
create policy pu_insert on public.project_updates for insert to authenticated
  with check (author_id = auth.uid() and public.can_view_project(project_id));
create policy pu_delete on public.project_updates for delete to authenticated
  using (author_id = auth.uid() or public.can_manage_project(project_id));

drop policy if exists pf_read   on public.project_files;
drop policy if exists pf_insert on public.project_files;
drop policy if exists pf_delete on public.project_files;
create policy pf_read   on public.project_files for select to authenticated using (public.can_view_project(project_id));
create policy pf_insert on public.project_files for insert to authenticated
  with check (uploaded_by = auth.uid() and public.can_view_project(project_id) and path like project_id::text || '/%');
create policy pf_delete on public.project_files for delete to authenticated
  using (uploaded_by = auth.uid() or public.can_manage_project(project_id));

drop policy if exists pt_read  on public.project_tasks;
drop policy if exists pt_write on public.project_tasks;
create policy pt_read  on public.project_tasks for select to authenticated using (public.can_view_project(project_id));
create policy pt_write on public.project_tasks for all to authenticated
  using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));

drop policy if exists pfin_all on public.project_finance;
create policy pfin_all on public.project_finance for all to authenticated
  using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));

drop policy if exists pinv_all on public.project_invoices;
create policy pinv_all on public.project_invoices for all to authenticated
  using (public.can_manage_project(project_id)) with check (public.can_manage_project(project_id));

grant select, insert, update, delete on public.project_updates, public.project_files, public.project_tasks,
  public.project_finance, public.project_invoices to authenticated;

-- Private file storage (25 MB per file) --------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-files', 'project-files', false, 26214400, null)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists pfiles_read   on storage.objects;
drop policy if exists pfiles_upload on storage.objects;
drop policy if exists pfiles_delete on storage.objects;
create policy pfiles_read on storage.objects for select to authenticated
  using (bucket_id = 'project-files' and public.can_view_project_path(name));
create policy pfiles_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'project-files' and public.can_view_project_path(name));
create policy pfiles_delete on storage.objects for delete to authenticated
  using (bucket_id = 'project-files' and (owner_id = auth.uid()::text or public.can_manage_project_path(name)));

select 'PROJECT WORKSPACE OK' as result;
