-- Create clients table based on the fields in src/pages/Clients.tsx

CREATE TABLE IF NOT EXISTS public.clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT NOT NULL, -- VIP, A, B, C
    contact TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    recent_visit DATE,
    outstanding_balance TEXT, -- Storing as text for now to match "₩12,500,000" format, but NUMERIC is better
    status TEXT DEFAULT 'active', -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous read access (for demo purposes)
CREATE POLICY "Allow public read access" ON public.clients
FOR SELECT TO anon
USING (true);

-- Insert dummy data matching the hardcoded data in Clients.tsx
INSERT INTO public.clients (name, grade, contact, phone, email, address, recent_visit, outstanding_balance, status)
VALUES
    ('코스트코 코리아', 'VIP', '김담당', '02-1234-5678', 'contact@costco.kr', '서울시 강남구 역삼동', '2024-12-10', '₩12,500,000', 'active'),
    ('롯데마트', 'A', '이과장', '02-2345-6789', 'buyer@lotte.kr', '서울시 송파구 잠실동', '2024-12-08', '₩8,200,000', 'active'),
    ('이마트 에브리데이', 'A', '박대리', '02-3456-7890', 'md@emart.kr', '경기도 성남시 분당구', '2024-12-05', '₩5,800,000', 'active'),
    ('GS25 본사', 'B', '최팀장', '02-4567-8901', 'purchase@gs25.kr', '서울시 영등포구 여의도동', '2024-11-28', '₩3,200,000', 'active'),
    ('홈플러스', 'B', '정과장', '02-5678-9012', 'buyer@homeplus.kr', '서울시 강서구 마곡동', '2024-11-25', '₩0', 'inactive');

-- Create COUNTRY_MASTER table (Design Source: BIODOT_MVP_RAW_ONLY)
CREATE TABLE IF NOT EXISTS public.country_master (
    country_name TEXT PRIMARY KEY, -- 국가명 (PK)
    iso2 TEXT, -- ISO2 Code
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create RAW_MATERIALS table (Design Source: BIODOT_MVP_RAW_ONLY)
CREATE TABLE IF NOT EXISTS public.raw_materials (
    id TEXT PRIMARY KEY, -- 원료ID (PK), e.g., BD-RM-000001
    name TEXT NOT NULL, -- 제품명
    origin_country TEXT NOT NULL REFERENCES public.country_master(country_name), -- 원산지(국가), FK
    price_effective_date DATE NOT NULL, -- 가격적용일
    supply_price NUMERIC NOT NULL, -- 공급가(KRW·VAT포함)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Unique constraint: Same product, same country, same date must be unique
    CONSTRAINT unique_product_origin_date UNIQUE (name, origin_country, price_effective_date),
    
    -- ID format check (simple regex check if supported, or handled in app logic. Postgres supports regex in check)
    CONSTRAINT check_id_format CHECK (id ~ '^BD-RM-[0-9]{6}$')
);

-- Enable RLS
ALTER TABLE public.country_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_materials ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access" ON public.country_master FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public read access" ON public.raw_materials FOR SELECT TO anon USING (true);

-- Insert dummy data for COUNTRY_MASTER
INSERT INTO public.country_master (country_name, iso2)
VALUES
    ('뉴질랜드', 'NZ'),
    ('러시아', 'RU'),
    ('대한민국', 'KR'),
    ('미국', 'US');

-- Insert dummy data for RAW_MATERIALS
INSERT INTO public.raw_materials (id, name, origin_country, price_effective_date, supply_price)
VALUES
    ('BD-RM-000001', '뉴질랜드 녹용 분골특 600g', '뉴질랜드', '2025-12-15', 1100000),
    ('BD-RM-000002', '러시아 녹용 상대R 1kg', '러시아', '2025-12-15', 450000);
