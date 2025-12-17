-- Based on BIODOT_MVP_RAW_ONLY v0.4
-- Table: raw_materials

CREATE TABLE IF NOT EXISTS public.raw_materials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL, -- 제품명
    origin_country TEXT NOT NULL, -- 원산지(국가)
    supply_price NUMERIC NOT NULL DEFAULT 0, -- 공급가(KRW·VAT포함)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Public Access Policies
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.raw_materials FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.raw_materials FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON public.raw_materials FOR DELETE TO anon USING (true);

-- Insert Example Data (from JSON spec)
INSERT INTO public.raw_materials (name, origin_country, supply_price)
VALUES 
('뉴질랜드 녹용 분골특 600g', '뉴질랜드', 1100000),
('러시아 녹용 상대R 1kg', '러시아', 450000);
