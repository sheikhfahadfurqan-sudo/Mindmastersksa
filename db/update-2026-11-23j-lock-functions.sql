-- =============================================================================
-- MIND MASTERS KSA — UPDATE 23 Nov 2026 (j): signed-out visitors can no longer
-- call any database function (e.g. read the accounts / HR email lists).
-- Earlier scripts did "revoke ... from anon", but Postgres also lets PUBLIC
-- (everyone) run new functions by default, so the revoke had no effect.
-- ✅ Already applied 23 Nov. Safe to run again. Deletes nothing.
-- =============================================================================
do $$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig, p.prorettype = 'trigger'::regtype as is_trigger
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    -- Trigger functions run on their own; everything else stays open to signed-in staff.
    if f.is_trigger then
      execute format('revoke execute on function %s from authenticated', f.sig);
    else
      execute format('grant execute on function %s to authenticated', f.sig);
    end if;
  end loop;
end $$;

-- Functions created later start locked to signed-out visitors too.
alter default privileges for role postgres in schema public revoke execute on functions from public, anon;

select 'LOCK-FUNCTIONS UPDATE OK' as result;
