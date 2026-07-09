-- Create profiles table (linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_admin boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_is_admin_idx on public.profiles (is_admin);

-- Categories table
create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_slug_idx on public.categories (slug);

-- Orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null,
  total numeric(10,2) not null,
  status text not null default 'pending' check (status in ('pending','paid','shipped','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- Favorites (user saved products)
create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index if not exists favorites_product_idx on public.favorites (product_id);

-- Generic updated_at trigger/function
create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Attach trigger to profiles, categories, orders
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_row_updated_at();

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at
  before update on public.categories
  for each row
  execute function public.set_row_updated_at();

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row
  execute function public.set_row_updated_at();

-- Row-level security and policies
alter table public.profiles enable row level security;
create policy "profiles_select_self_or_admin"
 on public.profiles for select
 using (auth.role() = 'anonymous' or auth.uid() = id or (exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin)));

create policy "profiles_update_self"
 on public.profiles for update
 using (auth.uid() = id)
 with check (auth.uid() = id);

create policy "profiles_insert_auth"
 on public.profiles for insert
 to authenticated
 with check (auth.uid() = id);

-- Categories: public can read
alter table public.categories enable row level security;
create policy "categories_select_public"
  on public.categories for select
  using (true);

create policy "categories_insert_admin"
  on public.categories for insert
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "categories_update_admin"
  on public.categories for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "categories_delete_admin"
  on public.categories for delete
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Orders: user can insert and view their orders; admins can view and update
alter table public.orders enable row level security;
create policy "orders_insert_authenticated"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "orders_select_owner_or_admin"
  on public.orders for select
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "orders_update_admin_or_owner"
  on public.orders for update
  using (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (auth.uid() = user_id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Favorites: users can insert/delete their favorites
alter table public.favorites enable row level security;
create policy "favorites_insert_owner"
  on public.favorites for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "favorites_select_owner"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "favorites_delete_owner"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- NOTE: Storage buckets must be created via Supabase UI/CLI. Add a 'product-images' bucket and set public access depending on your needs.
