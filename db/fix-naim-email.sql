-- =============================================================================
-- Only needed if you ALREADY ran db/launch.sql with the old address (naem@).
-- Makes naim@mindmastersksa.com an Executive. Safe to run more than once.
-- (If you have not run launch.sql yet, skip this file — launch.sql is already fixed.)
-- =============================================================================

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(coalesce(new.email, ''));
begin
  if v_email not like '%@mindmastersksa.com' then
    raise exception 'Only @mindmastersksa.com accounts can sign in';
  end if;
  insert into profiles (id, email, full_name, role)
  values (new.id, v_email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(v_email, '@', 1)),
          case when v_email in ('naim@mindmastersksa.com','info@mindmastersksa.com') then 'EXECUTIVE' else 'EMPLOYEE' end)
  on conflict (id) do nothing;
  return new;
end $$;

create or replace function public.protect_executives() returns trigger
language plpgsql as $$
begin
  if lower(new.email) in ('naim@mindmastersksa.com','info@mindmastersksa.com') then
    new.role := 'EXECUTIVE';
    new.active := true;
  end if;
  return new;
end $$;

-- If Naim already signed in, promote him now
update public.profiles set role = 'EXECUTIVE', active = true
where lower(email) = 'naim@mindmastersksa.com';
