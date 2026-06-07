-- ═════════════════════════════════════════════════════════════════════════════
-- NOVAELLE — Complete Database Setup
-- Run this ONCE in Supabase Dashboard → SQL Editor
-- ═════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TABLES
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  stock_count integer default 0,
  category text check (category in ('beanie','skirt','set','bag','accessory','shorts','baby_wear')),
  description text,
  images jsonb default '[]',
  size_prices jsonb default '[]',
  is_flash_sale boolean default false,
  flash_sale_price numeric,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete set null,
  status text default 'pending_confirmation'
    check (status in ('pending_confirmation','confirmed','processing','shipped','delivered','cancelled')),
  total_amount numeric not null,
  shipping_address jsonb,
  items jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

create table if not exists lookbook (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  images jsonb default '[]',
  published boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_products_category on products(category);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table subscribers enable row level security;
alter table settings enable row level security;
alter table lookbook enable row level security;

-- Profiles
drop policy if exists "users_own_profile" on profiles;
create policy "users_own_profile" on profiles for all using (auth.uid() = id);

drop policy if exists "admins_read_all_profiles" on profiles;
create policy "admins_read_all_profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Products
drop policy if exists "public_read_products" on products;
create policy "public_read_products" on products for select using (true);

drop policy if exists "admin_write_products" on products;
create policy "admin_write_products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Orders
drop policy if exists "users_own_orders" on orders;
create policy "users_own_orders" on orders for select using (auth.uid() = user_id);

drop policy if exists "users_insert_orders" on orders;
create policy "users_insert_orders" on orders for insert with check (auth.uid() = user_id);

drop policy if exists "admins_all_orders" on orders;
create policy "admins_all_orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Subscribers
drop policy if exists "public_subscribe" on subscribers;
create policy "public_subscribe" on subscribers for insert with check (true);

drop policy if exists "admins_read_subscribers" on subscribers;
create policy "admins_read_subscribers" on subscribers for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Settings
drop policy if exists "admins_settings" on settings;
create policy "admins_settings" on settings for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Lookbook
drop policy if exists "public_read_lookbook" on lookbook;
create policy "public_read_lookbook" on lookbook for select using (published = true);

drop policy if exists "admins_all_lookbook" on lookbook;
create policy "admins_all_lookbook" on lookbook for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────

insert into settings (key, value) values
  ('monthly_goal', '500000'),
  ('store_name', 'NOVAELLE'),
  ('contact_email', 'hello@novaelle.com'),
  ('ai_name', 'Knotté')
on conflict (key) do nothing;

-- ═════════════════════════════════════════════════════════════════════════════
-- ✓ SETUP COMPLETE
-- ═════════════════════════════════════════════════════════════════════════════
