-- [CRITICAL FIX] Raw Materials Schema & Permissions
-- This script ensures columns are correctly named and permissions are open.

-- 1. Schema Standardization (Rename old columns if they exist)
DO $$
BEGIN
    -- Rename 'name' -> 'product_name' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'product_name') THEN
        ALTER TABLE public.raw_materials RENAME COLUMN name TO product_name;
    END IF;

    -- Rename 'supply_price' -> 'wholesale_a' if needed
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'supply_price') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'wholesale_a') THEN
        ALTER TABLE public.raw_materials RENAME COLUMN supply_price TO wholesale_a;
    END IF;

    -- Create columns if they still don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'product_name') THEN
        ALTER TABLE public.raw_materials ADD COLUMN product_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'wholesale_a') THEN
        ALTER TABLE public.raw_materials ADD COLUMN wholesale_a NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'cost_price') THEN
        ALTER TABLE public.raw_materials ADD COLUMN cost_price NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'spec') THEN
        ALTER TABLE public.raw_materials ADD COLUMN spec TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'origin_country') THEN
        ALTER TABLE public.raw_materials ADD COLUMN origin_country TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'memo') THEN
        ALTER TABLE public.raw_materials ADD COLUMN memo TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE public.raw_materials ADD COLUMN thumbnail_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'detail_image_url') THEN
        ALTER TABLE public.raw_materials ADD COLUMN detail_image_url TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'sort_order') THEN
        ALTER TABLE public.raw_materials ADD COLUMN sort_order INTEGER;
    END IF;
END $$;

-- 2. Force Permissions (RLS)
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Remove ALL existing policies to prevent conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public read access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public insert access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public update access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public delete access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow all access for anon" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow all actions for anon" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow all actions for authenticated" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow all actions for service_role" ON public.raw_materials;

-- Create ONE Universal Open Policy
CREATE POLICY "Universal Access Policy" ON public.raw_materials
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Grant Privileges
GRANT ALL ON TABLE public.raw_materials TO anon;
GRANT ALL ON TABLE public.raw_materials TO authenticated;
GRANT ALL ON TABLE public.raw_materials TO service_role;

-- 4. Notify
SELECT 'Fix Applied Successfully: Columns standardized and RLS opened.' as status;
