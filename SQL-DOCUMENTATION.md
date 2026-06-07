# NOVAELLE SQL Documentation

Complete database schema and query patterns for the NOVAELLE online store.

---

## 1. Database Schema

### Profiles Table
```sql
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  email text,
  is_admin boolean default false,
  created_at timestamptz default now()
);
```

### Products Table
```sql
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
```

### Orders Table
```sql
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
```

### Subscribers Table
```sql
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
```

### Settings Table
```sql
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);
```

### Lookbook Table
```sql
create table if not exists lookbook (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  images jsonb default '[]',
  published boolean default false,
  created_at timestamptz default now()
);
```

---

## 2. Indexes

```sql
create index if not exists idx_orders_user_id on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created_at on orders(created_at);
create index if not exists idx_products_category on products(category);
```

---

## 3. Row Level Security (RLS)

### Profiles
```sql
alter table profiles enable row level security;

create policy "users_own_profile" on profiles 
  for all using (auth.uid() = id);

create policy "admins_read_all_profiles" on profiles 
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Products
```sql
alter table products enable row level security;

create policy "public_read_products" on products 
  for select using (true);

create policy "admin_write_products" on products 
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Orders
```sql
alter table orders enable row level security;

create policy "users_own_orders" on orders 
  for select using (auth.uid() = user_id);

create policy "users_insert_orders" on orders 
  for insert with check (auth.uid() = user_id);

create policy "admins_all_orders" on orders 
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Subscribers
```sql
alter table subscribers enable row level security;

create policy "public_subscribe" on subscribers 
  for insert with check (true);

create policy "admins_read_subscribers" on subscribers 
  for select using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Settings
```sql
alter table settings enable row level security;

create policy "admins_settings" on settings 
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

### Lookbook
```sql
alter table lookbook enable row level security;

create policy "public_read_lookbook" on lookbook 
  for select using (published = true);

create policy "admins_all_lookbook" on lookbook 
  for all using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );
```

---

## 4. Triggers

### Auto-create Profile on Signup
```sql
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 5. Seed Data

```sql
insert into settings (key, value) values
  ('monthly_goal', '500000'),
  ('store_name', 'NOVAELLE'),
  ('contact_email', 'hello@novaelle.com'),
  ('ai_name', 'Knotté')
on conflict (key) do nothing;
```

---

## 6. Common Query Patterns

### Main Site

#### Fetch All Products
```typescript
const { data: products } = await supabase
  .from("products")
  .select("*")
  .order("created_at", { ascending: false });
```

#### Fetch Products by Category
```typescript
const { data: products } = await supabase
  .from("products")
  .select("*")
  .eq("category", "beanie")
  .order("created_at", { ascending: false });
```

#### Fetch Flash Sale Products
```typescript
const { data: products } = await supabase
  .from("products")
  .select("*")
  .eq("is_flash_sale", true);
```

#### Create Order
```typescript
await supabase.from("orders").insert({
  user_id,
  status: 'pending_confirmation',
  total_amount,
  shipping_address,
  items
});
```

#### Fetch User Orders
```typescript
const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false });
```

#### Newsletter Subscription
```typescript
await supabase.from("subscribers").insert({ email });
```

#### Fetch Published Lookbook
```typescript
const { data: entries } = await supabase
  .from("lookbook")
  .select("*")
  .eq("published", true)
  .order("created_at", { ascending: false });
```

### Admin Dashboard

#### Product Management
```typescript
// Create
await supabase.from("products").insert({
  name,
  price,
  category,
  description,
  images,
  stock_count,
  size_prices
});

// Update
await supabase
  .from("products")
  .update({ name, price, stock_count })
  .eq("id", id);

// Delete
await supabase
  .from("products")
  .delete()
  .eq("id", id);
```

#### Order Management
```typescript
// Fetch all orders
const { data: orders } = await supabase
  .from("orders")
  .select("*")
  .order("created_at", { ascending: false });

// Update order status
await supabase
  .from("orders")
  .update({ status: "confirmed" })
  .eq("id", orderId);
```

#### Flash Sale
```typescript
// Set flash sale
await supabase
  .from("products")
  .update({
    is_flash_sale: true,
    flash_sale_price: discountPrice
  })
  .in("id", productIds);

// Clear flash sale
await supabase
  .from("products")
  .update({
    is_flash_sale: false,
    flash_sale_price: null
  })
  .in("id", productIds);
```

#### Settings Management
```typescript
// Fetch all settings
const { data } = await supabase
  .from("settings")
  .select("*");

// Update setting
await supabase
  .from("settings")
  .upsert({ key: "monthly_goal", value: "600000" });
```

#### Lookbook Management
```typescript
// Create
await supabase.from("lookbook").insert({
  title,
  description,
  images,
  published: true
});

// Update
await supabase
  .from("lookbook")
  .update({ title, description, published })
  .eq("id", id);

// Delete
await supabase
  .from("lookbook")
  .delete()
  .eq("id", id);
```

#### Analytics
```typescript
// Revenue & orders
const { data: orders } = await supabase
  .from("orders")
  .select("total_amount, status, created_at");

// Product performance
const { data: products } = await supabase
  .from("products")
  .select("name, price, stock_count, category");

// Subscriber count
const { count } = await supabase
  .from("subscribers")
  .select("*", { count: "exact", head: true });
```

---

## 7. JSONB Column Structures

### products.images
```json
[
  "/path/to/image1.jpg",
  "/path/to/image2.jpg"
]
```

### products.size_prices
```json
[
  { "size": "S", "price": 5000 },
  { "size": "M", "price": 6000 },
  { "size": "L", "price": 7000 }
]
```

### orders.items
```json
[
  {
    "id": "uuid",
    "name": "Product Name",
    "price": 5000,
    "quantity": 2,
    "size": "M",
    "image": "/path/to/image.jpg"
  }
]
```

### orders.shipping_address
```json
{
  "name": "John Doe",
  "phone": "+234...",
  "address": "123 Street",
  "city": "Lagos",
  "state": "Lagos"
}
```

### lookbook.images
```json
[
  "/path/to/lookbook1.jpg",
  "/path/to/lookbook2.jpg"
]
```

---

## Summary

**Total Tables:** 6
1. profiles - User accounts & admin flags
2. products - Product catalog
3. orders - Customer orders
4. subscribers - Newsletter emails
5. settings - Store configuration
6. lookbook - Editorial/lifestyle content

**Key Features:**
- Admin role-based access
- Auto profile creation on signup
- Flash sale support
- Size-based pricing
- Simple order workflow
- Newsletter system
- Lookbook/editorial content
