-- [Fix Raw Materials Schema & Permissions]

DO $$
BEGIN
    -- 1. Rename 'name' to 'product_name' if old column exists and new one does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'name') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'product_name') THEN
        ALTER TABLE public.raw_materials RENAME COLUMN name TO product_name;
    END IF;

    -- 2. Rename 'supply_price' to 'wholesale_a' if old exists and new does not
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'supply_price') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'wholesale_a') THEN
        ALTER TABLE public.raw_materials RENAME COLUMN supply_price TO wholesale_a;
    END IF;

    -- 3. Add missing columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'spec') THEN
        ALTER TABLE public.raw_materials ADD COLUMN spec TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'cost_price') THEN
        ALTER TABLE public.raw_materials ADD COLUMN cost_price NUMERIC;
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

-- 4. Fix RLS Policies (Allow everyone to Edit)
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public read access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public insert access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public update access" ON public.raw_materials;
DROP POLICY IF EXISTS "Allow public delete access" ON public.raw_materials;

-- Create permissive policies
CREATE POLICY "Allow public read" ON public.raw_materials FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.raw_materials FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.raw_materials FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON public.raw_materials FOR DELETE USING (true);

-- Grant permissions to roles
GRANT ALL ON TABLE public.raw_materials TO anon;
GRANT ALL ON TABLE public.raw_materials TO authenticated;
GRANT ALL ON TABLE public.raw_materials TO service_role;

-- 5. Initialize sort_order if null
WITH enumerated AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY product_name) as rn
  FROM public.raw_materials
  WHERE sort_order IS NULL
)
UPDATE public.raw_materials
SET sort_order = enumerated.rn
FROM enumerated
WHERE public.raw_materials.id = enumerated.id;

-- 6. RPC Function for Sort Order
CREATE OR REPLACE FUNCTION update_raw_material_sort_order(p_id uuid, p_sort_order integer)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.raw_materials
  SET sort_order = p_sort_order
  WHERE id = p_id;
END;
$$;

-- Grant RPC execution
GRANT EXECUTE ON FUNCTION update_raw_material_sort_order(uuid, integer) TO anon;
GRANT EXECUTE ON FUNCTION update_raw_material_sort_order(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION update_raw_material_sort_order(uuid, integer) TO service_role;
