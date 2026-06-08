-- Run in Supabase Dashboard → SQL Editor

alter table profiles
  add column if not exists phone text,
  add column if not exists date_of_birth date,
  add column if not exists size_preference text default 'M',
  add column if not exists currency text default 'NGN',
  add column if not exists notif_orders boolean default true,
  add column if not exists notif_drops boolean default true,
  add column if not exists notif_marketing boolean default false,
  add column if not exists notif_sms boolean default false,
  add column if not exists notif_email boolean default true;
