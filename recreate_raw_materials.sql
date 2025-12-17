-- Recreate raw_materials table with robust defaults (Auto-ID)

DROP TABLE IF EXISTS public.raw_materials;

CREATE TABLE public.raw_materials (
    -- ID: Use provided ID or generate a new one automatically (e.g. RM-20241217...)
    id TEXT PRIMARY KEY DEFAULT ('RM-' || to_char(now(), 'YYMMDDHH24MISS') || '-' || floor(random() * 10000)::text),
    product_name TEXT,
    spec TEXT,
    origin_country TEXT,
    wholesale_a NUMERIC,
    retail_price NUMERIC,
    cost_blind NUMERIC,
    expiry_date DATE,
    inbound_date DATE,
    thumbnail_url TEXT,
    cert_doc_url TEXT,
    report_doc_url TEXT,
    intro_doc_url TEXT,
    qty_carton TEXT,
    qty_container TEXT,
    active_clients TEXT,
    inactive_clients TEXT,
    unpaid_balance TEXT,
    last_check_date DATE,
    competitor_comp TEXT,
    memo TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.raw_materials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.raw_materials FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON public.raw_materials FOR DELETE TO anon USING (true);
