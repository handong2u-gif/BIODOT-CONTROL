-- [긴급 수정] 물류 스펙 테이블 권한 및 컬럼 강제 설정

-- 1. 테이블이 없으면 생성 (기존 컬럼 포함)
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

-- 2. 바코드 컬럼이 없으면 추가 (안전한 실행)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_logistics_specs' AND column_name = 'logistics_barcode') THEN
        ALTER TABLE public.product_logistics_specs ADD COLUMN logistics_barcode TEXT;
    END IF;
END $$;

-- 3. RLS 정책 초기화 및 재설정 (권한 문제 해결의 핵심)
ALTER TABLE public.product_logistics_specs ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Public Read Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Insert Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Update Logistics" ON public.product_logistics_specs;
DROP POLICY IF EXISTS "Public Delete Logistics" ON public.product_logistics_specs;

-- 모든 사용자(anon 포함)에게 권한 부여
CREATE POLICY "Public Read Logistics" ON public.product_logistics_specs FOR SELECT TO anon USING (true);
CREATE POLICY "Public Insert Logistics" ON public.product_logistics_specs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public Update Logistics" ON public.product_logistics_specs FOR UPDATE TO anon USING (true);
CREATE POLICY "Public Delete Logistics" ON public.product_logistics_specs FOR DELETE TO anon USING (true);

-- 4. 권한 GRANTS (Postgres 레벨 권한)
GRANT ALL ON TABLE public.product_logistics_specs TO anon;
GRANT ALL ON TABLE public.product_logistics_specs TO authenticated;
GRANT ALL ON TABLE public.product_logistics_specs TO service_role;

-- 시퀀스 권한 문제 해결 (id 자동증가 오류 방지)
GRANT ALL ON SEQUENCE product_logistics_specs_id_seq TO anon;
GRANT ALL ON SEQUENCE product_logistics_specs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE product_logistics_specs_id_seq TO service_role;
