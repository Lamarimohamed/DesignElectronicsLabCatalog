-- Products catalog table for ElectraLab
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

alter table public.products enable row level security;

-- Anyone can browse the catalog (public read)
create policy "products_select_public"
  on public.products
  for select
  using (true);

-- Only signed-in admins can create, update, or delete
create policy "products_insert_authenticated"
  on public.products
  for insert
  to authenticated
  with check (true);

create policy "products_update_authenticated"
  on public.products
  for update
  to authenticated
  using (true)
  with check (true);

create policy "products_delete_authenticated"
  on public.products
  for delete
  to authenticated
  using (true);
