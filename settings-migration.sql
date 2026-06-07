-- ─────────────────────────────────────────────────────────────────
-- CLASSIQ — Settings Phase 1: Extended Schema Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────

-- ── Setting categories ────────────────────────────────────────────
create table if not exists setting_categories (
  id text primary key,
  label text not null,
  description text,
  icon text,
  sort_order integer default 0
);

-- ── Extend settings table ─────────────────────────────────────────
alter table settings add column if not exists category_id text references setting_categories(id) on delete set null;
alter table settings add column if not exists label text;
alter table settings add column if not exists description text;
alter table settings add column if not exists type text default 'text' check (type in ('text','number','email','boolean','select','color','textarea'));
alter table settings add column if not exists options jsonb default null;
alter table settings add column if not exists is_public boolean default false;
alter table settings add column if not exists sort_order integer default 0;
alter table settings add column if not exists created_at timestamptz default now();

-- ── Settings versions (audit trail + rollback) ────────────────────
create table if not exists setting_versions (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null references settings(key) on delete cascade,
  old_value text,
  new_value text,
  changed_by uuid references profiles(id) on delete set null,
  changed_at timestamptz default now(),
  note text
);

create index if not exists idx_setting_versions_key on setting_versions(setting_key);
create index if not exists idx_setting_versions_changed_at on setting_versions(changed_at desc);

-- ── Admin notifications ───────────────────────────────────────────
create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('info','warning','critical','success')),
  title text not null,
  body text,
  is_read boolean default false,
  target_user uuid references profiles(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_target on admin_notifications(target_user, is_read);

-- ── User preferences (profile settings) ──────────────────────────
create table if not exists user_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  notifications_orders boolean default true,
  notifications_marketing boolean default false,
  notifications_sms boolean default false,
  theme text default 'system' check (theme in ('light','dark','system')),
  currency text default 'NGN',
  size_preference text,
  updated_at timestamptz default now()
);

-- ── RLS ───────────────────────────────────────────────────────────
alter table setting_categories enable row level security;
alter table setting_versions enable row level security;
alter table admin_notifications enable row level security;
alter table user_preferences enable row level security;

create policy "public_read_categories" on setting_categories for select using (true);
create policy "admins_manage_categories" on setting_categories for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "admins_read_versions" on setting_versions for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "admins_insert_versions" on setting_versions for insert with check (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "admins_read_notifications" on admin_notifications for select using (
  target_user = auth.uid() or
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);
create policy "admins_manage_notifications" on admin_notifications for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

create policy "users_own_preferences" on user_preferences for all using (user_id = auth.uid());

-- ── Enable realtime ───────────────────────────────────────────────
alter publication supabase_realtime add table settings;
alter publication supabase_realtime add table admin_notifications;

-- ── Seed categories ───────────────────────────────────────────────
insert into setting_categories (id, label, description, icon, sort_order) values
  ('general',       'General',        'Store name, contact, and basic info',        'Store',       1),
  ('appearance',    'Appearance',     'Colors, branding, and display settings',     'Palette',     2),
  ('commerce',      'Commerce',       'Pricing, delivery, and payment settings',    'ShoppingBag', 3),
  ('notifications', 'Notifications',  'Email, SMS, and push notification config',   'Bell',        4),
  ('ai',            'AI & Assistant', 'Nova and Knotté AI assistant settings',      'Sparkles',    5),
  ('security',      'Security',       'Access control and authentication settings', 'Shield',      6)
on conflict (id) do nothing;

-- ── Seed extended settings ────────────────────────────────────────
insert into settings (key, value, label, description, type, category_id, is_public, sort_order) values
  ('store_name',           'CLASSIQ',              'Store Name',              'Displayed across the site',                          'text',     'general',       true,  1),
  ('contact_email',        'hello@classiq.com',    'Contact Email',           'Customer-facing support email',                      'email',    'general',       true,  2),
  ('support_phone',        '',                     'Support Phone',           'WhatsApp / phone number for support',                 'text',     'general',       true,  3),
  ('store_address',        '',                     'Store Address',           'Physical address shown in footer',                   'textarea', 'general',       true,  4),
  ('monthly_goal',         '500000',               'Monthly Revenue Goal (₦)','Target revenue for dashboard progress bar',          'number',   'commerce',      false, 1),
  ('delivery_fee',         '3500',                 'Flat Delivery Fee (₦)',   'Charged on all orders below free delivery threshold','number',   'commerce',      false, 2),
  ('free_delivery_min',    '80000',                'Free Delivery Threshold (₦)','Order value that unlocks free delivery',          'number',   'commerce',      false, 3),
  ('currency',             'NGN',                  'Currency',                'Store currency code',                                'select',   'commerce',      false, 4),
  ('ai_name',              'Knotté',               'Admin AI Name',           'Name shown for the admin assistant',                 'text',     'ai',            false, 1),
  ('site_ai_name',         'Nova',                 'Site AI Name',            'Name shown for the shopper assistant',               'text',     'ai',            true,  2),
  ('ai_enabled',           'true',                 'Enable AI Assistant',     'Show the Nova assistant on the main site',           'boolean',  'ai',            false, 3),
  ('notify_new_order',     'true',                 'New Order Alerts',        'Email admin when a new order is placed',             'boolean',  'notifications', false, 1),
  ('notify_low_stock',     'true',                 'Low Stock Alerts',        'Alert when product stock drops below 5',             'boolean',  'notifications', false, 2),
  ('notify_new_subscriber','true',                 'New Subscriber Alerts',   'Alert on new newsletter signups',                   'boolean',  'notifications', false, 3),
  ('primary_color',        '#1a56db',              'Brand Primary Color',     'Main brand color used across the site',              'color',    'appearance',    false, 1),
  ('accent_color',         '#1e40af',              'Brand Accent Color',      'Secondary brand color',                             'color',    'appearance',    false, 2),
  ('maintenance_mode',     'false',                'Maintenance Mode',        'Take the store offline for maintenance',             'boolean',  'security',      false, 1),
  ('require_auth_checkout','false',                'Require Login to Checkout','Force users to sign in before checkout',            'boolean',  'security',      false, 2)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  type = excluded.type,
  category_id = excluded.category_id,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;
