-- Enable RLS on product_logistics_specs if not already enabled (optional, but good practice)
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;

-- Policy for Public Read (Anon)
CREATE POLICY "Allow Anon Read Logistics"
ON public.product_logistics_specs
FOR SELECT
TO anon
USING (true);

-- Policy for Authenticated Read
CREATE POLICY "Allow Authenticated Read Logistics"
ON public.product_logistics_specs
FOR SELECT
TO authenticated
USING (true);

-- Policy for Service Role (Full Access) - implicitly has access, but good to be explicit if needed for some clients
-- (Service role bypasses RLS, so no policy needed strictly, but we ensure Anon/Auth can read)

-- Grant usage (just in case)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_logistics_specs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_logistics_specs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_logistics_specs TO service_role;
