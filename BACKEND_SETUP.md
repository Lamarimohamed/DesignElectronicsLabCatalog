# Backend Setup

This project uses Supabase as the backend for:

- authentication
- product CRUD
- profile/admin checks
- image and PDF uploads

## Current Project

- Project ref: `oapiwrapxfktfdxwttls`
- Supabase URL: `https://oapiwrapxfktfdxwttls.supabase.co`

## Required Environment Variables

Create a local `.env` file with:

```bash
VITE_SUPABASE_URL=https://oapiwrapxfktfdxwttls.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

If you do not set these values, the app falls back to local demo data and admin actions will not persist.

## Supabase CLI Workflow

From the project root:

```bash
npx supabase login
npx supabase link --project-ref oapiwrapxfktfdxwttls
npx supabase db push
```

## Database Requirements

The pushed migrations create these objects:

- `public.products`
- `public.profiles`
- `public.categories`
- `public.orders`
- `public.favorites`

The backend also requires the admin and storage policies already included in the migrations.

## Admin Account Setup

After linking and pushing, make sure your auth user has a profile row with `is_admin = true`.

```sql
insert into public.profiles (id, display_name, is_admin)
select id, email, true
from auth.users
where email = 'your-email@example.com'
on conflict (id)
do update set
  display_name = excluded.display_name,
  is_admin = true;
```

## Storage Setup

Create a public bucket named `product-images` and keep the storage policies enabled from the migrations.

## Quick Check

Open the Admin panel and run the diagnostics panel. It should report:

- profile exists
- `is_admin: true`
- storage write: ok

If any of these fail, admin save/edit/delete/upload will be blocked.
