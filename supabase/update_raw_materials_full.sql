-- [Raw Materials Schema Update]
-- 1. Add missing columns for UI features (Sort, Images)
-- 2. Add RPC for Drag & Drop sorting

DO $$
BEGIN
    -- Check for sort_order column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'sort_order') THEN
        ALTER TABLE public.raw_materials ADD COLUMN sort_order INTEGER;
    END IF;

    -- Check for thumbnail_url column (for Image Manager)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE public.raw_materials ADD COLUMN thumbnail_url TEXT;
    END IF;

    -- Check for detail_image_url column (for Image Manager)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'detail_image_url') THEN
        ALTER TABLE public.raw_materials ADD COLUMN detail_image_url TEXT;
    END IF;
END $$;

-- 3. Initialize sort_order (using row number logic) to prevent nulls
WITH enumerated AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY product_name) as rn
  FROM public.raw_materials
  WHERE sort_order IS NULL
)
UPDATE public.raw_materials
SET sort_order = enumerated.rn
FROM enumerated
WHERE public.raw_materials.id = enumerated.id;

-- 4. Create RPC function for Drag and Drop reordering
-- This function allows updating the sort_order of a specific row by ID.
-- Note: Replaces existing function if any.
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
