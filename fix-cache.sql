-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Force Clear Sessions (Run this if admin access is denied)
-- ═════════════════════════════════════════════════════════════════════════════

-- 1. First, verify you ARE admin (replace email)
SELECT 
  u.email,
  p.is_admin,
  p.id
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';

-- If is_admin shows TRUE above, then it's just a caching issue.
-- Follow these steps:

-- SOLUTION:
-- 1. Open DevTools (F12) → Application tab → Storage → Clear site data
-- 2. Or in browser: Ctrl+Shift+Delete → Clear cookies and cached data
-- 3. Close ALL browser tabs for localhost:3000
-- 4. Restart your dev server: npm run dev
-- 5. Go to http://localhost:3000/admin/login
-- 6. Sign in again

-- If you're STILL getting errors, ensure your .env.local has correct values:
-- NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
-- SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
