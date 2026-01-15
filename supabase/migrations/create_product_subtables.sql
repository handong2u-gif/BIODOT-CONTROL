-- 1. Create product_documents table
CREATE TABLE IF NOT EXISTS public.product_documents (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.finished_goods(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Docs" ON public.product_documents FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Docs" ON public.product_documents FOR INSERT TO anon WITH CHECK (true); -- For demo/admin
CREATE POLICY "Public Update Docs" ON public.product_documents FOR UPDATE TO anon USING (true);

-- 2. Create product_special_prices table
CREATE TABLE IF NOT EXISTS public.product_special_prices (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.finished_goods(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_special_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Prices" ON public.product_special_prices FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Prices" ON public.product_special_prices FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Prices" ON public.product_special_prices FOR UPDATE TO anon USING (true);

-- 3. Update finished_goods configuration

-- Add updated_at column if not exists
ALTER TABLE public.finished_goods 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add Trigger for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_finished_goods_modtime ON public.finished_goods;

CREATE TRIGGER update_finished_goods_modtime
    BEFORE UPDATE ON public.finished_goods
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Add Constraint for stock_status
ALTER TABLE public.finished_goods 
DROP CONSTRAINT IF EXISTS check_stock_status;

ALTER TABLE public.finished_goods 
ADD CONSTRAINT check_stock_status 
CHECK (stock_status IN ('충분', '보통', '소량', '품절', 'in_stock', 'out_of_stock')); 
-- Note: Keeping in_stock/out_of_stock for backward compat during transition if needed, 
-- or strictly enforcing the new Korean values? 
-- User asked for: 충분,보통,소량,품절. I will enforce these strictly but I need to migrate existing data first if strictly enforcing.
-- For safety, I'll allow both sets effectively, or just Update existing rows first.

UPDATE public.finished_goods SET stock_status = '충분' WHERE stock_status = 'in_stock';
UPDATE public.finished_goods SET stock_status = '품절' WHERE stock_status = 'out_of_stock';
-- Now enforce strict constraint
ALTER TABLE public.finished_goods 
DROP CONSTRAINT check_stock_status;

ALTER TABLE public.finished_goods 
ADD CONSTRAINT check_stock_status 
CHECK (stock_status IN ('충분', '보통', '소량', '품절'));

-- Ensure tags is text[] (Already is, but good to be sure)
-- ALTER TABLE public.finished_goods ALTER COLUMN tags TYPE text[] USING tags::text[];

-- Comments
COMMENT ON TABLE public.product_documents IS 'Product documentation files';
COMMENT ON COLUMN public.product_documents.is_current IS 'Filter for current documents';
COMMENT ON TABLE public.product_special_prices IS 'Special price offers';
COMMENT ON COLUMN public.product_special_prices.is_active IS 'Filter for active prices';
