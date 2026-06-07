-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Diagnostic & Fix
-- Run in Supabase Dashboard → SQL Editor to diagnose and fix admin access issues
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. Check if tables exist
SELECT 
  tablename,
  'exists' as status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'products', 'orders', 'subscribers', 'settings', 'lookbook')
ORDER BY tablename;

-- 2. Check if your profile exists and is admin
SELECT 
  p.id,
  u.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

-- 3. Check RLS policies on profiles
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 4. If your email is not showing as admin, run this (REPLACE THE EMAIL):
-- UPDATE profiles 
-- SET is_admin = true 
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- 5. Verify the fix worked:
-- SELECT u.email, p.is_admin 
-- FROM profiles p 
-- JOIN auth.users u ON p.id = u.id 
-- WHERE u.email = 'your-email@example.com';
