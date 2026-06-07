-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Make User Admin
-- Run in Supabase Dashboard → SQL Editor
-- ═════════════════════════════════════════════════════════════════════════════

-- Replace 'your-email@example.com' with the actual email address
UPDATE profiles 
SET is_admin = true 
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- Verify the user is now admin
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';
