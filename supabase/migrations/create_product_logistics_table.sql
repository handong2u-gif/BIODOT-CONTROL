-- Create product_logistics_specs table
CREATE TABLE IF NOT EXISTS public.product_logistics_specs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.finished_goods(id) ON DELETE CASCADE,
    unit_weight_kg NUMERIC,
    carton_weight_kg NUMERIC,
    carton_width_mm NUMERIC,
    carton_depth_mm NUMERIC,
    carton_height_mm NUMERIC,
    qty_per_carton INTEGER,
    product_depth_mm NUMERIC,
    product_height_mm NUMERIC,
    product_weight_g NUMERIC,
    units_per_carton INTEGER, -- Replaced qty_per_carton to match code usage
    cartons_per_pallet INTEGER, -- Replaced qty_per_pallet
    logistics_barcode TEXT, -- 바코드 추가
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;

-- Policies (Public Read, Public Insert/Update for demo/admin simplicity)
CREATE POLICY "Public Read Logistics" ON public.product_logistics_specs FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Logistics" ON public.product_logistics_specs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Logistics" ON public.product_logistics_specs FOR UPDATE TO anon USING (true);

COMMENT ON TABLE public.product_logistics_specs IS 'Logistics specifications for products';
