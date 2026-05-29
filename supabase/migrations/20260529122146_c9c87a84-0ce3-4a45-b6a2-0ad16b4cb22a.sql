ALTER TABLE public.marketplace_listings
  ADD COLUMN IF NOT EXISTS original_price numeric,
  ADD COLUMN IF NOT EXISTS stock_status text NOT NULL DEFAULT 'in_stock',
  ADD COLUMN IF NOT EXISTS condition text;