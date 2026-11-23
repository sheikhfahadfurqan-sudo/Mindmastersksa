-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (g): staff without a company email
-- Run ONCE in Supabase → SQL Editor → New query → paste all → Run.
-- SAFE: deletes nothing. Safe to run again.
--
-- What it changes:
--   • Executives can add people by name + personal email (Team → Add person).
--   • Those people sign in with a 6-digit code sent to that email.
--   • Nobody else can use the email-code sign-in: the database refuses to
--     create an account for an email an executive has not added.
--   • @mindmastersksa.com staff keep signing in with Microsoft as before.
-- =============================================================================

-- 1. List of people allowed to sign in with an email code -------------------
create table if not exists public.invited_users (
  email      text primary key check (email = lower(trim(email)) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  full_name  text not null check (length(trim(full_name)) > 0),
  invited_by uuid default auth.uid() references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.invited_users enable row level security;

drop policy if exists invited_exec_all on public.invited_users;
create policy invited_exec_all on public.invited_users for all to authenticated
  using (public.is_exec()) with check (public.is_exec());

revoke all on public.invited_users from anon;

-- 2. Profiles may now hold a personal email ---------------------------------
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%mindmastersksa%'
  loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
end $$;

-- 3. Who may get an account ---------------------------------------------------
--    Microsoft sign-in : @mindmastersksa.com, or anyone an executive added
--    Email-code sign-in: only people an executive added
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_email    text := lower(coalesce(new.email, ''));
  v_provider text := coalesce(new.raw_app_meta_data->>'provider', 'email');
  v_invite   invited_users%rowtype;
begin
  select * into v_invite from invited_users where email = v_email;

  if v_provider = 'azure' then
    if v_email not like '%@mindmastersksa.com' and v_invite.email is null then
      raise exception 'Only @mindmastersksa.com accounts can sign in';
    end if;
  elsif v_invite.email is null then
    raise exception 'This email has not been added to Mind Masters';
  end if;

  insert into profiles (id, email, full_name, role)
  values (new.id, v_email,
          coalesce(nullif(trim(v_invite.full_name), ''),
                   new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name',
                   split_part(v_email, '@', 1)),
          case when v_email in ('naim@mindmastersksa.com','naem@mindmastersksa.com','info@mindmastersksa.com')
               then 'EXECUTIVE' else 'EMPLOYEE' end)
  on conflict (id) do nothing;
  return new;
end $$;

-- (trigger on_auth_user_created already points at this function)

select 'EMAIL-CODE UPDATE OK' as result;
