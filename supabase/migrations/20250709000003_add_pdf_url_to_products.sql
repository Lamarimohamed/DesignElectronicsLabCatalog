-- Add pdf_url column to products (if missing)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pdf_url text NOT NULL DEFAULT '';

-- No trigger or policy changes required for pdf_url
