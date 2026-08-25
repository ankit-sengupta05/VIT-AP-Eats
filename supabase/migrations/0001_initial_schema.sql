-- ===================================================================
-- VIT-AP Eats — Initial Database Schema
-- Migration: 0001_initial_schema.sql
-- ===================================================================

-- Enable PostGIS for location-based queries (partner tracking)
create extension if not exists postgis;

-- ── Profiles (extends Supabase Auth users) ────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text,
  phone         text unique,
  role          text not null default 'customer' check (role in ('customer', 'partner', 'restaurant_owner', 'admin')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Addresses ──────────────────────────────────────────────────────
create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  label         text not null,           -- "Hostel", "Home", "Lab"
  line1         text not null,
  line2         text,
  lat           double precision not null,
  lng           double precision not null,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses(user_id);

-- ── Restaurants ────────────────────────────────────────────────────
create table public.restaurants (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  name             text not null,
  owner_id         uuid references public.profiles(id),
  cuisine          text[] not null default '{}',
  rating           numeric(2,1) not null default 0,
  delivery_time_min int not null default 30,
  delivery_fee     int not null default 30,    -- in rupees
  min_order        int not null default 100,
  image_url        text,
  address          text,
  lat              double precision,
  lng              double precision,
  is_open          boolean not null default true,
  is_veg_only      boolean not null default false,
  discount_label   text,
  created_at       timestamptz not null default now()
);

-- ── Menu Categories + Items ────────────────────────────────────────
create table public.menu_items (
  id              uuid primary key default gen_random_uuid(),
  restaurant_id   uuid not null references public.restaurants(id) on delete cascade,
  restaurant_slug text not null,
  name            text not null,
  description     text,
  price           int not null,           -- in rupees
  image_url       text,
  category        text not null,          -- e.g. "Biryanis", "Main Course"
  is_veg          boolean not null default true,
  is_popular      boolean not null default false,
  is_available    boolean not null default true,
  created_at      timestamptz not null default now()
);

create index menu_items_restaurant_idx on public.menu_items(restaurant_slug, is_available);

-- ── Orders ────────────────────────────────────────────────────────
create type order_status as enum (
  'placed', 'accepted', 'preparing', 'ready',
  'picked_up', 'on_the_way', 'delivered', 'cancelled'
);

create table public.orders (
  id                    uuid primary key default gen_random_uuid(),
  customer_id           uuid not null references public.profiles(id),
  restaurant_id         uuid not null references public.restaurants(id),
  delivery_partner_id   uuid references public.profiles(id),
  status                order_status not null default 'placed',
  subtotal              int not null,
  delivery_fee          int not null default 30,
  platform_fee          int not null default 5,
  discount              int not null default 0,
  total                 int not null,
  delivery_address      jsonb not null,
  payment_method        text not null check (payment_method in ('upi', 'card', 'cod')),
  coupon_code           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders(customer_id, created_at desc);
create index orders_restaurant_id_idx on public.orders(restaurant_id, status);
create index orders_partner_id_idx on public.orders(delivery_partner_id) where delivery_partner_id is not null;

-- ── Order Items ───────────────────────────────────────────────────
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  menu_item_id  uuid not null references public.menu_items(id),
  quantity      int not null check (quantity > 0),
  unit_price    int not null
);

create index order_items_order_id_idx on public.order_items(order_id);

-- ── Partner Locations (for realtime tracking) ─────────────────────
create table public.partner_locations (
  partner_id    uuid primary key references public.profiles(id) on delete cascade,
  location      geography(Point, 4326) not null,
  heading       numeric(5,2),
  updated_at    timestamptz not null default now()
);

-- Spatial index for proximity queries
create index partner_locations_geo_idx on public.partner_locations using gist(location);

-- ── Row Level Security ────────────────────────────────────────────
alter table public.profiles        enable row level security;
alter table public.addresses       enable row level security;
alter table public.restaurants     enable row level security;
alter table public.menu_items      enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.partner_locations enable row level security;

-- Profiles: users can only read/update their own
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id);

-- Addresses: users own their addresses
create policy "addresses_self" on public.addresses
  for all using (auth.uid() = user_id);

-- Restaurants: public read, owners manage their own
create policy "restaurants_read" on public.restaurants
  for select using (true);

-- Menu items: public read
create policy "menu_items_read" on public.menu_items
  for select using (true);

-- Orders: customers see their own, partners see assigned
create policy "orders_customer" on public.orders
  for select using (auth.uid() = customer_id);
create policy "orders_partner" on public.orders
  for select using (auth.uid() = delivery_partner_id);
create policy "orders_insert" on public.orders
  for insert with check (auth.uid() = customer_id);

-- Order items: visible if parent order is visible
create policy "order_items_read" on public.order_items
  for select using (
    order_id in (
      select id from public.orders
      where customer_id = auth.uid() or delivery_partner_id = auth.uid()
    )
  );
