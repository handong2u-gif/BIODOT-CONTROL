-- [수정 완료 V2] 시퀀스 이름 오류 해결 버전

-- 1. 테이블이 없으면 생성
CREATE TABLE IF NOT EXISTS public.product_logistics_specs (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.finished_goods(id) ON DELETE CASCADE,
    product_weight_g NUMERIC,
    carton_weight_kg NUMERIC,
    carton_width_mm NUMERIC,
    carton_depth_mm NUMERIC,
    carton_height_mm NUMERIC,
    units_per_carton INTEGER,
    cartons_per_pallet INTEGER,
    logistics_barcode TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 바코드 컬럼 추가 (안전한 실행)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_logistics_specs' AND column_name = 'logistics_barcode') THEN
        ALTER TABLE public.product_logistics_specs ADD COLUMN logistics_barcode TEXT;
    END IF;
END $$;

-- 3. RLS 정책 재설정
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Insert Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Update Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Delete Logistics" ON public.product_logistics_specs;

CREATE POLICY "Public Read Logistics" ON public.product_logistics_specs FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Logistics" ON public.product_logistics_specs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Logistics" ON public.product_logistics_specs FOR UPDATE TO anon USING (true);
CREATE POLICY "Public Delete Logistics" ON public.product_logistics_specs FOR DELETE TO anon USING (true);

-- 4. 권한 부여 (오류가 났던 시퀀스 이름을 직접 지정하지 않고 전체 권한 부여)
GRANT ALL ON TABLE public.product_logistics_specs TO anon;
GRANT ALL ON TABLE public.product_logistics_specs TO service_role;
GRANT ALL ON TABLE public.product_logistics_specs TO authenticated;

-- [중요] 시퀀스 권한 오류 해결: 특정 이름을 찾지 않고, 스키마 내 모든 시퀀스에 권한 부여
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
