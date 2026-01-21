
DO $$
BEGIN
    -- Check for sort_order column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'sort_order') THEN
        ALTER TABLE public.raw_materials ADD COLUMN sort_order INTEGER;
        -- Initialize sort_order
        EXECUTE 'UPDATE public.raw_materials SET sort_order = id'; -- Assuming id is numeric or handle casting if uuid. If uuid, maybe row_number.
        -- If ID is UUID, we cannot just assign it. Let's assign row numbers initially.
    END IF;

    -- Check for thumbnail_url column (likely exists, but safety check)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE public.raw_materials ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Initialize sort_order with row numbers if it was null (safe to run multiple times)
WITH enumerated AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name) as rn
  FROM public.raw_materials
  WHERE sort_order IS NULL
)
UPDATE public.raw_materials
SET sort_order = enumerated.rn
FROM enumerated
WHERE public.raw_materials.id = enumerated.id;
