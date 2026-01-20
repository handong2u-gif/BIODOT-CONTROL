-- [Schema Update] Add missing columns for Online Price and Sort Order

-- 1. Add 'online_price' if it doesn't exist
-- This is required for the "Online Sales" visibility on Product pages
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'online_price') THEN
        ALTER TABLE public.finished_goods ADD COLUMN online_price NUMERIC DEFAULT 0;
    END IF;
END $$;

-- 2. Add 'sort_order' if it doesn't exist
-- This is required for the Drag & Drop sorting functionality
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'sort_order') THEN
        ALTER TABLE public.finished_goods ADD COLUMN sort_order INTEGER;
    END IF;
END $$;

-- 3. Initialize 'sort_order' for existing records
-- We set it to equal 'id' so there is a default order
UPDATE public.finished_goods 
SET sort_order = id 
WHERE sort_order IS NULL;

-- 4. Reload Schema Permissions (Optional but recommended)
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.finished_goods TO anon;
GRANT ALL ON public.finished_goods TO authenticated;
GRANT ALL ON public.finished_goods TO service_role;
