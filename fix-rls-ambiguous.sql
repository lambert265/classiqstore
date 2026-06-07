-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Fix Ambiguous Column Error (42P17)
-- Run this in Supabase SQL Editor
-- ═════════════════════════════════════════════════════════════════════════════

-- Drop the broken policies
drop policy if exists "users_own_profile" on profiles;
drop policy if exists "admins_read_all_profiles" on profiles;

-- Recreate with proper aliasing to avoid ambiguous references
create policy "users_own_profile" on profiles 
  for all 
  using (id = auth.uid());

create policy "admins_read_all_profiles" on profiles 
  for select 
  using (
    (select is_admin from profiles where id = auth.uid()) = true
  );

-- Verify policies are correct
select 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
from pg_policies 
where tablename = 'profiles';
