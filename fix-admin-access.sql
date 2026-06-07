-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Fix Admin Access
-- Run in Supabase Dashboard → SQL Editor if getting "Access denied" errors
-- ═════════════════════════════════════════════════════════════════════════════

-- First, verify you ARE admin
SELECT 
  u.email,
  u.id,
  p.is_admin,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email

-- If is_admin shows false or NULL, run this:
UPDATE profiles 
SET is_admin = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- ─────────────────────────────────────────────────────────────────────────────
-- Fix RLS Policies (in case they're broken)
-- ─────────────────────────────────────────────────────────────────────────────

-- Drop and recreate admin policies with better logic

-- Products: Admin full access
drop policy if exists "admin_write_products" on products;
create policy "admin_write_products" on products 
  for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- Orders: Admin full access
drop policy if exists "admins_all_orders" on orders;
create policy "admins_all_orders" on orders 
  for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- Profiles: Admin read all
drop policy if exists "admins_read_all_profiles" on profiles;
create policy "admins_read_all_profiles" on profiles 
  for select 
  using (
    exists (
      select 1 from profiles as p2
      where p2.id = auth.uid() 
      and p2.is_admin = true
    )
  );

-- Subscribers: Admin full access
drop policy if exists "admins_read_subscribers" on subscribers;
create policy "admins_read_subscribers" on subscribers 
  for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- Settings: Admin full access
drop policy if exists "admins_settings" on settings;
create policy "admins_settings" on settings 
  for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- Lookbook: Admin full access
drop policy if exists "admins_all_lookbook" on lookbook;
create policy "admins_all_lookbook" on lookbook 
  for all 
  using (
    exists (
      select 1 from profiles 
      where profiles.id = auth.uid() 
      and profiles.is_admin = true
    )
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- Verify it worked - Run this last
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 
  'You are admin!' as status,
  email,
  is_admin
FROM profiles
JOIN auth.users ON profiles.id = auth.users.id
WHERE profiles.id = auth.uid();
