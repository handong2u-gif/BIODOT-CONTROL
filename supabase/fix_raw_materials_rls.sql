-- Enable RLS on raw_materials table
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Construct policies to allow all operations for now (Dev mode)
-- If policies already exist, these might fail, so better to drop first or use DO block.
-- However, assuming clean slate or permissive needs.

DROP POLICY IF EXISTS "Enable read access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable insert access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable update access for all users" ON public.raw_materials;
DROP POLICY IF EXISTS "Enable delete access for all users" ON public.raw_materials;

CREATE POLICY "Enable read access for all users" ON public.raw_materials
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON public.raw_materials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON public.raw_materials
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON public.raw_materials
    FOR DELETE USING (true);
