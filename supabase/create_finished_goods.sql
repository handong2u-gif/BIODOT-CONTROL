-- Create finished_goods table
CREATE TABLE IF NOT EXISTS public.finished_goods (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    image TEXT DEFAULT '📦',
    wholesale_price NUMERIC DEFAULT 0,
    retail_price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    status TEXT CHECK (status IN ('active', 'out_of_stock')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.finished_goods ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (for MVP simplicity)
CREATE POLICY "Allow public read access" ON public.finished_goods FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON public.finished_goods FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.finished_goods FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON public.finished_goods FOR DELETE TO anon USING (true);

-- Insert some dummy data if empty
INSERT INTO public.finished_goods (name, sku, category, wholesale_price, retail_price, stock, status)
SELECT '프로바이오틱스 데일리', 'PROD-001', '유산균', 15000, 22500, 100, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.finished_goods);

INSERT INTO public.finished_goods (name, sku, category, wholesale_price, retail_price, stock, status)
SELECT '비타민C 1000', 'PROD-002', '비타민', 8000, 12000, 50, 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.finished_goods WHERE sku = 'PROD-002');
