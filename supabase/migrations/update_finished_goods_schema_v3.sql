-- Update finished_goods table to support new product features
ALTER TABLE public.finished_goods
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
ADD COLUMN IF NOT EXISTS stock_status TEXT DEFAULT 'in_stock', -- in_stock, out_of_stock, etc.
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS selling_point TEXT,
ADD COLUMN IF NOT EXISTS key_features TEXT[],
ADD COLUMN IF NOT EXISTS target_customer TEXT;

-- Comment on columns for clarity
COMMENT ON COLUMN public.finished_goods.thumbnail_url IS 'Product thumbnail image URL';
COMMENT ON COLUMN public.finished_goods.stock_status IS 'Inventory status (in_stock, out_of_stock)';
COMMENT ON COLUMN public.finished_goods.tags IS 'Array of tags for the product';
COMMENT ON COLUMN public.finished_goods.selling_point IS 'Main selling point description';
COMMENT ON COLUMN public.finished_goods.key_features IS 'List of key features';
COMMENT ON COLUMN public.finished_goods.target_customer IS 'Target customer description';
