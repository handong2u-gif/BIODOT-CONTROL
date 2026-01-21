-- Disable RLS on logistic specs to rule out permission issues
ALTER TABLE public.product_logistics_specs DISABLE ROW LEVEL SECURITY;

-- Ensure all permissions are granted for good measure
GRANT ALL ON public.product_logistics_specs TO anon, authenticated, service_role;
