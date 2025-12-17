-- Migration to relax raw_materials constraints for flexible CSV upload

-- 1. Drop existing policies to avoid conflicts during alteration (will recreate)
DROP POLICY IF EXISTS "Allow public read access" ON public.raw_materials;

-- 2. Alter raw_materials table
-- Drop foreign key constraint if it exists
ALTER TABLE public.raw_materials DROP CONSTRAINT IF EXISTS raw_materials_origin_country_fkey;

-- Drop check constraints
ALTER TABLE public.raw_materials DROP CONSTRAINT IF EXISTS check_id_format;
ALTER TABLE public.raw_materials DROP CONSTRAINT IF EXISTS unique_product_origin_date;

-- Make fields nullable or text to be more forgiving with CSV data
ALTER TABLE public.raw_materials ALTER COLUMN id DROP NOT NULL;
ALTER TABLE public.raw_materials ALTER COLUMN id TYPE TEXT;

-- Ensure origin_country is just text, not a foreign key reference
ALTER TABLE public.raw_materials ALTER COLUMN origin_country DROP NOT NULL;

-- price_effective_date can be nullable
ALTER TABLE public.raw_materials ALTER COLUMN price_effective_date DROP NOT NULL;

-- supply_price can be nullable
ALTER TABLE public.raw_materials ALTER COLUMN supply_price DROP NOT NULL;

-- Re-enable RLS policy
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.raw_materials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON public.raw_materials FOR DELETE TO anon USING (true);
