-- Recreate raw_materials table with requested schema

-- Drop existing table to start fresh (Data will be wiped, which matches 'Reset' workflow)
DROP TABLE IF EXISTS public.raw_materials;

-- Create new table matching the user provided header list
CREATE TABLE public.raw_materials (
    id TEXT PRIMARY KEY, -- User provided ID or generated
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
    qty_container TEXT, -- New field
    active_clients TEXT,
    inactive_clients TEXT, -- New field
    unpaid_balance TEXT, -- New field (maybe numeric later, text for flexibility now)
    last_check_date DATE, -- New field
    competitor_comp TEXT, -- New field
    memo TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create policies (Open access for simplicity as requested)
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.raw_materials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.raw_materials FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON public.raw_materials FOR DELETE TO anon USING (true);
