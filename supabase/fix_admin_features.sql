-- [Fix Permissions] Drop Duplicates and Re-create Policies
-- Run this to fix "Policy already exists" errors

-- 1. Ensure Columns Exist (Safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'online_price') THEN
        ALTER TABLE public.finished_goods ADD COLUMN online_price NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'sort_order') THEN
        ALTER TABLE public.finished_goods ADD COLUMN sort_order INTEGER;
    END IF;
END $$;

-- 2. Initialize 'sort_order' if NULL
UPDATE public.finished_goods 
SET sort_order = id 
WHERE sort_order IS NULL;

-- 3. Reset RLS Policies (Drop ALL known variations first)
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;

-- Drop standard names
DROP POLICY IF EXISTS "Public Read" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Insert" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Update" ON public.finished_goods;
DROP POLICY IF EXISTS "Public Delete" ON public.finished_goods;

-- Drop "Allow Anon" variations
DROP POLICY IF EXISTS "Allow Anon Read" ON public.finished_goods;
DROP POLICY IF EXISTS "Allow Anon Insert" ON public.finished_goods;
DROP POLICY IF EXISTS "Allow Anon Update" ON public.finished_goods;
DROP POLICY IF EXISTS "Allow Anon Delete" ON public.finished_goods;

-- Drop "Enable" variations (Supabase default sometimes)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.finished_goods;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.finished_goods;
DROP POLICY IF EXISTS "Enable update for all users" ON public.finished_goods;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.finished_goods;

-- 4. Create Clean Policies for Public Access
CREATE POLICY "Allow Anon Read" ON public.finished_goods FOR SELECT TO anon, authenticated, service_role USING (true);
CREATE POLICY "Allow Anon Insert" ON public.finished_goods FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY "Allow Anon Update" ON public.finished_goods FOR UPDATE TO anon, authenticated, service_role USING (true);
CREATE POLICY "Allow Anon Delete" ON public.finished_goods FOR DELETE TO anon, authenticated, service_role USING (true);

-- 5. Logistics Table Permissions (Just in case)
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Anon Read Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Allow Anon Insert Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Allow Anon Update Logistics" ON public.product_logistics_specs;

CREATE POLICY "Allow Anon Read Logistics" ON public.product_logistics_specs FOR SELECT TO anon, authenticated, service_role USING (true);
CREATE POLICY "Allow Anon Insert Logistics" ON public.product_logistics_specs FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY "Allow Anon Update Logistics" ON public.product_logistics_specs FOR UPDATE TO anon, authenticated, service_role USING (true);
