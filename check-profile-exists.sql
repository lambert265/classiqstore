-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Check & Fix Missing Profile
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. Check all users and their profiles
SELECT 
  u.id,
  u.email,
  u.created_at as user_created,
  p.id as profile_id,
  p.is_admin,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 2. If you see NULL in profile_id, your profile doesn't exist!
-- Create it manually (REPLACE THE EMAIL):

INSERT INTO profiles (id, email, full_name, is_admin)
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name',
  true
FROM auth.users
WHERE email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE 
SET is_admin = true;

-- 3. Verify it worked:
SELECT 
  u.email,
  p.is_admin,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
