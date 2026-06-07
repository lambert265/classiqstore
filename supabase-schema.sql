-- ─────────────────────────────────────────
-- NOVAELLE — Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────

-- PROFILES (extends auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null,
  stock_count integer default 0,
  category text check (category in ('shirt','gown','skirt','trouser','shoe','bag','accessory','jewelry','outerwear')),
  description text,
  images jsonb default '[]',
  size_prices jsonb default '[]',
  is_flash_sale boolean default false,
  flash_sale_price numeric,
  created_at timestamptz default now()
);

-- ORDERS
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

-- CUSTOM REQUESTS
create table if not exists custom_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles on delete set null,
  product_type text,
  description text,
  reference_images jsonb default '[]',
  status text default 'pending'
    check (status in ('pending','in_progress','quoted','accepted','completed')),
  quote_amount numeric,
  created_at timestamptz default now()
);

-- SUBSCRIBERS
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

-- SETTINGS
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

-- LOOKBOOK
create table if not exists lookbook (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  images jsonb default '[]',
  published boolean default false,
  created_at timestamptz default now()
);

-- ─── INDEXES ─────────────────────────────
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_products_category on products(category);

-- ─── RLS ─────────────────────────────────
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table custom_requests enable row level security;
alter table subscribers enable row level security;
alter table settings enable row level security;
alter table lookbook enable row level security;

-- Profiles
create policy "users_own_profile" on profiles for all using (id = auth.uid());
create policy "admins_read_all_profiles" on profiles for select using (
  (select is_admin from profiles where id = auth.uid()) = true
);

-- Products: public read, admin write
create policy "public_read_products" on products for select using (true);
create policy "admin_write_products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Orders
create policy "users_own_orders" on orders for select using (auth.uid() = user_id);
create policy "users_insert_orders" on orders for insert with check (auth.uid() = user_id);
create policy "admins_all_orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Custom requests
create policy "users_own_requests" on custom_requests for select using (auth.uid() = user_id);
create policy "users_insert_requests" on custom_requests for insert with check (auth.uid() = user_id);
create policy "admins_all_requests" on custom_requests for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Subscribers: public insert, admin read
create policy "public_subscribe" on subscribers for insert with check (true);
create policy "admins_read_subscribers" on subscribers for select using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Settings: admin only
create policy "admins_settings" on settings for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- Lookbook: public read if published, admin all
create policy "public_read_lookbook" on lookbook for select using (published = true);
create policy "admins_all_lookbook" on lookbook for all using (
  exists (select 1 from profiles where id = auth.uid() and is_admin = true)
);

-- ─── AUTO-CREATE PROFILE ON SIGNUP ───────
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

-- ─── SEED: default settings ───────────────
insert into settings (key, value) values
  ('monthly_goal', '500000'),
  ('store_name', 'NOVAELLE'),
  ('contact_email', 'hello@novaelle.com'),
  ('ai_name', 'Knotté')
on conflict (key) do nothing;
