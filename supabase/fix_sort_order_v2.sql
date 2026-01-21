-- 1. Ensure sort_order column exists in finished_goods
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'finished_goods' AND column_name = 'sort_order') THEN
        ALTER TABLE public.finished_goods ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Initialize sort_order for existing records if they are 0 or null
WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as rn
    FROM public.finished_goods
)
UPDATE public.finished_goods
SET sort_order = numbered.rn
FROM numbered
WHERE public.finished_goods.id = numbered.id
  AND (public.finished_goods.sort_order IS NULL OR public.finished_goods.sort_order = 0);

-- 3. Ensure permissions for update
-- Re-applying permissive policies for finished_goods to ensure sort_order is covered
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable update access for all" ON public.finished_goods;
CREATE POLICY "Enable update access for all" ON public.finished_goods FOR UPDATE USING (true);

GRANT ALL ON public.finished_goods TO anon, authenticated, service_role;
