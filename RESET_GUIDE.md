# Complete Supabase Reset Guide

This guide will help you completely reset your Supabase project and start fresh.

## Step 1: Delete Current Supabase Project

1. Go to [https://app.supabase.com/](https://app.supabase.com/)
2. Click on your project
3. Go to **Settings** (gear icon in the sidebar)
4. Scroll down to **"Danger Zone"**
5. Click **"Delete Project"**
6. Confirm by typing your project name and clicking **"Delete Project"**

## Step 2: Create a New Project

1. On the Supabase dashboard, click **"New Project"**
2. Choose a name for your project
3. Select your preferred region
4. Set a secure database password
5. Click **"Create Project"**

## Step 3: Wait for Project Creation

- Wait for the project to be fully created (this may take a minute)

## Step 4: Note Down Your New Project Credentials

1. Go to **Project Settings** → **API**
2. Copy the **"Project URL"** (looks like `https://xyz.supabase.co`)
3. Copy the **"anon" key** (public)
4. Save these credentials - you'll need them later

## Step 5: Apply the Database Schema

1. In your new project, go to **SQL Editor**
2. Copy and paste the following complete schema:

```sql
-- Complete schema for ElectraLab Catalog
-- Migration 1: Create products table
create table if not exists public.products (
  id text primary key,
  ref text not null unique,
  name text not null,
  category text not null,
  subcategory text not null default '',
  description text not null default '',
  short_desc text not null,
  image text not null default '',
  pdf_url text not null default '',
  availability text not null default 'stock'
    check (availability in ('stock', 'commande', 'discontinue')),
  specs jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  norm text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_availability_idx on public.products (availability);

create or replace function public.set_products_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at
  before update on public.products
  for each row
  execute function public.set_products_updated_at();

-- Migration 2: Create other tables
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

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists categories_slug_idx on public.categories (slug);

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

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index if not exists favorites_product_idx on public.favorites (product_id);

-- Migration 3: Create triggers
create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

-- Migration 4: Enable RLS and create policies
alter table public.products enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.favorites enable row level security;

-- Products policies
create policy "products_select_public"
  on public.products
  for select
  using (true);

create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Profiles policies
create policy "profiles_select_self_or_admin"
 on public.profiles for select
 using (auth.uid() = id or exists (select 1 from public.profiles p2 where p2.id = auth.uid() and p2.is_admin));

create policy "profiles_update_self"
 on public.profiles for update
 using (auth.uid() = id)
 with check (auth.uid() = id);

create policy "profiles_insert_auth"
 on public.profiles for insert
 to authenticated
 with check (auth.uid() = id);

-- Categories policies
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

-- Orders policies
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

-- Favorites policies
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
```

3. Click **"Run"** to execute the schema

## Step 6: Create Storage Bucket

1. Go to **Storage** in your new project
2. Click **"New bucket"**
3. Name it `product-images`
4. Set Public Access to **"true"**
5. Click **"Create bucket"**

## Step 7: Create Storage Policies

In the SQL Editor, run:

```sql
-- Storage policies
CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

CREATE POLICY "product_images_admin_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

CREATE POLICY "product_images_admin_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );
```

## Step 8: Refresh Schema

In the SQL Editor, run:

```sql
NOTIFY pgrst, 'reload schema';
```

## Step 9: Update Your Netlify Environment Variables

1. Go to your Netlify dashboard
2. Go to your project
3. Go to **"Settings"** → **"Build & Deploy"** → **"Environment"**
4. Update these variables with your new project's credentials:
   - `VITE_SUPABASE_URL`: Your new project URL
   - `VITE_SUPABASE_ANON_KEY`: Your new anon key
5. Click **"Save"**
6. Trigger a new deployment in the **"Deploys"** section

## Step 10: Create Your Admin Account

1. Go to **Authentication** → **Users** in your new project
2. Click **"New User"** or **"Invite User"**
3. Create a new user account (use your email and a strong password)
4. After creating the user, note down the user ID

## Step 11: Grant Admin Rights to Your User

1. In the SQL Editor, run (replace `'your-user-id-here'` with the actual user ID from step 10):

```sql
INSERT INTO public.profiles (id, is_admin, display_name)
VALUES ('your-user-id-here', true, 'Admin User')
ON CONFLICT (id) 
DO UPDATE SET is_admin = true;
```

## Step 12: Test Your Application

1. Wait for the Netlify deployment to complete
2. Visit your website
3. Try logging in to the admin panel
4. Test adding, editing, and deleting products
5. Test uploading images and PDFs

---

## Troubleshooting Tips

- If you still have issues, check the browser console (F12) for specific error messages
- Make sure your user has `is_admin = true` in the profiles table
- Verify that your environment variables in Netlify match exactly with your new Supabase project
- Clear your browser cache if you're still seeing old errors